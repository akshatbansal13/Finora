from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from backend.database import get_db
from backend.services.paper_trading import PaperTradingService

router = APIRouter(prefix="/trading", tags=["Trading"])
paper_trading_service = PaperTradingService()

class TradeRequest(BaseModel):
    portfolio_id: int
    ticker: str = Field(..., min_length=1, max_length=20)
    quantity: float = Field(..., gt=0)

@router.post("/buy")
def execute_buy(trade: TradeRequest, db: Session = Depends(get_db)) -> dict:
    """Execute a buy trade."""
    try:
        data = paper_trading_service.buy_stock(db, trade.portfolio_id, trade.ticker, trade.quantity)
        return {
            "success": True,
            "message": f"Successfully bought {trade.quantity} shares of {trade.ticker.upper()}.",
            "data": data
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sell")
def execute_sell(trade: TradeRequest, db: Session = Depends(get_db)) -> dict:
    """Execute a sell trade."""
    try:
        data = paper_trading_service.sell_stock(db, trade.portfolio_id, trade.ticker, trade.quantity)
        return {
            "success": True,
            "message": f"Successfully sold {trade.quantity} shares of {trade.ticker.upper()}.",
            "data": data
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{portfolio_id}")
def get_trading_history(portfolio_id: int, db: Session = Depends(get_db)) -> dict:
    """Get the trading history for a specific portfolio."""
    try:
        data = paper_trading_service.get_transaction_history(db, portfolio_id)
        return {
            "success": True,
            "message": "Trading history retrieved successfully.",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
