from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Farm, Field, Alert
from app.schemas.schemas import FarmCreate, FarmOut, AlertOut
import datetime

router = APIRouter(prefix="/farms", tags=["Farm Management"])

@router.get("", response_model=List[FarmOut])
def get_all_farms(db: Session = Depends(get_db)):
    farms = db.query(Farm).all()
    if not farms:
        # Create a default demonstration farm
        demo_farm = Farm(
            name="Kathmandu Valley Model Tunnel Farm",
            province="Bagmati Province",
            district="Kathmandu",
            municipality="Kirtipur",
            ward="4",
            latitude=27.6667,
            longitude=85.3167,
            elevation_m=1350.0,
            total_area_sqm=750.0
        )
        db.add(demo_farm)
        db.flush()

        field1 = Field(
            farm_id=demo_farm.id,
            name="Tunnel A - Walk-in Bamboo (20m x 5m)",
            farming_method="tunnel",
            tunnel_type="walk_in_bamboo",
            area_sqm=250.0,
            plastic_spec="150_micron_uv",
            soil_type="sandy_loam",
            irrigation_type="drip"
        )
        field2 = Field(
            farm_id=demo_farm.id,
            name="Tunnel B - High Polyhouse (25m x 6m)",
            farming_method="tunnel",
            tunnel_type="polyhouse",
            area_sqm=300.0,
            plastic_spec="200_micron_uv_diffused",
            soil_type="loamy",
            irrigation_type="drip"
        )
        field3 = Field(
            farm_id=demo_farm.id,
            name="Open Plot C - Raised Beds",
            farming_method="open_field",
            tunnel_type="none",
            area_sqm=200.0,
            plastic_spec="none",
            soil_type="clay_loam",
            irrigation_type="furrow"
        )
        db.add_all([field1, field2, field3])

        # Demo alerts
        alert1 = Alert(
            farm_id=demo_farm.id,
            alert_type="weather",
            severity="warning",
            title="Night Temperature Drop Expected",
            title_ne="रातीको तापक्रम घट्ने सम्भावना",
            message="Night temperatures forecasted to drop towards 9°C. Seal tunnel curtains by 3:45 PM.",
            message_ne="रातीको तापक्रम ९ डिग्री सम्म झर्न सक्ने हुनाले दिउँसो ३:४५ भित्र टनेलको पर्दा बन्द गर्नुहोस्।"
        )
        alert2 = Alert(
            farm_id=demo_farm.id,
            alert_type="market",
            severity="info",
            title="Cucumber Wholesale Price Surge",
            title_ne="काँक्रोको थोक मूल्य वृद्धि",
            message="Parthenocarpic cucumber wholesale price gained +15% this week reaching NPR 92/kg.",
            message_ne="कालीमाटी बजारमा काँक्रोको थोक मूल्य १५% ले बढेर रु ९२/केजी पुगेको छ।"
        )
        db.add_all([alert1, alert2])
        db.commit()
        farms = [demo_farm]

    return farms

@router.post("", response_model=FarmOut)
def create_farm(farm_in: FarmCreate, db: Session = Depends(get_db)):
    farm = Farm(
        name=farm_in.name,
        province=farm_in.province,
        district=farm_in.district,
        municipality=farm_in.municipality,
        ward=farm_in.ward,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        elevation_m=farm_in.elevation_m,
        total_area_sqm=farm_in.total_area_sqm
    )
    db.add(farm)
    db.flush()

    if farm_in.fields:
        for f in farm_in.fields:
            field = Field(
                farm_id=farm.id,
                name=f.name,
                farming_method=f.farming_method,
                tunnel_type=f.tunnel_type,
                area_sqm=f.area_sqm,
                plastic_spec=f.plastic_spec,
                soil_type=f.soil_type,
                irrigation_type=f.irrigation_type
            )
            db.add(field)

    db.commit()
    db.refresh(farm)
    return farm

@router.delete("/{farm_id}")
def delete_farm(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    db.delete(farm)
    db.commit()
    return {"message": "Farm deleted successfully"}

@router.get("/alerts", response_model=List[AlertOut])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(10).all()
    if not alerts:
        a1 = Alert(
            alert_type="weather",
            severity="warning",
            title="Late Afternoon Condensation Risk",
            title_ne="टनेल भित्र आद्रता जोखिम",
            message="Relative humidity exceeding 80% at night. Morning side ventilation advised.",
            message_ne="रातीको आद्रता ८०% भन्दा बढी हुने भएकाले बिहान ९ बजे साइड पर्दा खोल्नुहोस्।"
        )
        a2 = Alert(
            alert_type="market",
            severity="info",
            title="High Off-Season Tomato Demand",
            title_ne="टनेल गोलभेडाको उच्च माग",
            message="Mid-hill open field tomato arrivals dropping; tunnel crops commanding NPR 85-95/kg.",
            message_ne="खुला खेतको गोलभेडा सकिँदै गएकाले टनेल गोलभेडाले रु ८५ देखि ९५ सम्म भाउ पाइरहेको छ।"
        )
        db.add_all([a1, a2])
        db.commit()
        alerts = [a1, a2]
    return alerts
