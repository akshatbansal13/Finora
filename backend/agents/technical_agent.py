import json
import pandas as pd
from datetime import datetime
from langchain_core.prompts import PromptTemplate
from backend.prompts.system_prompts import SYSTEM_PROMPT
from backend.prompts.financial_prompts import TECHNICAL_PROMPT
from backend.agents.llm_setup import get_llm, parse_json_response

class TechnicalAgent:
    """Agent responsible for analyzing price action and technical indicators."""
    
    def __init__(self):
        self.llm = get_llm()
        self.prompt_template = PromptTemplate(
            input_variables=["ticker", "price_data", "indicators_json", "as_of_date", "current_price"],
            template=f"{SYSTEM_PROMPT}\n\n{TECHNICAL_PROMPT}"
        )

    def calculate_indicators(self, price_data: list) -> dict:
        if len(price_data) < 20:
            return {"error": "Insufficient data for indicators"}
            
        df = pd.DataFrame(price_data)
        if 'close' not in df.columns:
            return {"error": "Missing close price"}
            
        # Calculate SMA 20 and 50
        sma_20 = df['close'].rolling(window=20).mean().iloc[-1]
        sma_50 = df['close'].rolling(window=50).mean().iloc[-1] if len(df) >= 50 else None
        
        # Calculate RSI (14)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        current_rsi = rsi.iloc[-1]
        
        # Calculate MACD (12, 26, 9)
        exp1 = df['close'].ewm(span=12, adjust=False).mean()
        exp2 = df['close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        macd_hist = macd - signal
        
        return {
            "sma_20": round(sma_20, 2) if pd.notnull(sma_20) else None,
            "sma_50": round(sma_50, 2) if pd.notnull(sma_50) else None,
            "rsi_14": round(current_rsi, 2) if pd.notnull(current_rsi) else None,
            "macd": round(macd.iloc[-1], 2) if pd.notnull(macd.iloc[-1]) else None,
            "macd_signal": round(signal.iloc[-1], 2) if pd.notnull(signal.iloc[-1]) else None,
            "macd_hist": round(macd_hist.iloc[-1], 2) if pd.notnull(macd_hist.iloc[-1]) else None
        }

    def analyze(self, ticker: str, price_data: list, as_of_date: str = None, current_price: float = None) -> dict:
        if not ticker or not isinstance(price_data, list):
            return {"error": "Invalid input data"}
            
        price_data_str = json.dumps(price_data, indent=2)
        indicators = self.calculate_indicators(price_data)
        indicators_str = json.dumps(indicators, indent=2)
        
        if not as_of_date:
            as_of_date = datetime.now().strftime('%Y-%m-%d')
            
        cp_str = str(current_price) if current_price else "Unknown"

        prompt = self.prompt_template.format(
            ticker=ticker.upper(),
            price_data=price_data_str,
            indicators_json=indicators_str,
            as_of_date=as_of_date,
            current_price=cp_str
        )

        response_text = self.llm.invoke(prompt)
        return parse_json_response(response_text)
