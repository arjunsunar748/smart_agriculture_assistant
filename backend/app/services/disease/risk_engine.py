import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.crops.service import crop_service
from app.services.weather.open_meteo import OpenMeteoProvider
from app.data.nepal_geo import get_district_info
from app.schemas.schemas import DiseaseRiskResponse, DiseaseRiskItem

weather_provider = OpenMeteoProvider()

class DiseaseRiskEngine:

    async def evaluate_risk(
        self, db: Session, crop_slug: str, district: str = "Kathmandu"
    ) -> DiseaseRiskResponse:
        crop = crop_service.get_crop_by_slug(db, crop_slug)
        if not crop:
            crop_name_en = crop_slug.title()
            crop_name_ne = crop_slug
            common_diseases = []
            common_pests = []
        else:
            crop_name_en = crop.name_en
            crop_name_ne = crop.name_ne
            common_diseases = crop.common_diseases or []
            common_pests = crop.common_pests or []

        # Weather lookup
        geo = get_district_info(district)
        wx_data = await weather_provider.get_current_and_forecast(geo["lat"], geo["lon"], geo["name"])
        current = wx_data["current"]

        temp = current["temperature"]
        rh = current["humidity"]
        rain = current["rainfall"]

        risks: List[DiseaseRiskItem] = []
        high_risk_count = 0

        # 1. Fungal blast / Blight analysis
        if rh >= 82.0 and 14.0 <= temp <= 25.0:
            f_level = "High"
            high_risk_count += 1
            f_conditions = [
                f"Sustained relative humidity at {rh:.0f}% (Exceeds 80% critical fungal spore threshold).",
                f"Moderate temperature ({temp:.1f}°C) provides optimal thermal incubation for fungal mycelium.",
                "Dew point condensation formation on plastic tunnel ceiling."
            ]
            f_actions = [
                "Open leeward side curtains by 9:00 AM daily to purge overnight condensation droplets.",
                "Discontinue overhead irrigation; maintain dry foliage.",
                "Apply preventive foliar spray of Copper Oxychloride 50 WP (2.5g/L) or Trichoderma viride.",
                "Prune lower yellowing leaves up to 30cm to facilitate bed-level airflow."
            ]
        elif rh >= 70.0:
            f_level = "Medium"
            f_conditions = [
                f"Current humidity at {rh:.0f}%; moderate spore development potential.",
                f"Ambient temperature at {temp:.1f}°C."
            ]
            f_actions = [
                "Maintain scheduled midday cross-ventilation (10:00 AM – 3:30 PM).",
                "Ensure sub-mulch drip line spacing is clear of weed blockages."
            ]
        else:
            f_level = "Low"
            f_conditions = [
                f"Low relative humidity ({rh:.0f}%); foliage dry."
            ]
            f_actions = [
                "Standard preventive scouting every 7 days."
            ]

        # Map to specific crop diseases
        target_fungal_name = "Late Blight / Downy Mildew"
        target_fungal_ne = "डढुवा / डाउनी मिल्ड्यू"
        if common_diseases:
            d0 = common_diseases[0]
            target_fungal_name = d0.get("disease_name_en", target_fungal_name)
            target_fungal_ne = d0.get("disease_name_ne", target_fungal_ne)

        risks.append(DiseaseRiskItem(
            pathogen_type="fungal",
            disease_name_en=target_fungal_name,
            disease_name_ne=target_fungal_ne,
            risk_level=f_level,
            contributing_conditions=f_conditions,
            recommended_actions=f_actions
        ))

        # 2. Bacterial Wilt / Rot Analysis
        if temp >= 26.0 and rh >= 75.0:
            b_level = "High"
            high_risk_count += 1
            b_conditions = [
                f"High temperature ({temp:.1f}°C) combined with high soil moisture accelerates vascular bacterial multiplication."
            ]
            b_actions = [
                "Avoid over-saturating soil during warm daytime hours.",
                "Drench root zones with Pseudomonas fluorescens (5g/L).",
                "Ensure raised planting beds provide unrestricted gravitational drainage."
            ]
        else:
            b_level = "Low"
            b_conditions = [
                f"Temperature ({temp:.1f}°C) is below high bacterial virulence threshold."
            ]
            b_actions = [
                "Maintain clean pruning shears disinfected with 10% bleach solution."
            ]

        risks.append(DiseaseRiskItem(
            pathogen_type="bacterial",
            disease_name_en="Bacterial Wilt / Soft Rot",
            disease_name_ne="ब्याक्टेरियल ओइलाउने / कुहिने रोग",
            risk_level=b_level,
            contributing_conditions=b_conditions,
            recommended_actions=b_actions
        ))

        # 3. Insect Pest Vector / Mites
        if temp >= 25.0 and rh <= 65.0:
            p_level = "High"
            high_risk_count += 1
            p_conditions = [
                f"Warm, dry microclimate ({temp:.1f}°C, RH {rh:.0f}%) triggers rapid red spider mite and thrips reproduction."
            ]
            p_actions = [
                "Scout leaf undersides with a hand lens for silver stippling and webbing.",
                "Apply wettable sulfur 80% WDG (2g/L) or Neem oil 10,000 ppm (2ml/L).",
                "Dampen tunnel pathway borders to elevate baseline ambient humidity."
            ]
        else:
            p_level = "Medium"
            p_conditions = [
                "Moderate temperature supports steady whitefly and aphid populations."
            ]
            p_actions = [
                "Hang yellow sticky cards (1 card per 20 m²) at crop canopy level.",
                "Inspect growing shoot tips weekly."
            ]

        pest_name = common_pests[0].get("pest_name_en", "Whiteflies & Aphids") if common_pests else "Whiteflies & Aphids"
        pest_name_ne = common_pests[0].get("pest_name_ne", "सेतो झिँगा तथा लाही") if common_pests else "सेतो झिँगा तथा लाही"

        risks.append(DiseaseRiskItem(
            pathogen_type="pest",
            disease_name_en=pest_name,
            disease_name_ne=pest_name_ne,
            risk_level=p_level,
            contributing_conditions=p_conditions,
            recommended_actions=p_actions
        ))

        overall_pressure = "Critical" if high_risk_count >= 2 else ("Elevated" if high_risk_count == 1 else "Normal")

        return DiseaseRiskResponse(
            crop_slug=crop_slug,
            crop_name_en=crop_name_en,
            crop_name_ne=crop_name_ne,
            district=district,
            evaluated_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            current_weather={
                "temperature": temp,
                "humidity": rh,
                "rainfall": rain,
                "source": "Open-Meteo Telemetry"
            },
            overall_disease_pressure=overall_pressure,
            risks=risks
        )

disease_risk_engine = DiseaseRiskEngine()
