import pandas as pd
from sqlalchemy.orm import Session
from pypfopt import expected_returns, risk_models
from pypfopt.efficient_frontier import EfficientFrontier
from backend.models import Portfolio, Holding
from backend.services.market_data import MarketDataService

class PortfolioOptimizationService:
    def __init__(self):
        self.market_service = MarketDataService()

    def get_portfolio_data(self, db: Session, portfolio_id: int) -> tuple:
        """Retrieves holdings and historical price dataframe for the portfolio."""
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            raise ValueError("Portfolio not found.")
            
        holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()
        if not holdings:
            raise ValueError("Insufficient holdings to optimize.")
            
        tickers = [h.ticker for h in holdings]
        current_weights = {}
        total_value = sum([h.market_value for h in holdings])
        for h in holdings:
            current_weights[h.ticker] = h.market_value / total_value if total_value > 0 else 0

        # Fetch historical data
        # We need a dataframe with Date as index and Tickers as columns containing closing prices.
        price_dict = {}
        from concurrent.futures import ThreadPoolExecutor

        def fetch_hist(ticker):
            try:
                hist = self.market_service.get_historical_data(ticker, period="1y", interval="1d")
                df = pd.DataFrame(hist)
                if not df.empty:
                    df['date'] = pd.to_datetime(df['date'])
                    df.set_index('date', inplace=True)
                    return ticker, df['close']
            except Exception as e:
                print(f"Failed to fetch history for {ticker}: {e}")
            return ticker, None

        with ThreadPoolExecutor(max_workers=10) as executor:
            results = executor.map(fetch_hist, tickers)
            for ticker, series in results:
                if series is not None:
                    price_dict[ticker] = series

        if not price_dict:
            raise ValueError("Not enough historical data available for optimization.")
            
        prices_df = pd.DataFrame(price_dict).dropna()
        return portfolio, current_weights, prices_df

    def calculate_expected_returns(self, prices_df: pd.DataFrame) -> pd.Series:
        """Calculates expected returns using historical mean."""
        return expected_returns.mean_historical_return(prices_df)

    def calculate_covariance_matrix(self, prices_df: pd.DataFrame) -> pd.DataFrame:
        """Calculates sample covariance matrix."""
        return risk_models.sample_cov(prices_df)
        
    def _get_metrics(self, ef: EfficientFrontier) -> dict:
        perf = ef.portfolio_performance()
        return {
            "expected_annual_return": perf[0],
            "annual_volatility": perf[1],
            "sharpe_ratio": perf[2]
        }
        
    def _clean_weights(self, ef: EfficientFrontier) -> dict:
        raw_weights = ef.clean_weights()
        return {k: v for k, v in raw_weights.items()}

    def optimize_max_sharpe(self, mu: pd.Series, S: pd.DataFrame) -> tuple:
        ef = EfficientFrontier(mu, S)
        ef.max_sharpe()
        return self._clean_weights(ef), self._get_metrics(ef)

    def optimize_min_volatility(self, mu: pd.Series, S: pd.DataFrame) -> tuple:
        ef = EfficientFrontier(mu, S)
        ef.min_volatility()
        return self._clean_weights(ef), self._get_metrics(ef)

    def optimize_efficient_return(self, mu: pd.Series, S: pd.DataFrame, target_return: float) -> tuple:
        ef = EfficientFrontier(mu, S)
        try:
            ef.efficient_return(target_return=target_return)
            return self._clean_weights(ef), self._get_metrics(ef)
        except Exception:
            raise ValueError("Target return is not possible with these assets.")

    def optimize_efficient_risk(self, mu: pd.Series, S: pd.DataFrame, target_volatility: float) -> tuple:
        ef = EfficientFrontier(mu, S)
        try:
            ef.efficient_risk(target_volatility=target_volatility)
            return self._clean_weights(ef), self._get_metrics(ef)
        except Exception:
            raise ValueError("Target volatility is not possible with these assets.")

    def optimize_equal_weight(self, mu: pd.Series, S: pd.DataFrame) -> tuple:
        n = len(mu)
        weights = {ticker: 1.0/n for ticker in mu.index}
        ef = EfficientFrontier(mu, S)
        ef.set_weights(weights)
        return weights, self._get_metrics(ef)

    def generate_rebalancing_plan(self, current_weights: dict, optimized_weights: dict) -> list:
        recommendations = []
        for ticker in optimized_weights.keys():
            curr = current_weights.get(ticker, 0.0)
            opt = optimized_weights.get(ticker, 0.0)
            diff = opt - curr
            
            action = "Hold"
            if diff > 0.01:
                action = "Buy"
            elif diff < -0.01:
                action = "Sell"
                
            if action != "Hold":
                recommendations.append({
                    "ticker": ticker,
                    "current_weight": curr,
                    "optimized_weight": opt,
                    "difference": diff,
                    "recommendation": f"{action} {abs(diff)*100:.1f}% {ticker}"
                })
        return recommendations

    def compare_current_vs_optimized(self, db: Session, portfolio_id: int, strategy: str = "max_sharpe") -> dict:
        portfolio, current_weights, prices_df = self.get_portfolio_data(db, portfolio_id)
        mu = self.calculate_expected_returns(prices_df)
        S = self.calculate_covariance_matrix(prices_df)
        
        # Current portfolio metrics
        ef_current = EfficientFrontier(mu, S)
        ef_current.set_weights(current_weights)
        current_metrics = self._get_metrics(ef_current)
        
        if strategy == "max_sharpe":
            opt_weights, opt_metrics = self.optimize_max_sharpe(mu, S)
        elif strategy == "min_volatility":
            opt_weights, opt_metrics = self.optimize_min_volatility(mu, S)
        elif strategy == "efficient_return":
            # Target current return + 5% relative or somewhat reasonable
            target = current_metrics["expected_annual_return"] * 1.10
            opt_weights, opt_metrics = self.optimize_efficient_return(mu, S, target)
        elif strategy == "efficient_risk":
            # Target current volatility - 10% relative
            target = current_metrics["annual_volatility"] * 0.90
            opt_weights, opt_metrics = self.optimize_efficient_risk(mu, S, target)
        elif strategy == "equal_weight":
            opt_weights, opt_metrics = self.optimize_equal_weight(mu, S)
        else:
            raise ValueError(f"Invalid strategy: {strategy}")
            
        rebalancing_plan = self.generate_rebalancing_plan(current_weights, opt_weights)
        
        performance = {
            "return_improvement": opt_metrics["expected_annual_return"] - current_metrics["expected_annual_return"],
            "volatility_reduction": current_metrics["annual_volatility"] - opt_metrics["annual_volatility"],
            "sharpe_improvement": opt_metrics["sharpe_ratio"] - current_metrics["sharpe_ratio"]
        }
        
        return {
            "strategy": strategy,
            "current_portfolio": {
                "weights": current_weights,
                "metrics": current_metrics
            },
            "optimized_portfolio": {
                "weights": opt_weights,
                "metrics": opt_metrics
            },
            "performance": performance,
            "recommendations": rebalancing_plan
        }
