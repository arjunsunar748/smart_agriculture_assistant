from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.profit.calculator import profit_calculator
from app.schemas.schemas import ProfitCalculationRequest, ProfitCalculationResponse

router = APIRouter(prefix="/profit", tags=["Profit Calculator"])

@router.post("/calculate", response_model=ProfitCalculationResponse)
def calculate_profit(req: ProfitCalculationRequest, db: Session = Depends(get_db)):
    result = profit_calculator.calculate(db, req)
    return result
