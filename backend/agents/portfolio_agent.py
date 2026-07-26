import json
from langchain_core.prompts import PromptTemplate
from backend.prompts.system_prompts import SYSTEM_PROMPT
from backend.prompts.financial_prompts import PORTFOLIO_PROMPT
from backend.agents.llm_setup import get_llm, parse_json_response

class PortfolioAgent:
    """Agent responsible for portfolio allocation and position sizing recommendations."""
    
    def __init__(self):
        self.llm = get_llm()
        self.prompt_template = PromptTemplate(
            input_variables=["ticker", "portfolio_data", "company_analysis", "news_sentiment", "technical_trend", "risk_assessment", "optimization_results", "as_of_date"],
            template=f"{SYSTEM_PROMPT}\n\n{PORTFOLIO_PROMPT}"
        )

    def analyze(self, ticker: str, portfolio_data: dict, company_analysis: dict, news_sentiment: dict, technical_trend: dict, risk_assessment: dict, optimization_results: dict = None, as_of_date: str = None) -> dict:
        if not ticker or not portfolio_data or not company_analysis or not risk_assessment:
            return {"error": "Invalid input data"}
            
        from datetime import datetime
        portfolio_str = json.dumps(portfolio_data, indent=2)
        company_str = json.dumps(company_analysis, indent=2)
        news_str = json.dumps(news_sentiment, indent=2)
        tech_str = json.dumps(technical_trend, indent=2)
        risk_str = json.dumps(risk_assessment, indent=2)
        opt_str = json.dumps(optimization_results, indent=2) if optimization_results else "No optimization results available."

        if not as_of_date:
            as_of_date = datetime.now().strftime('%Y-%m-%d')

        prompt = self.prompt_template.format(
            ticker=ticker.upper(),
            portfolio_data=portfolio_str,
            company_analysis=company_str,
            news_sentiment=news_str,
            technical_trend=tech_str,
            risk_assessment=risk_str,
            optimization_results=opt_str,
            as_of_date=as_of_date
        )

        response_text = self.llm.invoke(prompt)
        return parse_json_response(response_text)
