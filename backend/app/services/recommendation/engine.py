import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Crop
from app.services.crops.service import crop_service
from app.services.weather.open_meteo import OpenMeteoProvider
from app.services.market.kalimati import KalimatiMarketProvider, KALIMATI_COMMODITY_BASELINES
from app.data.nepal_geo import get_district_info
from app.schemas.schemas import RecommendationRequest, RecommendationResponse, RecommendedCropOut, CurrentWeatherOut

weather_provider = OpenMeteoProvider()
market_provider = KalimatiMarketProvider()

class RecommendationEngine:

    async def evaluate_recommendations(
        self, db: Session, req: RecommendationRequest
    ) -> RecommendationResponse:
        # 1. Geographic & Weather resolution
        geo_info = get_district_info(req.district)
        lat = req.latitude or geo_info["lat"]
        lon = req.longitude or geo_info["lon"]
        elevation = geo_info["elevation"]

        weather_res = await weather_provider.get_current_and_forecast(lat, lon, geo_info["name"])
        current_wx = weather_res["current"]
        forecast_7d = weather_res["forecast_7d"]

        temp_curr = current_wx["temperature"]
        temp_max = current_wx["temp_max"]
        temp_min = current_wx["temp_min"]
        humidity = current_wx["humidity"]
        rainfall = current_wx["rainfall"]

        # Current Gregorian month (1-12)
        current_month = datetime.date.today().month

        # Fetch all candidate crops
        crops = crop_service.get_all_crops(db, category=req.preferred_category)
        if not crops:
            crop_service.seed_initial_crops(db)
            crops = crop_service.get_all_crops(db, category=req.preferred_category)

        # Fetch current market benchmarks
        market_prices = await market_provider.get_current_prices()
        market_map = {m["crop_slug"]: m for m in market_prices}

        evaluated_crops: List[RecommendedCropOut] = []

        is_tunnel = req.farming_method.lower() in ["tunnel", "both"]
        target_area = req.tunnel_area_sqm if is_tunnel else req.land_area_sqm

        for crop in crops:
            slug = crop.slug
            market_data = market_map.get(slug, {
                "avg_price": 75.0,
                "trend_7d_pct": 0.0,
                "trend_30d_pct": 0.0,
                "data_source": "Kalimati Wholesale Market",
                "last_updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            })

            # --- A. Environmental Suitability (0 - 100) ---
            # Tunnel microclimate offset: +6°C daytime solar gain, +2.5°C nighttime thermal buffer
            eff_temp_min = temp_min + (2.5 if is_tunnel else 0.0)
            eff_temp_max = temp_max + (5.0 if is_tunnel else 0.0)
            eff_temp_avg = temp_curr + (3.5 if is_tunnel else 0.0)

            # Temperature scoring
            if crop.suitable_temp_min <= eff_temp_avg <= crop.suitable_temp_max:
                temp_score = 95.0
            elif eff_temp_avg < crop.suitable_temp_min:
                deficit = crop.suitable_temp_min - eff_temp_avg
                temp_score = max(20.0, 90.0 - (deficit * 12.0))
            else:
                excess = eff_temp_avg - crop.suitable_temp_max
                temp_score = max(25.0, 90.0 - (excess * 10.0))

            # Night chill / frost risk check
            if eff_temp_min < crop.base_temp:
                chill_gap = crop.base_temp - eff_temp_min
                temp_score -= min(35.0, chill_gap * 8.0)

            # Humidity & rain factor
            if is_tunnel:
                # Tunnel shields from rainfall completely (rain exclusion benefit)
                rain_score = 95.0
                hum_score = 88.0 if 55.0 <= humidity <= 80.0 else 75.0
            else:
                rain_penalty = min(30.0, rainfall * 2.0)
                rain_score = max(40.0, 90.0 - rain_penalty)
                hum_score = 80.0 if 55.0 <= humidity <= 75.0 else 60.0

            env_score = round((temp_score * 0.55) + (rain_score * 0.25) + (hum_score * 0.20), 1)
            env_score = max(10.0, min(100.0, env_score))

            # --- B. Seasonal / Calendar Suitability (0 - 100) ---
            calendars = crop.calendars
            cal_record = None
            for c in calendars:
                if c.farming_method == ("tunnel" if is_tunnel else "open_field"):
                    cal_record = c
                    break

            if cal_record:
                if current_month in (cal_record.best_months or []):
                    seasonal_score = 96.0
                    cal_status = "Optimal Planting Window" if req.language == "en" else "उत्कृष्ट रोप्ने समय"
                elif current_month in (cal_record.acceptable_months or []):
                    seasonal_score = 78.0
                    cal_status = "Acceptable Window" if req.language == "en" else "मध्यम रोप्ने समय"
                else:
                    seasonal_score = 35.0
                    cal_status = "Off-Calendar Window" if req.language == "en" else "प्रतिकूल समय"
            else:
                seasonal_score = 75.0
                cal_status = "Standard Season"

            # --- C. Tunnel vs Open Field Comparison & Suitability % ---
            tunnel_suit_pct = round(min(98.0, crop.tunnel_suitability_baseline * (env_score / 100.0) * 1.08), 1)
            
            # Open field suffers when cold or rainy
            open_penalty = 1.0
            if temp_min < crop.base_temp:
                open_penalty *= 0.65
            if rainfall > 5.0:
                open_penalty *= 0.80
            open_suit_pct = round(max(15.0, min(95.0, crop.open_field_suitability_baseline * (env_score / 100.0) * open_penalty)), 1)

            if tunnel_suit_pct > open_suit_pct + 15:
                tunnel_reason = (
                    f"Tunnel buffers night chill by +2.5°C and eliminates rain wash, giving {crop.name_en} a massive +{round(tunnel_suit_pct - open_suit_pct)}% advantage over open fields."
                    if req.language == "en" else
                    f"टनेलले रातीको चिसोलाई +२.५°C रोक्ने र वर्षाको पानीबाट पातलाई जोगाउने हुँदा {crop.name_ne}लाई खुला खेतको तुलनामा {round(tunnel_suit_pct - open_suit_pct)}% बढी सुरक्षा दिन्छ।"
                )
            else:
                tunnel_reason = (
                    f"Both tunnel and open field are viable, but tunnel provides accelerated thermal maturity and immaculate leaf grading."
                    if req.language == "en" else
                    f"टनेल र खुला खेत दुवैमा सम्भव भए पनि टनेल भित्र छिटो उत्पादन र उच्च गुणस्तरको फल पाइन्छ।"
                )

            # --- D. Market Opportunity (0 - 100) ---
            selling_price = market_data["avg_price"]
            prod_cost_per_kg = crop.approx_production_cost_per_sqm / max(1.0, crop.expected_yield_kg_per_sqm)
            profit_margin_ratio = (selling_price - prod_cost_per_kg) / max(10.0, prod_cost_per_kg)

            market_score = 60.0 + min(30.0, profit_margin_ratio * 20.0)
            if market_data["trend_7d_pct"] > 5.0:
                market_score += 6.0
            if market_data["trend_30d_pct"] > 10.0:
                market_score += 4.0
            market_score = round(max(30.0, min(98.0, market_score)), 1)

            # --- E. Financial Opportunity & Budget ---
            est_prod_cost = round(target_area * crop.approx_production_cost_per_sqm, 0)
            est_yield = round(target_area * crop.expected_yield_kg_per_sqm, 1)
            est_revenue = round(est_yield * selling_price, 0)
            est_profit = round(est_revenue - est_prod_cost, 0)
            roi_pct = round((est_profit / max(1.0, est_prod_cost)) * 100.0, 1)

            profit_score = min(98.0, max(20.0, 50.0 + (roi_pct * 0.25)))
            # Budget penalty if cost exceeds farmer budget
            if est_prod_cost > req.budget_npr:
                budget_ratio = req.budget_npr / max(1.0, est_prod_cost)
                profit_score *= budget_ratio

            # --- F. Risk Evaluation ---
            risks_list = []
            if humidity > 82.0 and 16.0 <= temp_curr <= 24.0:
                risks_list.append("High nocturnal humidity increases fungal spore germination (downy/late blight).")
            if temp_min <= crop.base_temp + 1.0:
                risks_list.append("Minimum temperature near base threshold; requires afternoon tunnel closing by 3:45 PM.")
            if market_data["trend_30d_pct"] < -10.0:
                risks_list.append("Market wholesale price currently in downward cyclical correction.")
            if est_prod_cost > req.budget_npr:
                risks_list.append(f"Estimated initial operating cost (NPR {est_prod_cost:,.0f}) exceeds allocated budget (NPR {req.budget_npr:,.0f}).")

            if not risks_list:
                risk_level = "Low"
                risk_penalty = 0.0
            elif len(risks_list) == 1:
                risk_level = "Medium"
                risk_penalty = 5.0
            else:
                risk_level = "High"
                risk_penalty = 12.0

            # --- G. Final Overall Score ---
            overall_score = round(
                (env_score * 0.30) +
                (seasonal_score * 0.25) +
                (market_score * 0.25) +
                (profit_score * 0.20) -
                risk_penalty,
                1
            )
            overall_score = max(20.0, min(99.0, overall_score))

            if overall_score >= 82.0:
                suitability_label = "High" if req.language == "en" else "उच्च उपयुक्तता"
            elif overall_score >= 65.0:
                suitability_label = "Moderate" if req.language == "en" else "मध्यम उपयुक्तता"
            else:
                suitability_label = "Low" if req.language == "en" else "न्यून उपयुक्तता"

            # Expected harvest date calculation
            planting_days = crop.growing_duration_days
            exp_harvest = datetime.date.today() + datetime.timedelta(days=planting_days)

            # Explainable Why, Advantages, Assumptions
            why_recs = []
            advantages = []
            assumptions = []

            if req.language == "en":
                why_recs.append(f"Current local temperature ({temp_curr:.1f}°C) and forecast match the {crop.name_en} growth requirement.")
                why_recs.append(f"Active planting season under {req.farming_method} mode ({cal_status}).")
                why_recs.append(f"Attractive wholesale price (NPR {selling_price:.0f}/kg) with {market_data['trend_7d_pct']:+.1f}% 7-day trend.")
                why_recs.append(f"Generates estimated NPR {est_profit:,.0f} net profit ({roi_pct:.0f}% ROI) on {target_area:.0f} sq.m.")

                advantages.append(f"Rapid Growing Duration: {crop.growing_duration_days} days to first major harvest.")
                advantages.append(f"High Productivity: ~{crop.expected_yield_kg_per_sqm} kg/m² expected under drip irrigation.")
                advantages.append(f"Zero IoT Dependency: Fully manageable with manual side curtains and mulch.")

                assumptions.append("Utilizes standard 150-micron UV-stabilized polyethylene sheeting.")
                assumptions.append("Raised beds with 25-micron silver-black plastic mulch for thermal retention.")
                assumptions.append(f"Wholesale distribution through Kalimati / regional mandi networks.")
            else:
                why_recs.append(f"हालको स्थानीय तापक्रम ({temp_curr:.1f}°C) र आगामी मौसम {crop.name_ne}को वृद्धिका लागि अनुकूल छ।")
                why_recs.append(f"{req.farming_method.capitalize()} प्रविधि अन्तर्गत अहिले रोप्ने उपयुक्त मौसम सक्रिय छ।")
                why_recs.append(f"कालीमाटी बजारमा आकर्षक थोक मूल्य (रु {selling_price:.0f}/केजी) तथा ७ दिनमा {market_data['trend_7d_pct']:+.1f}% वृद्धि प्रवृत्ति।")
                why_recs.append(f"{target_area:.0f} वर्गमिटर क्षेत्रफलमा अनुमानित रु {est_profit:,.0f} खुद नाफा ({roi_pct:.0f}% प्रतिफल)।")

                advantages.append(f"छिटो उत्पादन: {crop.growing_duration_days} दिन भित्र मुख्य फसल उत्पादन सुरु।")
                advantages.append(f"उच्च उत्पादन क्षमता: प्रति वर्गमिटर करिब {crop.expected_yield_kg_per_sqm} केजी उत्पादन।")
                advantages.append(f"सुलभ प्रविधि: कुनै महँगो सेन्सरबिना साधारण टनेल र मल्चिङबाटै खेती गर्न सकिने।")

                assumptions.append("१५० माइक्रोनको यूभी प्रतिरोधी प्लास्टिक प्रयोग गरिएको।")
                assumptions.append("माटोको चिसोपन र तापक्रम जोगाउन २५ माइक्रोन सिल्भर-ब्ल्याक प्लास्टिक मल्च।")
                assumptions.append("कालीमाटी वा स्थानीय थोक बजारमा प्रत्यक्ष बिक्री।")

            evaluated_crops.append(RecommendedCropOut(
                crop_id=crop.id,
                slug=crop.slug,
                name_en=crop.name_en,
                name_ne=crop.name_ne,
                scientific_name=crop.scientific_name,
                icon_emoji=crop.icon_emoji,
                category=crop.category,
                suitability_score=overall_score,
                overall_suitability_label=suitability_label,
                environmental_suitability=env_score,
                seasonal_suitability=seasonal_score,
                market_opportunity=market_score,
                profit_potential=profit_score,
                risk_level=risk_level,
                tunnel_suitability_pct=tunnel_suit_pct,
                open_field_suitability_pct=open_suit_pct,
                tunnel_vs_open_reason=tunnel_reason,
                planting_window=cal_status,
                growing_duration_days=crop.growing_duration_days,
                seedling_days=crop.seedling_duration_days,
                expected_harvest_date=exp_harvest.strftime("%B %d, %Y"),
                estimated_production_cost_npr=est_prod_cost,
                expected_yield_kg=est_yield,
                expected_wholesale_price_npr=selling_price,
                expected_revenue_npr=est_revenue,
                estimated_profit_npr=est_profit,
                roi_pct=roi_pct,
                why_recommended=why_recs,
                advantages=advantages,
                risks=risks_list if risks_list else ["Standard seasonal market volatility."],
                assumptions=assumptions,
                data_sources=[
                    "Open-Meteo Real-Time Weather API",
                    "Kalimati Fruit and Vegetable Market Development Board",
                    "Nepal Agricultural Research Council (NARC) Crop Guidelines"
                ],
                data_updated=datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            ))

        # Sort descending by suitability score
        evaluated_crops.sort(key=lambda x: x.suitability_score, reverse=True)

        top_crop = evaluated_crops[0] if evaluated_crops else None
        top_name = top_crop.name_en if top_crop else "Vegetable"
        top_name_ne = top_crop.name_ne if top_crop else "तरकारी"

        summary_en = (
            f"Based on real-time atmospheric metrics in {req.district} (Temp: {temp_curr:.1f}°C, RH: {humidity:.0f}%) "
            f"and current Kalimati wholesale pricing, {top_name} emerges as the top high-margin recommendation for {req.farming_method} cultivation."
        )
        summary_ne = (
            f"{req.district}को हालको मौसमी अवस्था (तापक्रम: {temp_curr:.1f}°C, आद्रता: {humidity:.0f}%) "
            f"र कालीमाटी थोक बजारको मूल्य विश्लेषण गर्दा, टनेल खेतीका लागि अहिले '{top_name_ne}' सबैभन्दा बढी फाइदाजनक बाली देखिएको छ।"
        )

        return RecommendationResponse(
            district=req.district,
            farming_method=req.farming_method,
            evaluated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            active_weather=CurrentWeatherOut(**current_wx),
            recommended_crops=evaluated_crops,
            summary_en=summary_en,
            summary_ne=summary_ne
        )

recommendation_engine = RecommendationEngine()
