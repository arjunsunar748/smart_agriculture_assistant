import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from app.database import SessionLocal
from app.services.market.market_service import market_data_service

async def test_svc():
    db = SessionLocal()
    # 1. Seed historical
    market_data_service.seed_historical_market_data(db)
    
    # 2. Sync latest
    stats = await market_data_service.sync_latest_market_data(db)
    print('Sync stats:', stats)

    # 3. Get prices
    prices = await market_data_service.get_current_prices()
    print('Total current prices returned:', len(prices))
    if prices:
        print('Sample current price:', prices[0]['crop_name'], prices[0]['avg_price'], prices[0]['data_source'], prices[0]['data_quality'])

    # 4. Get arrivals
    arrivals = await market_data_service.get_market_arrivals()
    print('Total arrivals returned:', len(arrivals))
    if arrivals:
        print('Sample arrival:', arrivals[0]['crop_name'], arrivals[0]['quantity_kg'], arrivals[0]['unit'])

    # 5. Price trends & forecast
    trends = await market_data_service.get_price_trends('tomato')
    print('Tomato Trend forecast range:', trends['forecast_price_range_str'], 'Confidence:', trends['forecast_confidence'])
    print('Arrival condition:', trends['arrival_interpretation'])

    # 6. Compare markets
    comp = market_data_service.compare_market_destinations('tomato', 'Dhading', 3000, 45000, 12)
    print('Compare markets top 3:')
    for d in comp['destinations'][:3]:
        print(f"  {d['market_name']}: Price NPR {d['expected_wholesale_price']}, Freight NPR {d['transport_cost_total_npr']}, Net Profit NPR {d['net_profit_npr']}, Net Value NPR {d['net_market_value_per_kg']}/kg")

asyncio.run(test_svc())
