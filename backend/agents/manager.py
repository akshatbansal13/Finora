from backend.services.market_data import MarketDataService
from backend.rag.retrieval import search_documents
from backend.workflows.langgraph_workflow import run_analysis

class OrchestrationManager:
    """Coordinates data collection and invokes the LangGraph workflow."""
    
    def __init__(self):
        self.market_service = MarketDataService()

    def process_request(self, ticker: str, user_query: str = "") -> dict:
        """
        Main entry point for processing a research request.
        - Fetches live/cached market data
        - Retrieves vector document context via RAG
        - Executes the multi-agent LangGraph workflow
        """
        ticker = ticker.upper()
        
        # 1. Collect Market Data
        print(f"Manager: Fetching market data for {ticker}...")
        try:
            market_data = self.market_service.get_complete_analysis_data(ticker)
        except Exception as e:
            return {"error": f"Failed to fetch market data for {ticker}: {str(e)}"}

        # 2. Retrieve RAG Context
        retrieved_documents = []
        if user_query.strip():
            print(f"Manager: Retrieving document context for query: '{user_query}'...")
            try:
                retrieved_documents = search_documents(user_query, top_k=5)
            except Exception as e:
                print(f"Manager Warning: RAG retrieval failed: {e}. Proceeding without custom context.")

        # 3. Invoke LangGraph Workflow
        print(f"Manager: Initializing Agentic Workflow for {ticker}...")
        try:
            final_report = run_analysis(
                ticker=ticker,
                user_query=user_query,
                market_data=market_data,
                retrieved_documents=retrieved_documents
            )
            return final_report
        except Exception as e:
            return {"error": f"Workflow execution crashed: {repr(e)}"}

# Singleton instance for route imports later
manager_instance = OrchestrationManager()
