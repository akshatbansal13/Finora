from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

# Portfolio Schemas
class PortfolioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    initial_balance: float = Field(default=100000.0, gt=0)

class PortfolioUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

class PortfolioResponse(PortfolioBase):
    id: int
    initial_balance: float
    current_balance: float
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Holding Schemas
class HoldingBase(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=20)
    company_name: str
    quantity: float = Field(..., gt=0)
    average_buy_price: float = Field(..., gt=0)
    current_price: float = Field(..., gt=0)

class HoldingCreate(HoldingBase):
    portfolio_id: int

class HoldingUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0)
    current_price: Optional[float] = Field(None, gt=0)
    average_buy_price: Optional[float] = Field(None, gt=0)

class HoldingResponse(HoldingBase):
    id: int
    portfolio_id: int
    invested_amount: float
    market_value: float
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Transaction Schemas
class TransactionBase(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=20)
    company_name: str
    transaction_type: str
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)

    @field_validator('transaction_type')
    def validate_type(cls, v):
        v = v.upper()
        if v not in ('BUY', 'SELL'):
            raise ValueError('Transaction type must be BUY or SELL')
        return v

class TransactionCreate(TransactionBase):
    portfolio_id: int

class TransactionResponse(TransactionBase):
    id: int
    portfolio_id: int
    total_amount: float
    transaction_date: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Uploaded Document Schemas
class UploadedDocumentBase(BaseModel):
    filename: str
    company: str
    report_type: str
    file_path: str

class UploadedDocumentCreate(UploadedDocumentBase):
    pass

class UploadedDocumentResponse(UploadedDocumentBase):
    id: int
    upload_date: datetime
    processed: bool
    
    model_config = ConfigDict(from_attributes=True)


# Generated Report Schemas
class GeneratedReportBase(BaseModel):
    company: str
    recommendation: str
    report_content: str

class GeneratedReportCreate(GeneratedReportBase):
    pass

class GeneratedReportResponse(GeneratedReportBase):
    id: int
    generated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
