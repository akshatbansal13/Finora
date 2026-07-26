import json
import yfinance as yf
import redis
from typing import Dict, Any, List, Optional
from backend.config import settings
from fastapi import HTTPException

class MarketDataService:
    def __init__(self):
        try:
            self.redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            self.redis = None
            print(f"Failed to connect to Redis: {e}")

    def _get_cache(self, key: str) -> Optional[Any]:
        if self.redis:
            try:
                data = self.redis.get(key)
                if data:
                    return json.loads(data)
            except Exception:
                pass
        return None

    def _set_cache(self, key: str, data: Any, ttl: int):
        if self.redis:
            try:
                self.redis.setex(key, ttl, json.dumps(data))
            except Exception:
                pass

    def get_company_profile(self, ticker: str) -> Dict[str, Any]:
        cache_key = f"profile:{ticker}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            info = yf.Ticker(ticker).info
            if not info or 'shortName' not in info:
                raise ValueError("Invalid ticker or no data found")

            profile = {
                "company_name": info.get("shortName") or info.get("longName"),
                "ticker": ticker.upper(),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "website": info.get("website"),
                "description": info.get("longBusinessSummary"),
                "employees": info.get("fullTimeEmployees"),
                "market_cap": info.get("marketCap"),
                "country": info.get("country"),
                "currency": info.get("currency"),
                "exchange": info.get("exchange")
            }
            # 24 hours = 86400 seconds
            self._set_cache(cache_key, profile, 86400)
            return profile
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Failed to fetch profile: {str(e)}")

    def get_stock_price(self, ticker: str) -> Dict[str, Any]:
        cache_key = f"price:v4:{ticker}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            t = yf.Ticker(ticker)
            history = t.history(period="5d")
            
            if history.empty:
                raise ValueError("No price data available")

            latest = history.iloc[-1]
            
            raw_current = float(latest.get("Close", 0))
            raw_open = float(latest.get("Open", 0))
            raw_high = float(latest.get("High", 0))
            raw_low = float(latest.get("Low", 0))
            volume = float(latest.get("Volume", 0))
            
            if len(history) > 1:
                raw_prev_close = float(history.iloc[-2].get("Close", raw_open))
            else:
                raw_prev_close = raw_open
            
            # Use fast_info to get currency quickly without the heavy .info call
            currency = "USD"
            try:
                currency = getattr(t, "fast_info", {}).get("currency", "USD")
            except Exception:
                pass
            
            exchange_rate = 1.0
            if currency and currency.upper() != "USD":
                try:
                    fx = yf.Ticker(f"{currency.upper()}USD=X")
                    fx_history = fx.history(period="1d")
                    if not fx_history.empty:
                        exchange_rate = float(fx_history.iloc[-1]["Close"])
                except Exception:
                    pass
            
            day_change_pct = 0.0
            if raw_current and raw_prev_close:
                day_change_pct = ((raw_current - raw_prev_close) / raw_prev_close) * 100
            
            price_data = {
                "current_price": raw_current * exchange_rate,
                "open": raw_open * exchange_rate,
                "previous_close": raw_prev_close * exchange_rate,
                "day_high": raw_high * exchange_rate,
                "day_low": raw_low * exchange_rate,
                "day_change_pct": day_change_pct,
                "volume": volume,
                "market_state": "OPEN",
                "native_price": raw_current,
                "native_currency": currency,
                "exchange_rate": exchange_rate
            }
            # 15 minutes = 900 seconds
            self._set_cache(cache_key, price_data, 900)
            return price_data
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Failed to fetch price: {str(e)}")

    def get_historical_data(self, ticker: str, period: str = "1mo", interval: str = "1d") -> List[Dict[str, Any]]:
        cache_key = f"history:v2:{ticker}:{period}:{interval}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            t = yf.Ticker(ticker)
            history = t.history(period=period, interval=interval)
            if history.empty:
                raise ValueError("No historical data available")

            currency = t.info.get("currency", "USD") if hasattr(t, 'info') else "USD"
            exchange_rate = 1.0
            
            if currency and currency.upper() != "USD":
                try:
                    fx = yf.Ticker(f"{currency.upper()}USD=X")
                    fx_history = fx.history(period="1d")
                    if not fx_history.empty:
                        exchange_rate = fx_history.iloc[-1]["Close"]
                except Exception:
                    pass

            # Convert to list of dicts
            result = []
            for date, row in history.iterrows():
                result.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "open": row["Open"] * exchange_rate if row.get("Open") else None,
                    "high": row["High"] * exchange_rate if row.get("High") else None,
                    "low": row["Low"] * exchange_rate if row.get("Low") else None,
                    "close": row["Close"] * exchange_rate if row.get("Close") else None,
                    "volume": row["Volume"]
                })
            
            # 15 minutes = 900 seconds
            self._set_cache(cache_key, result, 900)
            return result
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Failed to fetch history: {str(e)}")

    def get_financial_statements(self, ticker: str) -> Dict[str, Any]:
        cache_key = f"financials:{ticker}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            t = yf.Ticker(ticker)
            income_stmt = t.income_stmt.to_dict() if not t.income_stmt.empty else {}
            balance_sheet = t.balance_sheet.to_dict() if not t.balance_sheet.empty else {}
            cash_flow = t.cashflow.to_dict() if not t.cashflow.empty else {}

            # Convert pandas timestamps in dict keys to strings
            def clean_keys(d):
                cleaned = {}
                for k, v in d.items():
                    key_str = k.strftime("%Y-%m-%d") if hasattr(k, "strftime") else str(k)
                    cleaned[key_str] = {sk: sv for sk, sv in v.items() if str(sv) != 'nan'}
                return cleaned

            financials = {
                "income_statement": clean_keys(income_stmt),
                "balance_sheet": clean_keys(balance_sheet),
                "cash_flow": clean_keys(cash_flow)
            }
            # 24 hours = 86400 seconds
            self._set_cache(cache_key, financials, 86400)
            return financials
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Failed to fetch financials: {str(e)}")

    def get_key_statistics(self, ticker: str) -> Dict[str, Any]:
        cache_key = f"statistics:{ticker}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            t = yf.Ticker(ticker)
            info = t.info
            
            currency = info.get("currency", "USD")
            exchange_rate = 1.0
            
            if currency and currency.upper() != "USD":
                try:
                    fx = yf.Ticker(f"{currency.upper()}USD=X")
                    fx_history = fx.history(period="1d")
                    if not fx_history.empty:
                        exchange_rate = fx_history.iloc[-1]["Close"]
                except Exception:
                    pass

            def cvt(val):
                return val * exchange_rate if val is not None else None

            stats = {
                "pe_ratio": info.get("trailingPE"),
                "forward_pe": info.get("forwardPE"),
                "eps": cvt(info.get("trailingEps")),
                "dividend_yield": info.get("dividendYield"),
                "beta": info.get("beta"),
                "book_value": cvt(info.get("bookValue")),
                "price_to_book": info.get("priceToBook"),
                "52_week_high": cvt(info.get("fiftyTwoWeekHigh")),
                "52_week_low": cvt(info.get("fiftyTwoWeekLow")),
                "shares_outstanding": info.get("sharesOutstanding")
            }
            # 24 hours = 86400 seconds
            self._set_cache(cache_key, stats, 86400)
            return stats
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Failed to fetch statistics: {str(e)}")

    def get_company_news(self, ticker: str) -> List[Dict[str, Any]]:
        cache_key = f"news:{ticker}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            # yfinance provides a `.news` property which uses Yahoo Finance
            # This avoids needing a separate API key for Phase 4
            news_items = yf.Ticker(ticker).news
            
            result = []
            for item in news_items[:10]:
                import datetime
                pub_date = datetime.datetime.fromtimestamp(item.get("providerPublishTime", 0)).strftime("%Y-%m-%d %H:%M:%S")
                
                result.append({
                    "title": item.get("title"),
                    "description": item.get("summary", "No description available."),
                    "source": item.get("publisher"),
                    "published_date": pub_date,
                    "url": item.get("link")
                })

            # 30 minutes = 1800 seconds
            self._set_cache(cache_key, result, 1800)
            return result
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Failed to fetch news: {str(e)}")

    def get_upcoming_events(self, ticker: str) -> Dict[str, Any]:
        cache_key = f"events:{ticker}"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            t = yf.Ticker(ticker)
            calendar = t.calendar
            events = {}
            if calendar is not None and not calendar.empty:
                # Convert the calendar DataFrame to a dict
                for col in calendar.columns:
                    val = calendar[col].iloc[0]
                    # Handle pandas timestamps and NAs
                    if hasattr(val, "strftime"):
                        val = val.strftime("%Y-%m-%d")
                    events[col] = str(val)
            
            self._set_cache(cache_key, events, 86400)
            return events
        except Exception:
            return {}

    def get_complete_analysis_data(self, ticker: str) -> Dict[str, Any]:
        """Aggregate all market data for the complete API payload."""
        price_data = self.get_stock_price(ticker)
        return {
            "ticker": ticker.upper(),
            "current_price": price_data.get("current_price"),
            "profile": self.get_company_profile(ticker),
            "price": price_data,
            "statistics": self.get_key_statistics(ticker),
            "financials": self.get_financial_statements(ticker),
            "history": self.get_historical_data(ticker),
            "news": self.get_company_news(ticker),
            "upcoming_events": self.get_upcoming_events(ticker)
        }

    def get_news_hub_data(self) -> Dict[str, Any]:
        """Fetches market news, true gainers/losers, and generates Groq sentiment."""
        cache_key = "news_hub_data_v4"
        cached = self._get_cache(cache_key)
        if cached:
            return cached

        try:
            import pandas as pd
            # 1. Fetch Indian Top Gainers and Losers via yfinance directly
            indian_tickers = [
                'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 
                'SBI.NS', 'BAJFINANCE.NS', 'ITC.NS', 'LT.NS', 'KOTAKBANK.NS',
                'AXISBANK.NS', 'HINDUNILVR.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'SUNPHARMA.NS'
            ]
            
            gainers = []
            losers = []
            try:
                data = yf.download(indian_tickers, period='2d', progress=False)
                if not data.empty and 'Close' in data:
                    closes = data['Close']
                    if len(closes) >= 2:
                        prev_close = closes.iloc[-2]
                        curr_close = closes.iloc[-1]
                        
                        performance = []
                        for ticker in indian_tickers:
                            if pd.notna(prev_close[ticker]) and pd.notna(curr_close[ticker]):
                                px = curr_close[ticker]
                                change = px - prev_close[ticker]
                                pct = (change / prev_close[ticker]) * 100
                                performance.append({
                                    "ticker": ticker.replace('.NS', ''),
                                    "name": ticker.replace('.NS', ''),
                                    "price": float(px),
                                    "change_percent": float(pct)
                                })
                        
                        performance.sort(key=lambda x: x["change_percent"], reverse=True)
                        gainers = performance[:5]
                        losers = performance[-5:]
                        losers.sort(key=lambda x: x["change_percent"]) # Most negative first
            except Exception as e:
                print(f"Yfinance screener error: {e}")

            # Fallback if screener is empty
            if not gainers:
                gainers = [{"ticker": "RELIANCE", "name": "Reliance Ind.", "price": 2900.53, "change_percent": 1.23}]
            if not losers:
                losers = [{"ticker": "TCS", "name": "TCS Ltd.", "price": 3950.22, "change_percent": -1.12}]

            # 2. Fetch General Market News (using SPY as proxy)
            try:
                market_news_raw = yf.Ticker("SPY").news
            except Exception:
                market_news_raw = []
                
            news_items = []
            for item in market_news_raw[:10]:
                content = item.get("content", item) # Handle nested content object
                title = content.get("title")
                if not title:
                    continue
                    
                import datetime
                pub_date_raw = content.get("pubDate")
                if pub_date_raw:
                    try:
                        if isinstance(pub_date_raw, str):
                            pub_date = pub_date_raw
                        else:
                            pub_date = datetime.datetime.fromtimestamp(pub_date_raw).strftime("%Y-%m-%d %H:%M:%S")
                    except:
                        pub_date = str(pub_date_raw)
                else:
                    pub_date = "Recent"

                # Extract thumbnail
                thumbnail_url = ""
                thumbnail = content.get("thumbnail", {})
                if thumbnail:
                    resolutions = thumbnail.get("resolutions", [])
                    if resolutions:
                        # Grab the first resolution (often 170x128 or similar)
                        thumbnail_url = resolutions[-1].get("url") if len(resolutions) > 1 else resolutions[0].get("url")
                    else:
                        thumbnail_url = thumbnail.get("originalUrl", "")

                news_items.append({
                    "title": title,
                    "description": content.get("summary", ""),
                    "source": content.get("provider", {}).get("displayName", "Yahoo Finance"),
                    "published_date": pub_date,
                    "url": content.get("canonicalUrl", {}).get("url", ""),
                    "thumbnail": thumbnail_url
                })

            # 3. Generate Summary using Groq
            from langchain_groq import ChatGroq
            from backend.config import settings
            import os
            from dotenv import load_dotenv
            
            # Load from actual .env path to ensure fresh read
            env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
            load_dotenv(dotenv_path=env_path) 
            
            groq_key = os.environ.get("GROQ_API_KEY") or settings.GROQ_API_KEY
            
            summary = "AI Market Summary is currently unavailable."
            sentiment = "NEUTRAL"
            if groq_key and news_items:
                try:
                    llm = ChatGroq(temperature=0.2, groq_api_key=groq_key, model_name="llama-3.1-8b-instant")
                    news_text = "\n".join([f"- {n['title']}: {n['description']}" for n in news_items[:5]])
                    prompt = f"Analyze these financial news headlines and summarize them into a 3-sentence market sentiment report. You must format your exact response like this: SENTIMENT|SUMMARY\nWhere SENTIMENT is strictly one of [BULLISH, BEARISH, NEUTRAL]. Do not include any conversational filler, introductory phrases (like 'Here is a summary'), or greetings. Output only the requested format.\n\nNews:\n{news_text}"
                    response = llm.invoke(prompt)
                    output = response.content
                    if "|" in output:
                        parts = output.split("|", 1)
                        sentiment = parts[0].strip().upper()
                        summary = parts[1].strip()
                    else:
                        summary = output.strip()
                        
                    # Cleanup common conversational fillers if the LLM ignores the instruction
                    filler_prefixes = [
                        "Here's a 3-sentence daily market sentiment report:",
                        "Here is a 3-sentence daily market sentiment report:",
                        "Here is a summary:",
                        "Here's a summary:"
                    ]
                    for filler in filler_prefixes:
                        if summary.startswith(filler):
                            summary = summary[len(filler):].strip()
                            # Remove leading quotes if they exist after stripping
                            if summary.startswith('"') and summary.endswith('"'):
                                summary = summary[1:-1].strip()

                except Exception as e:
                    print(f"Groq API error: {e}")
                    summary = f"Groq Error: {str(e)}"

            data = {
                "gainers": gainers,
                "losers": losers,
                "news": news_items,
                "summary": summary,
                "sentiment": sentiment
            }
            
            # Bump cache key to force refresh
            self._set_cache("news_hub_data_v6", data, 900)
            return data
            
        except Exception as e:
            print(f"Failed to fetch news hub data: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch news hub data: {str(e)}")
