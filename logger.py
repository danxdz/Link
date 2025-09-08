"""
Logging configuration for the Telegram-Cursor API relay.
"""
import sys
from loguru import logger
from config import settings

# Remove default logger
logger.remove()

# Add console logger
logger.add(
    sys.stdout,
    level=settings.log_level,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    colorize=True
)

# Add file logger
logger.add(
    "logs/relay.log",
    level=settings.log_level,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    rotation="1 day",
    retention="30 days",
    compression="zip"
)

# Add error file logger
logger.add(
    "logs/errors.log",
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    rotation="1 day",
    retention="90 days",
    compression="zip"
)

def get_logger(name: str = None):
    """Get a logger instance."""
    if name:
        return logger.bind(name=name)
    return logger