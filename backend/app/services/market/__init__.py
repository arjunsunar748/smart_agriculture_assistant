from app.services.market.base import MarketDataProvider
from app.services.market.market_sources import OFFICIAL_SOURCES, REGIONAL_MARKETS, get_freshness_state
from app.services.market.market_fetcher import MarketDataFetcher
from app.services.market.market_normalizer import normalize_crop_name, normalize_market_name, parse_price_value
from app.services.market.market_validator import validate_market_price, validate_arrival_record
from app.services.market.market_forecast import estimate_future_price_range
from app.services.market.backtesting import backtest_engine
from app.services.market.market_service import market_data_service, MarketDataService

# Backward-compatibility alias
market_service = market_data_service
KalimatiMarketProvider = MarketDataService
