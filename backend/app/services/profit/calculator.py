from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.crops.service import crop_service
from app.services.market.kalimati import KALIMATI_COMMODITY_BASELINES
from app.schemas.schemas import ProfitCalculationRequest, ProfitCalculationResponse

AREA_CONVERSIONS_TO_SQM = {
    "ropani": 508.72,
    "aana": 31.79,
    "bigha": 6772.63,
    "kattha": 338.63,
    "sqm": 1.0,
    "hectare": 10000.0
}

class ProfitCalculatorService:

    @staticmethod
    def calculate(db: Session, req: ProfitCalculationRequest) -> ProfitCalculationResponse:
        crop = crop_service.get_crop_by_slug(db, req.crop_slug)
        if not crop:
            # Fallback default values
            crop_name_en = req.crop_slug.title()
            crop_name_ne = req.crop_slug
            yield_per_sqm = 8.0
            base_cost_per_sqm = 100.0
        else:
            crop_name_en = crop.name_en
            crop_name_ne = crop.name_ne
            yield_per_sqm = crop.expected_yield_kg_per_sqm
            base_cost_per_sqm = crop.approx_production_cost_per_sqm

        # Area conversion
        multiplier = AREA_CONVERSIONS_TO_SQM.get(req.area_unit.lower(), 508.72)
        total_sqm = round(req.area_value * multiplier, 2)

        # Baseline cost ratios per sqm based on real Nepal agronomic standards
        # Seeds (~15%), Fertilizer/Compost (~25%), Labor (~30%), Irrigation (~10%), Electricity (~5%), Tunnel Maintenance (~10%), Other (~5%)
        is_tunnel = req.farming_method.lower() == "tunnel"
        cost_scale = 1.0 if is_tunnel else 0.70

        calc_seed = req.custom_seed_cost if req.custom_seed_cost is not None else round(total_sqm * base_cost_per_sqm * 0.15 * cost_scale, 0)
        calc_fert = req.custom_fertilizer_cost if req.custom_fertilizer_cost is not None else round(total_sqm * base_cost_per_sqm * 0.25 * cost_scale, 0)
        calc_labor = req.custom_labor_cost if req.custom_labor_cost is not None else round(total_sqm * base_cost_per_sqm * 0.30 * cost_scale, 0)
        calc_irrig = req.custom_irrigation_cost if req.custom_irrigation_cost is not None else round(total_sqm * base_cost_per_sqm * 0.10 * cost_scale, 0)
        calc_elec = req.custom_electricity_cost if req.custom_electricity_cost is not None else round(total_sqm * base_cost_per_sqm * 0.05 * cost_scale, 0)
        calc_maint = req.custom_tunnel_maintenance if req.custom_tunnel_maintenance is not None else round(total_sqm * base_cost_per_sqm * (0.10 if is_tunnel else 0.0), 0)
        calc_other = req.custom_other_cost if req.custom_other_cost is not None else round(total_sqm * base_cost_per_sqm * 0.05 * cost_scale, 0)

        total_cost = round(calc_seed + calc_fert + calc_labor + calc_irrig + calc_elec + calc_maint + calc_other, 0)

        # Expected Yield
        expected_yield = req.custom_expected_yield_kg if req.custom_expected_yield_kg is not None else round(total_sqm * yield_per_sqm * (1.1 if is_tunnel else 0.8), 1)

        # Expected Selling Price (from Kalimati baseline or custom)
        m_meta = KALIMATI_COMMODITY_BASELINES.get(req.crop_slug, {"base_price": 80.0})
        selling_price = req.custom_selling_price_per_kg if req.custom_selling_price_per_kg is not None else m_meta["base_price"]

        # Expected Revenue & Profit
        revenue = round(expected_yield * selling_price, 0)
        profit = round(revenue - total_cost, 0)
        roi = round((profit / max(1.0, total_cost)) * 100.0, 1)

        # Break-even Price & Break-even Yield
        be_price = round(total_cost / max(1.0, expected_yield), 2)
        be_yield = round(total_cost / max(1.0, selling_price), 1)

        assumptions = [
            f"Farming Method: {req.farming_method.capitalize()} structure with {total_sqm:.1f} m² net productive area.",
            f"Land Unit: {req.area_value} {req.area_unit.capitalize()} (Equivalent to {total_sqm:.1f} m²).",
            f"Expected Yield Benchmark: ~{(expected_yield / max(1.0, total_sqm)):.2f} kg/m².",
            f"Wholesale Benchmark: NPR {selling_price:.1f}/kg at regional Mandi.",
            f"Break-even threshold requires at least NPR {be_price:.2f}/kg or {be_yield:.0f} kg total harvest."
        ]

        return ProfitCalculationResponse(
            crop_name_en=crop_name_en,
            crop_name_ne=crop_name_ne,
            farming_method=req.farming_method,
            area_value=req.area_value,
            area_unit=req.area_unit,
            area_sqm=total_sqm,
            cost_breakdown={
                "seed_cost": calc_seed,
                "fertilizer_compost_cost": calc_fert,
                "labor_cost": calc_labor,
                "irrigation_cost": calc_irrig,
                "electricity_fuel_cost": calc_elec,
                "tunnel_maintenance_cost": calc_maint,
                "other_contingency_cost": calc_other
            },
            total_cost=total_cost,
            expected_yield_kg=expected_yield,
            expected_selling_price_per_kg=selling_price,
            expected_revenue=revenue,
            expected_profit=profit,
            roi_percentage=roi,
            break_even_price_per_kg=be_price,
            break_even_yield_kg=be_yield,
            assumptions_summary=assumptions
        )

profit_calculator = ProfitCalculatorService()
