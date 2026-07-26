FINANCIAL_PROMPT = """Analyze the company fundamentals for {ticker}.
As of Date: {as_of_date}
Upcoming Events: {upcoming_events}

Data:
{financial_data}

Retrieved Context (if any):
{context}

Task:
State the as-of date for all data referenced. Flag if the data is stale or if a market-moving event is imminent.
Analyze the revenue, profitability, margins, cash flow, debt, growth, valuation, competitive strengths, and weaknesses.

Return a JSON object with this exact structure:
{{
    "fundamentals_score": <float between 0 and 100>,
    "strengths": [<list of strings>],
    "weaknesses": [<list of strings>],
    "financial_summary": "<string summarizing the financial health>",
    "recommendation": "<Strong Buy, Buy, Hold, Sell, Strong Sell>",
    "confidence": <float between 0 and 100>
}}
"""

NEWS_PROMPT = """Analyze the news sentiment and events for {ticker}.
As of Date: {as_of_date}
Upcoming Events: {upcoming_events}

News Data:
{news_data}

Retrieved Context (if any):
{context}

Task:
State the as-of date for all data referenced. Flag if the data is stale or if a market-moving event is imminent.
Analyze the provided news for positive and negative sentiment, identify key market-moving events, and evaluate potential catalysts or risks.

Return a JSON object with this exact structure:
{{
    "sentiment": "<Bullish, Bearish, or Neutral>",
    "positive_news": [<list of strings>],
    "negative_news": [<list of strings>],
    "key_events": [<list of strings>],
    "impact": "<string summarizing expected market impact>",
    "confidence": <float between 0 and 100>
}}
"""

TECHNICAL_PROMPT = """Analyze the technical indicators and price action for {ticker}.
As of Date: {as_of_date}
Current Price (USD): {current_price}

Historical Price Data:
{price_data}

Precomputed Indicators:
{indicators_json}

Task:
State the as-of date for all data referenced.
Before reporting a price, sanity-check it against any other price figures in the provided data (e.g., historical data vs Current Price). If the Current Price is not plausibly within or near that range, explicitly report a 'Data Quality Issue: Currency or Unit Mismatch' in your summary.
Interpret these indicators to determine trend, support/resistance, and signals.
Do not recalculate or re-derive the indicator values — treat them as ground truth.

Return a JSON object with this exact structure:
{{
    "trend": "<Bullish, Bearish, or Neutral>",
    "technical_score": <float between 0 and 100>,
    "support": <float>,
    "resistance": <float>,
    "signals": [<list of technical signals like 'RSI Oversold', 'MACD Crossover'>],
    "summary": "<string summarizing the technical setup>",
    "confidence": <float between 0 and 100>
}}
"""

RISK_PROMPT = """Evaluate the investment risk for {ticker}.
As of Date: {as_of_date}
Current Price (USD): {current_price}

Market Statistics & Fundamentals:
{stats_data}

Task:
State the as-of date for all data referenced.
Before reporting a price or evaluating drawdown risk, sanity-check the Current Price against the 52-week high/low in the stats data. If the Current Price is not plausibly within or near that range, explicitly report a 'Data Quality Issue: Currency or Unit Mismatch' in your summary instead of deriving metrics based on faulty numbers.
Evaluate the volatility, beta, liquidity, drawdown risk, and overall investment risk based on the provided statistics and fundamentals.

Return a JSON object with this exact structure:
{{
    "risk_level": "<High, Medium, or Low>",
    "risk_score": <float between 0 and 100>,
    "major_risks": [<list of strings>],
    "mitigation": "<string describing how to mitigate these risks>",
    "summary": "<string summarizing the risk profile>",
    "confidence": <float between 0 and 100>
}}
"""

PORTFOLIO_PROMPT = """Provide a portfolio allocation recommendation for {ticker}.
As of Date: {as_of_date}

Inputs:
Current Portfolio Data: {portfolio_data}
Company Analysis Summary: {company_analysis}
News Sentiment: {news_sentiment}
Technical Trend: {technical_trend}
Risk Assessment: {risk_assessment}
Quantitative Optimization Results (if any): {optimization_results}

Task:
State the as-of date for all data referenced.
Determine the suggested allocation weight, optimal position sizing, and how this asset impacts portfolio diversification based on fundamentals, sentiment, trend, and risk.
If Quantitative Optimization Results are provided, you MUST explain the mathematical advantages (Sharpe ratio, volatility) and generate your investment recommendations based on the optimized rebalancing plan. Do NOT perform the optimization yourself, just interpret the results.

Return a JSON object with this exact structure:
{{
    "allocation": "<string like 'Overweight', 'Market Weight', 'Underweight'>",
    "weight": <float representing percentage e.g., 5.0 for 5%>,
    "position_size": <float representing suggested dollar amount or share count based on portfolio size>,
    "diversification": "<string describing impact on diversification>",
    "notes": "<string with additional portfolio management advice>"
}}
"""
