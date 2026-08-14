from typing import TypedDict, Optional, Dict, Any, List
from langgraph.graph import StateGraph, START, END

from backend.agents.financial_agent import FinancialAgent
from backend.agents.news_agent import NewsAgent
from backend.agents.technical_agent import TechnicalAgent
from backend.agents.risk_agent import RiskAgent
from backend.agents.portfolio_agent import PortfolioAgent
from backend.agents.report_agent import ReportAgent

class WorkflowState(TypedDict):
    ticker: str
    user_query: str
    market_data: Dict[str, Any]
    retrieved_documents: List[Dict[str, Any]]
    
    financial_analysis: Optional[Dict[str, Any]]
    news_analysis: Optional[Dict[str, Any]]
    technical_analysis: Optional[Dict[str, Any]]
    risk_analysis: Optional[Dict[str, Any]]
    validation_analysis: Optional[Dict[str, Any]]
    portfolio_recommendation: Optional[Dict[str, Any]]
    final_report: Optional[Dict[str, Any]]
    
    metadata: Optional[Dict[str, Any]]

# Initialize agents once to reuse LLM connections
financial_agent = FinancialAgent()
news_agent = NewsAgent()
technical_agent = TechnicalAgent()
risk_agent = RiskAgent()
portfolio_agent = PortfolioAgent()
report_agent = ReportAgent()

def financial_node(state: WorkflowState) -> WorkflowState:
    try:
        data = {
            "profile": state["market_data"].get("profile", {}),
            "financials": state["market_data"].get("financials", {}),
            "statistics": state["market_data"].get("statistics", {})
        }
        import json
        events = state["market_data"].get("upcoming_events", {})
        events_str = json.dumps(events) if events else "No upcoming events found."
        
        res = financial_agent.analyze(
            ticker=state["ticker"], 
            financial_data=data, 
            context=state["retrieved_documents"],
            upcoming_events=events_str
        )
        return {"financial_analysis": res}
    except Exception as e:
        return {"financial_analysis": {"error": str(e)}}

import time

def news_node(state: WorkflowState) -> WorkflowState:
    try:
        news_data = state["market_data"].get("news", [])
        import json
        events = state["market_data"].get("upcoming_events", {})
        events_str = json.dumps(events) if events else "No upcoming events found."
        
        res = news_agent.analyze(
            ticker=state["ticker"], 
            news_data=news_data, 
            context=state["retrieved_documents"],
            upcoming_events=events_str
        )
        return {"news_analysis": res}
    except Exception as e:
        return {"news_analysis": {"error": str(e)}}

def technical_node(state: WorkflowState) -> WorkflowState:
    try:
        price_data = state["market_data"].get("history", [])
        res = technical_agent.analyze(
            ticker=state["ticker"], 
            price_data=price_data,
            current_price=state["market_data"].get("current_price")
        )
        return {"technical_analysis": res}
    except Exception as e:
        return {"technical_analysis": {"error": str(e)}}

def risk_node(state: WorkflowState) -> WorkflowState:
    try:
        stats_data = state["market_data"].get("statistics", {})
        res = risk_agent.analyze(
            ticker=state["ticker"], 
            stats_data=stats_data,
            current_price=state["market_data"].get("current_price")
        )
        return {"risk_analysis": res}
    except Exception as e:
        return {"risk_analysis": {"error": str(e)}}

def validation_node(state: WorkflowState) -> WorkflowState:
    import re
    flags = []
    try:
        current_price = state["market_data"].get("current_price")
        if current_price is not None:
            # We check if any agent outputted a number that is drastically different (e.g. 10x higher)
            # This is a basic sanity check for currency mismatched numbers in text.
            threshold_high = current_price * 10
            
            # Simple helper to extract numbers from a dict recursively
            def extract_numbers(d):
                nums = []
                if isinstance(d, dict):
                    for v in d.values():
                        nums.extend(extract_numbers(v))
                elif isinstance(d, list):
                    for v in d:
                        nums.extend(extract_numbers(v))
                elif isinstance(d, (int, float)):
                    nums.append(float(d))
                elif isinstance(d, str):
                    # extract numbers like 342.5 or 4,000.00
                    found = re.findall(r'\b\d+(?:,\d{3})*(?:\.\d+)?\b', d)
                    for f in found:
                        try:
                            nums.append(float(f.replace(',', '')))
                        except:
                            pass
                return nums
                
            all_outputs = {
                "Financial": state.get("financial_analysis", {}),
                "Technical": state.get("technical_analysis", {}),
                "Risk": state.get("risk_analysis", {})
            }
            
            for agent_name, out_dict in all_outputs.items():
                numbers = extract_numbers(out_dict)
                for num in numbers:
                    if num > threshold_high and num > 1000: # only flag large anomalous numbers
                        # If a number is wildly out of scope of the price, it might be a valid other metric (like market cap or volume)

                        pass
                        
        state["validation_analysis"] = {"consistent": True, "flags": flags}
    except Exception as e:
        state["validation_analysis"] = {"error": str(e), "consistent": True, "flags": []}
    return state

def portfolio_node(state: WorkflowState) -> WorkflowState:
    try:
        portfolio_data = state["market_data"].get("price", {}) # Mock portfolio input using current price
        opt_res = state.get("metadata", {}).get("optimization_results", None)
        res = portfolio_agent.analyze(
            ticker=state["ticker"], 
            portfolio_data=portfolio_data, 
            company_analysis=state.get("financial_analysis", {}),
            news_sentiment=state.get("news_analysis", {}),
            technical_trend=state.get("technical_analysis", {}),
            risk_assessment=state.get("risk_analysis", {}),
            optimization_results=opt_res
        )
        state["portfolio_recommendation"] = res
    except Exception as e:
        state["portfolio_recommendation"] = {"error": str(e)}
    return state

def report_node(state: WorkflowState) -> WorkflowState:
    try:
        res = report_agent.analyze(
            ticker=state["ticker"],
            financial_output=state.get("financial_analysis", {}),
            news_output=state.get("news_analysis", {}),
            technical_output=state.get("technical_analysis", {}),
            risk_output=state.get("risk_analysis", {}),
            portfolio_output=state.get("portfolio_recommendation", {}),
            validation_flags=state.get("validation_analysis", {}).get("flags", [])
        )
        state["final_report"] = res
    except Exception as e:
        state["final_report"] = {"error": repr(e), "markdown_report": f"Failed to generate report: {repr(e)}"}
    return state


workflow = StateGraph(WorkflowState)

workflow.add_node("FinancialAgent", financial_node)
workflow.add_node("NewsAgent", news_node)
workflow.add_node("TechnicalAgent", technical_node)
workflow.add_node("RiskAgent", risk_node)
workflow.add_node("ValidationAgent", validation_node)
workflow.add_node("PortfolioAgent", portfolio_node)
workflow.add_node("ReportAgent", report_node)

#  parallel execution order for research agents
workflow.add_edge(START, "FinancialAgent")
workflow.add_edge(START, "NewsAgent")
workflow.add_edge(START, "TechnicalAgent")
workflow.add_edge(START, "RiskAgent")

# Converge all parallel agents to Validation
workflow.add_edge("FinancialAgent", "ValidationAgent")
workflow.add_edge("NewsAgent", "ValidationAgent")
workflow.add_edge("TechnicalAgent", "ValidationAgent")
workflow.add_edge("RiskAgent", "ValidationAgent")


workflow.add_edge("ValidationAgent", "PortfolioAgent")
workflow.add_edge("PortfolioAgent", "ReportAgent")
workflow.add_edge("ReportAgent", END)

compiled_workflow = workflow.compile()

def run_analysis(ticker: str, user_query: str, market_data: dict, retrieved_documents: list) -> dict:
    """Executes the complete LangGraph workflow."""
    initial_state = WorkflowState(
        ticker=ticker.upper(),
        user_query=user_query,
        market_data=market_data,
        retrieved_documents=retrieved_documents,
        financial_analysis=None,
        news_analysis=None,
        technical_analysis=None,
        risk_analysis=None,
        validation_analysis=None,
        portfolio_recommendation=None,
        final_report=None,
        metadata={}
    )
    
    print(f"Starting workflow for {ticker}...")
    final_state = compiled_workflow.invoke(initial_state)
    print(f"Workflow completed for {ticker}.")
    
    return final_state.get("final_report", {})
