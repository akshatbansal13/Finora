from sqlalchemy.orm import Session
from backend.models import Portfolio, Holding, Transaction
from backend.schemas import PortfolioCreate, PortfolioResponse, HoldingResponse, TransactionResponse
from backend.services.market_data import MarketDataService

class PaperTradingService:
    def __init__(self):
        self.market_service = MarketDataService()

    def create_portfolio(self, db: Session, data: PortfolioCreate) -> dict:
        portfolio = Portfolio(
            name=data.name,
            description=data.description,
            initial_balance=data.initial_balance,
            current_balance=data.initial_balance
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        return PortfolioResponse.model_validate(portfolio).model_dump()

    def list_portfolios(self, db: Session) -> list:
        portfolios = db.query(Portfolio).all()
        return [PortfolioResponse.model_validate(p).model_dump() for p in portfolios]

    def get_portfolio(self, db: Session, portfolio_id: int) -> dict:
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise ValueError("Portfolio not found.")
        return PortfolioResponse.model_validate(portfolio).model_dump()

    def delete_portfolio(self, db: Session, portfolio_id: int):
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise ValueError("Portfolio not found.")
        db.delete(portfolio)
        db.commit()

    def buy_stock(self, db: Session, portfolio_id: int, ticker: str, quantity: float) -> dict:
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")
        
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise ValueError("Portfolio not found.")
            
        ticker = ticker.upper()
        price_data = self.market_service.get_stock_price(ticker)
        current_price = price_data.get("current_price")
        if not current_price:
            raise ValueError("Current market price not available.")
            
        profile_data = self.market_service.get_company_profile(ticker)
        company_name = profile_data.get("company_name", ticker)
        
        total_cost = current_price * quantity
        if portfolio.current_balance < total_cost:
            raise ValueError("Insufficient balance.")
            
        # Deduct cash balance
        portfolio.current_balance -= total_cost
        
        # Create Transaction record
        transaction = Transaction(
            portfolio_id=portfolio.id,
            ticker=ticker,
            company_name=company_name,
            transaction_type="BUY",
            quantity=quantity,
            price=current_price,
            total_amount=total_cost
        )
        db.add(transaction)
        
        # Update or Create Holding
        holding = db.query(Holding).filter(Holding.portfolio_id == portfolio.id, Holding.ticker == ticker).first()
        if holding:
            new_quantity = holding.quantity + quantity
            new_invested = holding.invested_amount + total_cost
            holding.average_buy_price = new_invested / new_quantity
            holding.quantity = new_quantity
            holding.invested_amount = new_invested
            holding.current_price = current_price
            holding.market_value = current_price * new_quantity
        else:
            holding = Holding(
                portfolio_id=portfolio.id,
                ticker=ticker,
                company_name=company_name,
                quantity=quantity,
                average_buy_price=current_price,
                current_price=current_price,
                invested_amount=total_cost,
                market_value=total_cost
            )
            db.add(holding)
            
        db.commit()
        
        return {
            "transaction_id": transaction.id,
            "total_cost": total_cost,
            "remaining_balance": portfolio.current_balance
        }

    def sell_stock(self, db: Session, portfolio_id: int, ticker: str, quantity: float) -> dict:
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")
            
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise ValueError("Portfolio not found.")
            
        ticker = ticker.upper()
        holding = db.query(Holding).filter(Holding.portfolio_id == portfolio.id, Holding.ticker == ticker).first()
        if not holding or holding.quantity < quantity:
            raise ValueError("Insufficient shares.")
            
        price_data = self.market_service.get_stock_price(ticker)
        current_price = price_data.get("current_price")
        if not current_price:
            raise ValueError("Current market price not available.")
            
        total_revenue = current_price * quantity
        
        # Add to cash balance
        portfolio.current_balance += total_revenue
        
        # Create Transaction record
        transaction = Transaction(
            portfolio_id=portfolio.id,
            ticker=ticker,
            company_name=holding.company_name,
            transaction_type="SELL",
            quantity=quantity,
            price=current_price,
            total_amount=total_revenue
        )
        db.add(transaction)
        
        # Update holding
        holding.quantity -= quantity
        holding.invested_amount -= (holding.average_buy_price * quantity)
        holding.current_price = current_price
        holding.market_value = current_price * holding.quantity
        
        if holding.quantity == 0:
            db.delete(holding)
            
        db.commit()
        
        return {
            "transaction_id": transaction.id,
            "total_revenue": total_revenue,
            "new_balance": portfolio.current_balance
        }

    def get_holdings(self, db: Session, portfolio_id: int) -> list:
        holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()
        from concurrent.futures import ThreadPoolExecutor

        def fetch_price(holding):
            try:
                price_data = self.market_service.get_stock_price(holding.ticker)
                if price_data and "current_price" in price_data:
                    holding.current_price = price_data["current_price"]
                    holding.market_value = holding.current_price * holding.quantity
            except Exception:
                pass
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            executor.map(fetch_price, holdings)
        
        return [HoldingResponse.model_validate(h).model_dump() for h in holdings]
        
    def get_transaction_history(self, db: Session, portfolio_id: int) -> list:
        transactions = db.query(Transaction).filter(Transaction.portfolio_id == portfolio_id).order_by(Transaction.transaction_date.desc()).all()
        return [TransactionResponse.model_validate(t).model_dump() for t in transactions]

    def calculate_portfolio_performance(self, db: Session, portfolio_id: int) -> dict:
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise ValueError("Portfolio not found.")
            
        holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()
        
        total_market_value = 0.0
        total_invested = 0.0
        allocation = []
        
        from concurrent.futures import ThreadPoolExecutor
        
        def fetch_ticker_price(ticker):
            try:
                price_data = self.market_service.get_stock_price(ticker)
                return ticker, price_data.get("current_price")
            except Exception:
                return ticker, None

        live_prices = {}
        if holdings:
            with ThreadPoolExecutor(max_workers=10) as executor:
                results = executor.map(fetch_ticker_price, [h.ticker for h in holdings])
                for ticker, price in results:
                    if price is not None:
                        live_prices[ticker] = price
        
        for holding in holdings:
            current_price = live_prices.get(holding.ticker, holding.current_price)
                
            market_value = current_price * holding.quantity
            total_market_value += market_value
            total_invested += holding.invested_amount
            
            allocation.append({
                "ticker": holding.ticker,
                "company": holding.company_name,
                "quantity": holding.quantity,
                "average_buy_price": holding.average_buy_price,
                "current_price": current_price,
                "invested_amount": holding.invested_amount,
                "market_value": market_value,
                "profit_loss": market_value - holding.invested_amount,
                "return_pct": ((market_value - holding.invested_amount) / holding.invested_amount * 100) if holding.invested_amount > 0 else 0
            })
            
        current_value = portfolio.current_balance + total_market_value
        total_profit_loss = current_value - portfolio.initial_balance
        
        for item in allocation:
            item["weight_pct"] = (item["market_value"] / total_market_value * 100) if total_market_value > 0 else 0

        return {
            "portfolio_id": portfolio.id,
            "name": portfolio.name,
            "cash_balance": portfolio.current_balance,
            "total_invested": total_invested,
            "total_market_value": total_market_value,
            "current_portfolio_value": current_value,
            "total_profit_loss": total_profit_loss,
            "total_return_pct": (total_profit_loss / portfolio.initial_balance) * 100 if portfolio.initial_balance > 0 else 0,
            "number_of_holdings": len(holdings),
            "diversification": allocation
        }
