from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.crops.service import crop_service
from app.data.crops_dataset import CROPS_DATA
from app.schemas.schemas import CropCalendarOut, MonthCalendarInfo

router = APIRouter(prefix="/calendar", tags=["Crop Calendar"])

BS_MONTH_NAMES = {
    1: ("January", "पुष/माघ", "Magh"),
    2: ("February", "माघ/फागुन", "Falgun"),
    3: ("March", "फागुन/चैत", "Chaitra"),
    4: ("April", "चैत/बैशाख", "Baishakh"),
    5: ("May", "बैशाख/जेठ", "Jestha"),
    6: ("June", "जेठ/असार", "Ashadh"),
    7: ("July", "असार/साउन", "Shrawan"),
    8: ("August", "साउन/भदौ", "Bhadra"),
    9: ("September", "भदौ/असोज", "Ashoj"),
    10: ("October", "असोज/कार्तिक", "Kartik"),
    11: ("November", "कार्तिक/मंसिर", "Mangsir"),
    12: ("December", "मंसिर/पुष", "Poush")
}

@router.get("/{crop_slug}", response_model=CropCalendarOut)
def get_crop_calendar(crop_slug: str, db: Session = Depends(get_db)):
    crop_data = None
    for c in CROPS_DATA:
        if c["slug"] == crop_slug:
            crop_data = c
            break

    if not crop_data:
        raise HTTPException(status_code=404, detail=f"Calendar data for '{crop_slug}' not found.")

    t_list = []
    for m in crop_data.get("tunnel_calendar", []):
        m_idx = m["month_index"]
        names = BS_MONTH_NAMES.get(m_idx, (m["month_name_en"], m["month_name_ne"], m["bs_month_name"]))
        t_list.append(MonthCalendarInfo(
            month_index=m_idx,
            month_name_en=names[0],
            month_name_ne=names[1],
            bs_month_name=names[2],
            status=m["status"]
        ))

    o_list = []
    for m in crop_data.get("open_field_calendar", []):
        m_idx = m["month_index"]
        names = BS_MONTH_NAMES.get(m_idx, (m["month_name_en"], m["month_name_ne"], m["bs_month_name"]))
        o_list.append(MonthCalendarInfo(
            month_index=m_idx,
            month_name_en=names[0],
            month_name_ne=names[1],
            bs_month_name=names[2],
            status=m["status"]
        ))

    return CropCalendarOut(
        crop_slug=crop_data["slug"],
        crop_name_en=crop_data["name_en"],
        crop_name_ne=crop_data["name_ne"],
        tunnel_calendar=t_list,
        open_field_calendar=o_list,
        notes_en=f"Tunnel cultivation shifts the harvest window 30-45 days ahead of open-field systems.",
        notes_ne=f"टनेल खेतीले खुला खेतको तुलनामा फसल ३० देखि ४५ दिन अगावै वा पछाडि सम्म लम्ब्याउन मद्दत गर्छ।"
    )
