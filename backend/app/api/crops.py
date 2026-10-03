from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.crops.service import crop_service
from app.schemas.schemas import CropOut

router = APIRouter(prefix="/crops", tags=["Crops"])

@router.get("", response_model=List[CropOut])
def get_crops(
    category: Optional[str] = Query(None, description="Crop category filter (solanaceous, cucurbit, brassica, etc.)"),
    search: Optional[str] = Query(None, description="Search by name or slug"),
    db: Session = Depends(get_db)
):
    crops = crop_service.get_all_crops(db, category=category, search=search)
    if not crops:
        crop_service.seed_initial_crops(db)
        crops = crop_service.get_all_crops(db, category=category, search=search)
    return crops

@router.get("/{slug}", response_model=CropOut)
def get_crop_detail(slug: str, db: Session = Depends(get_db)):
    crop = crop_service.get_crop_by_slug(db, slug)
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop with slug '{slug}' not found.")
    return crop
