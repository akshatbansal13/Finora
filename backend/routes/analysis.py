import traceback
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import GeneratedReport
from backend.agents.manager import manager_instance

router = APIRouter(prefix="/analysis", tags=["Analysis"])

class AnalysisRequest(BaseModel):
    ticker: str
    query: str = ""

def _process_analysis(ticker: str, query: str) -> Dict[str, Any]:
    """Helper to process analysis workflow and format response."""
    report = manager_instance.process_request(ticker, query)
    if "error" in report:
        print(f"Workflow error: {report['error']}")
        raise HTTPException(status_code=500, detail=report["error"])
        
    return {
        "company": ticker.upper(),
        "recommendation": report.get("final_recommendation", "Unknown"),
        "confidence": report.get("overall_confidence", 0),
        "report": report.get("markdown_report", "")
    }

@router.post("/company")
def analyze_company(request: AnalysisRequest) -> dict:
    """Analyze a company based on the provided ticker and query."""
    try:
        data = _process_analysis(request.ticker, request.query)
        return {
            "success": True,
            "message": "Analysis completed successfully.",
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/report")
def generate_report(request: AnalysisRequest, db: Session = Depends(get_db)) -> dict:
    """Generate a report for a company and save it to the database."""
    try:
        data = _process_analysis(request.ticker, request.query)
        
        db_report = GeneratedReport(
            company=data["company"],
            recommendation=data["recommendation"],
            report_content=data["report"]
        )
        db.add(db_report)
        db.commit()
        
        return {
            "success": True,
            "message": "Report generated and saved successfully.",
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"generate_report crashed: {repr(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/recent")
def get_recent_reports(db: Session = Depends(get_db)) -> dict:
    """Fetch the most recently generated AI analysis reports."""
    try:
        reports = db.query(GeneratedReport).order_by(GeneratedReport.generated_at.desc()).limit(3).all()
        data = [
            {
                "id": r.id,
                "company": r.company,
                "recommendation": r.recommendation,
                "date": r.generated_at.isoformat(),
                "report_content": r.report_content[:200] + "..." if r.report_content else "", # brief snippet
                "report": r.report_content # full report
            }
            for r in reports
        ]
        return {
            "success": True,
            "message": "Recent reports retrieved successfully.",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
