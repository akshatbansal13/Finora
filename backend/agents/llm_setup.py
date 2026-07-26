import json
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import settings

# Shared global instance to avoid re-initializing
_llm_instance = None

def get_llm():
    """Initializes and returns the shared Gemini LLM instance."""
    global _llm_instance
    if _llm_instance is not None:
        return _llm_instance
        
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in the environment.")
        
    _llm_instance = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        max_retries=6,
    )
    return _llm_instance

def parse_json_response(response_text) -> dict:
    """Safely extracts and parses JSON from the LLM text output."""
    if hasattr(response_text, "content"):
        response_text = response_text.content
        
    if not isinstance(response_text, str):
        response_text = str(response_text)
    try:
        if "```json" in response_text:
            content = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            content = response_text.split("```")[1].split("```")[0].strip()
        else:
            content = response_text.strip()
            
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            content = content[start_idx:end_idx]
            
        return json.loads(content)
    except Exception as e:
        print(f"Error parsing JSON: {e}\nRaw output: {response_text}")
        return {"error": "Failed to parse LLM output as JSON", "raw_output": response_text}
