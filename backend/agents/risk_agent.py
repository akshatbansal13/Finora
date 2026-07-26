import json
from langchain_core.prompts import PromptTemplate
from backend.prompts.system_prompts import SYSTEM_PROMPT
from backend.prompts.financial_prompts import RISK_PROMPT
from backend.agents.llm_setup import get_llm, parse_json_response

class RiskAgent:
    """Agent responsible for analyzing volatility and overall investment risk."""
    
    def __init__(self):
        self.llm = get_llm()
        self.prompt_template = PromptTemplate(
            input_variables=["ticker", "stats_data", "as_of_date", "current_price"],
            template=f"{SYSTEM_PROMPT}\n\n{RISK_PROMPT}"
        )

    def analyze(self, ticker: str, stats_data: dict, as_of_date: str = None, current_price: float = None) -> dict:
        if not ticker or not stats_data:
            return {"error": "Invalid input data"}
            
        from datetime import datetime
        stats_data_str = json.dumps(stats_data, indent=2)

        if not as_of_date:
            as_of_date = datetime.now().strftime('%Y-%m-%d')
            
        cp_str = str(current_price) if current_price else "Unknown"

        prompt = self.prompt_template.format(
            ticker=ticker.upper(),
            stats_data=stats_data_str,
            as_of_date=as_of_date,
            current_price=cp_str
        )

        response_text = self.llm.invoke(prompt)
        return parse_json_response(response_text)
