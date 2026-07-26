REPORT_PROMPT = """Generate a comprehensive final investment report for {ticker}.
As of Date: {as_of_date}

Inputs:
Financial Agent Output: {financial_output}
News Agent Output: {news_output}
Technical Agent Output: {technical_output}
Risk Agent Output: {risk_output}
Portfolio Agent Output: {portfolio_output}
Validation Flags: {validation_flags}

Task:
State the as-of date for all data referenced.
Synthesize all the inputs into a cohesive, highly professional investment research report. Do NOT hallucinate new data; strictly use the provided inputs.
If the Validation Flags list is not empty, you MUST include a 'Data Quality Warning' section at the very top of the markdown report detailing the inconsistencies found.

Return a JSON object with this exact structure containing both the markdown report and structured data:
{{
    "markdown_report": "<string containing a highly visual, fully formatted markdown report. You MUST use rich markdown syntax (e.g. ## Headers, ### Subheaders, **bolding**, bullet points, and tables). Include dedicated ## sections for Executive Summary, Financial Analysis, Technical Analysis, News Sentiment, Risk Assessment, and Portfolio Recommendation.>",
    "executive_summary": "<string summarizing the entire report briefly>",
    "fundamental_recommendation": "<Strong Buy, Buy, Hold, Sell, Strong Sell> (taken from Financial Agent Output)",
    "final_recommendation": "<Strong Buy, Buy, Hold, Sell, Strong Sell>",
    "overall_confidence": <float between 0 and 100>
}}
"""
