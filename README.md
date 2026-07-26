<div align="center">
  <img src="./frontend/public/favicon.ico" alt="Finora Logo" width="80"/>
  <h1>Finora AI</h1>
  <p><strong> Agentic Investment Research & Portfolio Intelligence Platform</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Frontend-Next.js_15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python" alt="Python" />
    <img src="https://img.shields.io/badge/Caching-Redis-DC382D?style=for-the-badge&logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Agents-LangGraph-F4A261?style=for-the-badge&logo=langchain" alt="LangGraph" />
  </p>
</div>

---

## 📌 Project Overview
**Finora** is an AI-powered financial intelligence platform. It leverages **Agentic AI workflows**, **Retrieval-Augmented Generation (RAG)**, and **Modern Portfolio Theory (MPT)** to automate deep financial research, analyze market sentiment, optimize asset allocation, and generate explainable investment reports. 

Finora utilizes concurrency techniques and in-memory caching to efficiently process market data.

---

## ✨ Core Features

🤖 **Multi-Agent AI Workflow (LangGraph)**
- Six specialized AI agents (Fundamental, Technical, Sentiment, Macro, Risk, Strategy) collaborate in a directed graph to provide holistic, bias-free analysis.
- Generates beautiful, highly detailed markdown reports with definitive BUY/SELL/HOLD recommendations and confidence scores.

📊 **Paper Trading & Portfolio Management**
- Create virtual portfolios and execute simulated trades using live market data.
- Dashboard features real-time equity curves, P/L tracking, and asset allocation charting.

⚡ **Optimized Market Data Pipeline**
- **Concurrent Execution:** Network requests are parallelized using Python's `ThreadPoolExecutor` to speed up data fetching for portfolios.
- **Caching:** Redis caching is used to store temporary market data and reduce redundant API calls.
- **Efficient Extraction:** Utilizes optimized `yfinance` endpoints to quickly pull historical pricing and metadata.

🧠 **Retrieval-Augmented Generation (RAG)**
- Context-aware document analysis. Upload SEC 10-K/10-Q filings and earnings transcripts for evidence-based Q&A against corporate data.

📈 **Portfolio Optimization**
- Mathematical optimization using Modern Portfolio Theory (MPT). 
- Instantly rebalance your holdings for Maximum Sharpe Ratio or Minimum Volatility.

---

## 🏗️ Architecture & Technology Stack

### Frontend (Client)
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion (Glassmorphism UI)
- **Components:** Recharts (Data Viz), Lucide React (Icons)
- **Architecture:** Fully strict typed, responsive, Server-Side Rendered (SSR) capable.

### Backend (Server)
- **Framework:** FastAPI, Python 3.12
- **Database:** SQLAlchemy (ORM), SQLite (Local) / PostgreSQL (Production)
- **Caching:** Redis (In-memory KV store)
- **Concurrency:** ThreadPoolExecutor for concurrent web scraping and financial fetching.

### AI & Data Layer
- **Orchestration:** LangChain & LangGraph
- **LLMs:** Groq (Llama-3 for ultra-fast Market Summaries), Google Gemini (Agentic workflows)
- **Vector DB:** Qdrant (for RAG embeddings)
- **Data Providers:** yfinance

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Redis Server (running locally on port 6379 or via Docker)
- Qdrant Server (for Document Analysis / RAG)

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/finora.git
   cd finora
   ```
2. Set up environment variables on the backend:
   ```bash
   cp .env.example .env
   ```
3. Add your `GROQ_API_KEY`, `GEMINI_API_KEY`, and `REDIS_URL` to `.env`.

### 1. Running the Backend
Open a terminal in the root directory:
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --reload
```
*API Documentation will be available at: http://localhost:8000/docs*

### 2. Running the Frontend
Open a new terminal in the `frontend` directory:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
*Platform will be available at: http://localhost:3000*

---

## 🔒 Security & Best Practices
- **No Exposed Secrets**: All sensitive API keys and database URIs remain purely on the backend. The frontend relies exclusively on internal API routes.
- **Robust Error Handling**: Frontend gracefully handles network timeouts, missing data, and API failures with custom error states and automatic retries.
- **Type Safety**: End-to-end type safety between FastAPI schemas and TypeScript interfaces.


## ⚠️ Disclaimer
**For Educational Purposes Only.** This platform is a simulated environment and a technical demonstration of AI agents and software architecture. The AI-generated reports, sentiment analysis, and portfolio optimizations provided by Finora do not constitute financial, investment, or trading advice. Always consult with a certified financial expert or advisor before making any real investment decisions.

---

## 📈 Future Enhancements
- Live integration with Alpaca / Interactive Brokers for real-money trading execution.
- Multi-user authentication (OAuth / JWT) with Row-Level Security.
- Advanced backtesting engine for quantitative strategies.
- WebSockets for real-time market data streaming.

---
