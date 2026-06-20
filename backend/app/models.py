from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class RequestLog(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    method: str
    path: str
    status_code: int
    latency_ms: float
    client_ip: Optional[str] = None

class MetricSummary(BaseModel):
    total_requests: int
    avg_latency: float
    error_rate: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
