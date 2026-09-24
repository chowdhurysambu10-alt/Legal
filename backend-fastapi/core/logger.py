import os
import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

# Sensitive patterns to sanitize automatically from logs
SENSITIVE_PATTERNS = [
    re.compile(r'(?i)(bearer\s+)([a-zA-Z0-9_\-\.]{15,})'),
    re.compile(r'(?i)(key|secret|token|password|api[_-]?key)["\s:=]+(["\']?)([a-zA-Z0-9_\-\.]{10,})\2'),
    re.compile(r'(?i)(sbp_[a-zA-Z0-9_-]{20,})'),
    re.compile(r'(?i)(AIza[0-9A-Za-z-_]{35})')
]


def sanitize_sensitive_data(message: str) -> str:
    """Masks API keys, JWT tokens, and database passwords from logs."""
    if not isinstance(message, str):
        message = str(message)
    for pattern in SENSITIVE_PATTERNS:
        message = pattern.sub(r'\1[REDACTED_SECRET]', message)
    return message


class StructuredJsonFormatter(logging.Formatter):
    """
    Outputs log records as single-line JSON objects with standard fields
    for observability systems (Datadog, CloudWatch, Loki, ELK).
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": sanitize_sensitive_data(record.getMessage()),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Include structured extra attributes if present
        if hasattr(record, "component"):
            log_obj["component"] = getattr(record, "component")
        if hasattr(record, "document_id"):
            log_obj["document_id"] = getattr(record, "document_id")
        if hasattr(record, "user_id"):
            log_obj["user_id"] = getattr(record, "user_id")
        if hasattr(record, "duration_ms"):
            log_obj["duration_ms"] = getattr(record, "duration_ms")
        if hasattr(record, "status_code"):
            log_obj["status_code"] = getattr(record, "status_code")
        if hasattr(record, "error_type"):
            log_obj["error_type"] = getattr(record, "error_type")

        # Exception formatting
        if record.exc_info:
            log_obj["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "detail": sanitize_sensitive_data(str(record.exc_info[1])),
            }

        return json.dumps(log_obj, ensure_ascii=False)


def setup_logger(name: str = "legal_ai") -> logging.Logger:
    """Configures structured logger with console stream output."""
    logger = logging.getLogger(name)
    log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(getattr(logging, log_level_name, logging.INFO))

    # Avoid duplicate handlers on re-import
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        # Use JSON formatter in production or when JSON_LOGS=true
        use_json = os.getenv("JSON_LOGS", "true").lower() in ("true", "1", "yes")
        if use_json:
            handler.setFormatter(StructuredJsonFormatter())
        else:
            handler.setFormatter(logging.Formatter(
                "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
            ))
        logger.addHandler(handler)
        logger.propagate = False

    return logger


logger = setup_logger("legal_ai")
