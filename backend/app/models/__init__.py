"""Tüm SQLAlchemy modelleri burada toplanır.

Alembic autogenerate'in tüm tabloları görebilmesi için `app.db.base` bu modülü
import eder; yeni bir model eklendiğinde buraya da eklenmesi gerekir.
"""

from app.models.ai_output import AIOutput
from app.models.ai_usage_log import AIUsageLog
from app.models.cv_analysis import CVAnalysis
from app.models.cv_document import CVDocument
from app.models.job_description import JobDescription
from app.models.job_match import JobMatch
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.user import User
from app.models.user_token import UserToken

__all__ = [
    "User",
    "CVDocument",
    "CVAnalysis",
    "AIOutput",
    "JobDescription",
    "JobMatch",
    "Plan",
    "Subscription",
    "UserToken",
    "AIUsageLog",
]
