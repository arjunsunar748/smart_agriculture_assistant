from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.data.nepal_geo import PROVINCES, DISTRICTS_DATA, get_district_info
from app.schemas.schemas import ProvinceOut, DistrictOut

router = APIRouter(prefix="/geo", tags=["Nepal Geography"])

@router.get("/provinces", response_model=List[ProvinceOut])
def get_provinces():
    return [
        ProvinceOut(
            id=p["id"],
            name=p["name"],
            name_ne=p["name_ne"],
            districts=p["districts"]
        ) for p in PROVINCES
    ]

@router.get("/districts", response_model=List[DistrictOut])
def get_districts(province_id: int = Query(None, description="Optional province ID filter")):
    results = []
    for d_name, info in DISTRICTS_DATA.items():
        if province_id and info["province_id"] != province_id:
            continue
        results.append(DistrictOut(
            id=d_name.lower().replace(" ", "_"),
            name=d_name,
            name_ne=info["name_ne"],
            province_id=info["province_id"],
            province_name=info["province_name"],
            latitude=info["lat"],
            longitude=info["lon"],
            elevation_m=info["elevation"],
            ecological_belt=info["ecological_belt"],
            municipalities=info["municipalities"]
        ))
    results.sort(key=lambda x: x.name)
    return results

@router.get("/district/{name}", response_model=DistrictOut)
def get_single_district(name: str):
    info = get_district_info(name)
    return DistrictOut(
        id=info["name"].lower().replace(" ", "_"),
        name=info["name"],
        name_ne=info.get("name_ne", info["name"]),
        province_id=info["province_id"],
        province_name=info["province_name"],
        latitude=info["lat"],
        longitude=info["lon"],
        elevation_m=info["elevation"],
        ecological_belt=info["ecological_belt"],
        municipalities=info["municipalities"]
    )
