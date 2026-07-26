import json
from langchain_core.prompts import PromptTemplate
from backend.prompts.system_prompts import SYSTEM_PROMPT
from backend.prompts.financial_prompts import NEWS_PROMPT
from backend.agents.llm_setup import get_llm, parse_json_response

class NewsAgent:
    """Agent responsible for analyzing market sentiment and financial news."""
    
    def __init__(self):
        self.llm = get_llm()
        self.prompt_template = PromptTemplate(
            input_variables=["ticker", "news_data", "context", "as_of_date", "upcoming_events"],
            template=f"{SYSTEM_PROMPT}\n\n{NEWS_PROMPT}"
        )

    def analyze(self, ticker: str, news_data: list, context: list = None, as_of_date: str = None, upcoming_events: str = None) -> dict:
        if not ticker or not isinstance(news_data, list):
            return {"error": "Invalid input data"}
            
        from datetime import datetime
        context = context or []
        context_str = "\n".join([c.get("text", "") for c in context]) if context else "No additional context available."
        news_data_str = json.dumps(news_data, indent=2)

        if not as_of_date:
            as_of_date = datetime.now().strftime('%Y-%m-%d')
        if not upcoming_events:
            upcoming_events = "No upcoming events provided."

        prompt = self.prompt_template.format(
            ticker=ticker.upper(),
            news_data=news_data_str,
            context=context_str,
            as_of_date=as_of_date,
            upcoming_events=upcoming_events
        )

        response_text = self.llm.invoke(prompt)
        return parse_json_response(response_text)
