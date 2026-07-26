from fastapi import APIRouter, Depends, Query
from backend.services.market_data import MarketDataService

router = APIRouter(prefix="/market", tags=["Market Data"])

def get_market_service() -> MarketDataService:
    """Dependency injection for the MarketDataService."""
    return MarketDataService()

@router.get("/news-hub")
def get_news_hub(service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns macro news hub data (gainers, losers, news, AI summary)."""
    try:
        data = service.get_news_hub_data()
        return {"success": True, "message": "News hub data retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}")
def get_complete_analysis(ticker: str, service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns complete company analysis data."""
    try:
        data = service.get_complete_analysis_data(ticker)
        return {"success": True, "message": "Market data retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}/profile")
def get_profile(ticker: str, service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns company profile."""
    try:
        data = service.get_company_profile(ticker)
        return {"success": True, "message": "Profile retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}/price")
def get_price(ticker: str, service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns current stock price and volume."""
    try:
        data = service.get_stock_price(ticker)
        return {"success": True, "message": "Price retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}/history")
def get_history(
    ticker: str, 
    period: str = Query("1mo", description="e.g. 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max"), 
    interval: str = Query("1d", description="e.g. 1d, 1wk, 1mo"),
    service: MarketDataService = Depends(get_market_service)
) -> dict:
    """Returns historical OHLC price data."""
    try:
        data = service.get_historical_data(ticker, period, interval)
        return {"success": True, "message": "History retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}/financials")
def get_financials(ticker: str, service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns income statement, balance sheet, and cash flow."""
    try:
        data = service.get_financial_statements(ticker)
        return {"success": True, "message": "Financials retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}/statistics")
def get_statistics(ticker: str, service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns key statistics (PE, EPS, Beta, etc.)."""
    try:
        data = service.get_key_statistics(ticker)
        return {"success": True, "message": "Statistics retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}

@router.get("/{ticker}/news")
def get_news(ticker: str, service: MarketDataService = Depends(get_market_service)) -> dict:
    """Returns latest financial news."""
    try:
        data = service.get_company_news(ticker)
        return {"success": True, "message": "News retrieved successfully.", "data": data}
    except Exception as e:
        return {"success": False, "message": str(e), "data": None}
