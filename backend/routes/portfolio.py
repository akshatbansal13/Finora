from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import PortfolioCreate, PortfolioUpdate
from backend.services.paper_trading import PaperTradingService
from backend.services.optimization import PortfolioOptimizationService
from backend.models import Portfolio

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])
paper_trading_service = PaperTradingService()
optimization_service = PortfolioOptimizationService()

@router.post("/")
def create_portfolio(portfolio: PortfolioCreate, db: Session = Depends(get_db)) -> dict:
    """Create a new portfolio."""
    try:
        data = paper_trading_service.create_portfolio(db, portfolio)
        return {
            "success": True,
            "message": "Portfolio created successfully.",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def list_portfolios(db: Session = Depends(get_db)) -> dict:
    """List all portfolios."""
    try:
        data = paper_trading_service.list_portfolios(db)
        return {
            "success": True,
            "message": "Portfolios retrieved successfully.",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}")
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)) -> dict:
    """Get a portfolio by its ID."""
    try:
        data = paper_trading_service.get_portfolio(db, portfolio_id)
        return {
            "success": True,
            "message": "Portfolio retrieved successfully.",
            "data": data
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{portfolio_id}")
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete a portfolio by its ID."""
    try:
        paper_trading_service.delete_portfolio(db, portfolio_id)
        return {
            "success": True,
            "message": "Portfolio deleted successfully.",
            "data": None
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{portfolio_id}")
def update_portfolio(portfolio_id: int, update_data: PortfolioUpdate, db: Session = Depends(get_db)) -> dict:
    """Update a portfolio by its ID."""
    # But for completeness we can leave the route using ORM or move it.
    try:
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found.")
            
        if update_data.name is not None:
            portfolio.name = update_data.name
        if update_data.description is not None:
            portfolio.description = update_data.description
            
        db.commit()
        db.refresh(portfolio)
        return {
            "success": True,
            "message": "Portfolio updated successfully.",
            "data": paper_trading_service.get_portfolio(db, portfolio.id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/holdings")
def get_holdings(portfolio_id: int, db: Session = Depends(get_db)) -> dict:
    """Get holdings for a specific portfolio."""
    try:
        data = paper_trading_service.get_holdings(db, portfolio_id)
        return {
            "success": True,
            "message": "Holdings retrieved successfully.",
            "data": data
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/performance")
def get_portfolio_performance(portfolio_id: int, db: Session = Depends(get_db)) -> dict:
    """Calculate and get performance metrics for a portfolio."""
    try:
        data = paper_trading_service.calculate_portfolio_performance(db, portfolio_id)
        return {
            "success": True,
            "message": "Performance calculated successfully.",
            "data": data
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/optimize")
def optimize_portfolio(portfolio_id: int, strategy: str = "max_sharpe", db: Session = Depends(get_db)) -> dict:
    """Get optimization suggestions and comparison for a portfolio."""
    try:
        data = optimization_service.compare_current_vs_optimized(db, portfolio_id, strategy)
        return {
            "success": True,
            "message": f"Optimization ({strategy}) completed.",
            "data": data
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
