import json
from langchain_core.prompts import PromptTemplate
from backend.prompts.system_prompts import SYSTEM_PROMPT
from backend.prompts.report_prompts import REPORT_PROMPT
from backend.agents.llm_setup import get_llm, parse_json_response

class ReportAgent:
    """Agent responsible for synthesizing all agent outputs into a final cohesive investment report."""
    
    def __init__(self):
        self.llm = get_llm()
        self.prompt_template = PromptTemplate(
            input_variables=[
                "ticker", "financial_output", "news_output", 
                "technical_output", "risk_output", "portfolio_output", "as_of_date", "validation_flags"
            ],
            template=f"{SYSTEM_PROMPT}\n\n{REPORT_PROMPT}"
        )

    def analyze(
        self, 
        ticker: str, 
        financial_output: dict, 
        news_output: dict, 
        technical_output: dict, 
        risk_output: dict, 
        portfolio_output: dict,
        validation_flags: list = None,
        as_of_date: str = None
    ) -> dict:
        
        from datetime import datetime
        if not as_of_date:
            as_of_date = datetime.now().strftime('%Y-%m-%d')

        def truncate(data: dict, max_len: int = 3000) -> str:
            s = json.dumps(data, indent=2)
            return s if len(s) <= max_len else s[:max_len] + "\n...[TRUNCATED FOR LENGTH]"

        flags_str = json.dumps(validation_flags, indent=2) if validation_flags else "[]"

        prompt = self.prompt_template.format(
            ticker=ticker.upper(),
            financial_output=truncate(financial_output),
            news_output=truncate(news_output),
            technical_output=truncate(technical_output),
            risk_output=truncate(risk_output),
            portfolio_output=truncate(portfolio_output),
            validation_flags=flags_str,
            as_of_date=as_of_date
        )

        response_text = self.llm.invoke(prompt)
        return parse_json_response(response_text)
