import datetime
from typing import Optional, Dict
from app.data.crops_dataset import CROPS_DATA
from app.data.offseason_market_data import get_offseason_crop_data
from app.schemas.offseason_schemas import WhatIfSimulateRequest, WhatIfSimulateResponse, ItemizedCostBreakdownOut
from app.services.offseason.planner import calculate_itemized_costs, MONTH_NAMES

class WhatIfSimulatorService:
    def simulate(self, req: WhatIfSimulateRequest) -> WhatIfSimulateResponse:
        # Find crop metadata
        crop_raw = next((c for c in CROPS_DATA if c["slug"] == req.crop_slug), None)
        if not crop_raw:
            crop_raw = CROPS_DATA[0] # Default fallback
            
        off_data = get_offseason_crop_data(crop_raw["slug"])
        stages = off_data["growth_stages"]
        
        # Calculate planting date and expected harvest date
        if req.planting_date:
            try:
                plant_dt = datetime.datetime.strptime(req.planting_date, "%Y-%m-%d").date()
            except ValueError:
                plant_dt = datetime.date.today()
        else:
            plant_dt = datetime.date.today()
            
        days_to_harvest = int((stages["first_harvest_min_days"] + stages["first_harvest_max_days"]) / 2)
        harvest_dt = plant_dt + datetime.timedelta(days=days_to_harvest)
        harvest_month = harvest_dt.month
        
        # Base historical price for that harvest month
        base_price = off_data["monthly_avg_prices"].get(harvest_month, 65.0)
        
        # Base yield & cost for tunnel
        area = max(10.0, req.tunnel_area_sqm)
        base_yield_kg = round(area * crop_raw["expected_yield_kg_per_sqm"] * 1.1, 1)
        base_cost_npr = round(area * crop_raw["approx_production_cost_per_sqm"], 0)
        base_revenue_npr = round(base_yield_kg * base_price, 0)
        base_profit_npr = round(base_revenue_npr - base_cost_npr, 0)
        base_roi_pct = round((base_profit_npr / max(1.0, base_cost_npr)) * 100.0, 1)
        
        # Apply what-if adjustments
        price_multiplier = 1.0 + (req.price_change_pct / 100.0)
        yield_multiplier = 1.0 + (req.yield_change_pct / 100.0)
        cost_multiplier = 1.0 + (req.cost_change_pct / 100.0)
        
        simulated_price = max(5.0, round(base_price * price_multiplier, 1))
        simulated_yield = max(1.0, round(base_yield_kg * yield_multiplier, 1))
        
        # Factor in post-harvest loss and transport
        raw_loss = getattr(req, "post_harvest_loss_pct", None)
        loss_pct = raw_loss if raw_loss is not None else max(0.0, 5.0 + getattr(req, "loss_change_pct", 0.0))
        marketable_yield_kg = round(simulated_yield * (1.0 - (loss_pct / 100.0)), 1)
        raw_transport = getattr(req, "transport_cost_per_kg", None)
        t_rate = raw_transport if raw_transport is not None else max(0.5, 3.0 * (1.0 + getattr(req, "transport_cost_change_pct", 0.0) / 100.0))
        transport_cost_npr = round(marketable_yield_kg * t_rate, 0)

        
        if req.custom_cost_breakdown and sum(req.custom_cost_breakdown.values()) > 0:
            simulated_cost = round(sum(req.custom_cost_breakdown.values()), 0)
        else:
            simulated_cost = max(500.0, round(base_cost_npr * cost_multiplier, 0))
            
        cost_breakdown = calculate_itemized_costs(simulated_cost)
        
        simulated_revenue = round(marketable_yield_kg * simulated_price, 0)
        simulated_profit = round(simulated_revenue - simulated_cost - transport_cost_npr, 0)
        profit_delta = round(simulated_profit - base_profit_npr, 0)
        simulated_roi = round((simulated_profit / max(1.0, simulated_cost + transport_cost_npr)) * 100.0, 1)
        
        # Break-even metrics
        break_even_price = round((simulated_cost + transport_cost_npr) / max(0.1, marketable_yield_kg), 1)
        break_even_yield = round((simulated_cost + transport_cost_npr) / max(0.1, simulated_price), 1)

        
        # Sensitivity verdict & risk classification
        if simulated_profit > 0 and simulated_roi >= 40.0:
            risk_level = "Low"
            verdict_en = (
                f"Highly Resilient: Even with these parameter shifts ({req.price_change_pct:+.0f}% price, {req.yield_change_pct:+.0f}% yield), "
                f"this tunnel cultivation maintains a healthy net margin of NPR {simulated_profit:,.0f} (ROI: {simulated_roi:.1f}%). "
                f"Your break-even price is NPR {break_even_price:.1f}/kg, comfortably below projected wholesale values."
            )
            verdict_ne = (
                f"अत्यन्त सुरक्षित र नाफामूलक: बजार वा लागतमा फेरबदल हुँदा पनि ({req.price_change_pct:+.0f}% मूल्य, {req.yield_change_pct:+.0f}% उत्पादन) "
                f"टनेल खेतीले रू {simulated_profit:,.0f} (प्रतिफल दर: {simulated_roi:.1f}%) को राम्रो नाफा दिन्छ। "
                f"लागत उठाउन प्रतिकेजी रू {break_even_price:.1f} मात्र भए पुग्छ।"
            )
        elif simulated_profit > 0:
            risk_level = "Medium"
            verdict_en = (
                f"Moderate Cushion: The crop remains profitable at NPR {simulated_profit:,.0f} (ROI: {simulated_roi:.1f}%), "
                f"but buffer against further market volatility is slim. "
                f"A price drop below NPR {break_even_price:.1f}/kg will incur financial losses."
            )
            verdict_ne = (
                f"मध्यम जोखिम: यो अवस्थामा सामान्य नाफा (रू {simulated_profit:,.0f}, प्रतिफल: {simulated_roi:.1f}%) "
                f"रहन्छ तर बजार थप खस्किए जोखिम बढ्नेछ। "
                f"मूल्य प्रतिकेजी रू {break_even_price:.1f} भन्दा तल झरेमा नोक्सानी हुनेछ।"
            )
        else:
            risk_level = "High"
            verdict_en = (
                f"High Financial Risk: Under these stress parameters, total costs exceed wholesale returns by "
                f"NPR {abs(simulated_profit):,.0f}. You would need a price of at least NPR {break_even_price:.1f}/kg "
                f"or a yield of {break_even_yield:,.0f} kg just to break even."
            )
            verdict_ne = (
                f"उच्च जोखिम / घाटाको अवस्था: यो परिदृश्यमा कुल उत्पादन लागत बजार आम्दानी भन्दा "
                f"रू {abs(simulated_profit):,.0f} ले बढी हुन्छ। "
                f"लागत उठाउन न्यूनतम प्रतिकेजी रू {break_even_price:.1f} वा कुल {break_even_yield:,.0f} केजी उत्पादन हुनैपर्छ।"
            )
            
        disclaimer = (
            "Scenario simulation uses standard walk-in tunnel input cost models and Kalimati Mandi seasonality curves. "
            "Actual wholesale realizations depend on local grading, post-harvest transport, and peak harvest timing."
            if req.language == "en" else
            "यो सिमुलेशन कालीमाटी बजारको ५ वर्षे मौसमी तथ्याङ्क र टनेल खेतीको औसत लागतमा आधारित छ। "
            "वास्तविक प्रतिफल स्थानीय बजारको माग, ढुवानी तथा तरकारीको गुणस्तरमा भर पर्दछ।"
        )
        
        m_name = MONTH_NAMES.get(harvest_month, ("Target Month", "लक्षित महिना"))[0 if req.language == "en" else 1]
        
        return WhatIfSimulateResponse(
            crop_slug=crop_raw["slug"],
            crop_name_en=crop_raw["name_en"],
            crop_name_ne=crop_raw["name_ne"],
            icon_emoji=crop_raw["icon_emoji"],
            tunnel_area_sqm=area,
            planting_date=plant_dt.strftime("%Y-%m-%d"),
            expected_harvest_date=harvest_dt.strftime("%Y-%m-%d"),
            harvest_month_name=m_name,
            base_price_per_kg=base_price,
            simulated_price_per_kg=simulated_price,
            price_change_pct=req.price_change_pct,
            base_yield_kg=base_yield_kg,
            simulated_yield_kg=simulated_yield,
            yield_change_pct=req.yield_change_pct,
            loss_pct=loss_pct,
            marketable_yield_kg=marketable_yield_kg,
            base_cost_npr=base_cost_npr,
            simulated_cost_npr=simulated_cost,
            cost_change_pct=req.cost_change_pct,
            transport_cost_npr=transport_cost_npr,
            cost_breakdown=cost_breakdown,

            base_revenue_npr=base_revenue_npr,
            simulated_revenue_npr=simulated_revenue,
            base_profit_npr=base_profit_npr,
            simulated_profit_npr=simulated_profit,
            profit_delta_npr=profit_delta,
            base_roi_pct=base_roi_pct,
            simulated_roi_pct=simulated_roi,
            break_even_price_per_kg=break_even_price,
            break_even_yield_kg=break_even_yield,
            sensitivity_verdict_en=verdict_en,
            sensitivity_verdict_ne=verdict_ne,
            risk_level=risk_level,
            disclaimer=disclaimer
        )

what_if_simulator = WhatIfSimulatorService()
