"""
Configuration management for the Telegram-Cursor API relay.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""
    
    # Telegram Configuration
    telegram_bot_token: str = Field("", env="TELEGRAM_BOT_TOKEN")
    telegram_api_id: Optional[str] = Field(None, env="TELEGRAM_API_ID")
    telegram_api_hash: Optional[str] = Field(None, env="TELEGRAM_API_HASH")
    
    # Cursor API Configuration
    cursor_api_url: str = Field("https://api.cursor.sh", env="CURSOR_API_URL")
    cursor_api_key: Optional[str] = Field(None, env="CURSOR_API_KEY")
    
    # MCP Configuration
    mcp_server_url: str = Field("http://localhost:8000", env="MCP_SERVER_URL")
    mcp_session_name: str = Field("cursor_telegram_relay", env="MCP_SESSION_NAME")
    
    # Application Configuration
    debug: bool = Field(False, env="DEBUG")
    log_level: str = Field("INFO", env="LOG_LEVEL")
    port: int = Field(8000, env="PORT")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()