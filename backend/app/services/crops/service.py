from sqlalchemy.orm import Session
from app.models.models import Crop, CropVariety, CropCalendar
from app.data.crops_dataset import CROPS_DATA
from typing import List, Optional

class CropService:

    @staticmethod
    def seed_initial_crops(db: Session):
        """Seed the database with the comprehensive 17 crops if empty."""
        existing_count = db.query(Crop).count()
        if existing_count > 0:
            return

        for data in CROPS_DATA:
            crop = Crop(
                slug=data["slug"],
                name_en=data["name_en"],
                name_ne=data["name_ne"],
                scientific_name=data["scientific_name"],
                category=data["category"],
                suitable_temp_min=data["suitable_temp_min"],
                suitable_temp_max=data["suitable_temp_max"],
                base_temp=data["base_temp"],
                optimal_humidity_min=data["optimal_humidity_min"],
                optimal_humidity_max=data["optimal_humidity_max"],
                soil_type=data["soil_type"],
                soil_ph_min=data["soil_ph_min"],
                soil_ph_max=data["soil_ph_max"],
                water_requirement=data["water_requirement"],
                sunlight_hours=data["sunlight_hours"],
                growing_duration_days=data["growing_duration_days"],
                seedling_duration_days=data["seedling_duration_days"],
                planting_seasons_tunnel=data["planting_seasons_tunnel"],
                planting_seasons_open=data["planting_seasons_open"],
                harvest_seasons=data["harvest_seasons"],
                tunnel_suitability_baseline=data["tunnel_suitability_baseline"],
                open_field_suitability_baseline=data["open_field_suitability_baseline"],
                expected_yield_kg_per_sqm=data["expected_yield_kg_per_sqm"],
                approx_production_cost_per_sqm=data["approx_production_cost_per_sqm"],
                icon_emoji=data["icon_emoji"],
                description_en=data["description_en"],
                description_ne=data["description_ne"],
                common_diseases=data.get("common_diseases", []),
                common_pests=data.get("common_pests", []),
                fertilizer_requirements=data.get("fertilizer_requirements", {})
            )
            db.add(crop)
            db.flush()

            # Add varieties
            for v in data.get("varieties", []):
                variety = CropVariety(
                    crop_id=crop.id,
                    variety_name=v["variety_name"],
                    variety_type=v.get("variety_type", "hybrid"),
                    characteristics=v.get("characteristics", ""),
                    maturity_days=v.get("maturity_days", data["growing_duration_days"])
                )
                db.add(variety)

            # Add calendars
            if "tunnel_calendar" in data:
                t_cal = CropCalendar(
                    crop_id=crop.id,
                    farming_method="tunnel",
                    best_months=[m["month_index"] for m in data["tunnel_calendar"] if m["status"] == "best"],
                    acceptable_months=[m["month_index"] for m in data["tunnel_calendar"] if m["status"] == "acceptable"],
                    poor_months=[m["month_index"] for m in data["tunnel_calendar"] if m["status"] == "poor"],
                    notes=f"Tunnel cultivation calendar for {data['name_en']}"
                )
                db.add(t_cal)

            if "open_field_calendar" in data:
                o_cal = CropCalendar(
                    crop_id=crop.id,
                    farming_method="open_field",
                    best_months=[m["month_index"] for m in data["open_field_calendar"] if m["status"] == "best"],
                    acceptable_months=[m["month_index"] for m in data["open_field_calendar"] if m["status"] == "acceptable"],
                    poor_months=[m["month_index"] for m in data["open_field_calendar"] if m["status"] == "poor"],
                    notes=f"Open-field cultivation calendar for {data['name_en']}"
                )
                db.add(o_cal)

        db.commit()

    @staticmethod
    def get_all_crops(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[Crop]:
        query = db.query(Crop)
        if category:
            query = query.filter(Crop.category == category)
        if search:
            s = f"%{search}%"
            query = query.filter((Crop.name_en.ilike(s)) | (Crop.name_ne.ilike(s)) | (Crop.slug.ilike(s)))
        return query.all()

    @staticmethod
    def get_crop_by_slug(db: Session, slug: str) -> Optional[Crop]:
        return db.query(Crop).filter(Crop.slug == slug).first()

    @staticmethod
    def get_crop_by_id(db: Session, crop_id: int) -> Optional[Crop]:
        return db.query(Crop).filter(Crop.id == crop_id).first()

crop_service = CropService()
