"""
Data models for the Telegram-Cursor API relay.
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    """Types of messages."""
    TEXT = "text"
    CODE = "code"
    FILE = "file"
    IMAGE = "image"
    COMMAND = "command"

class MessageDirection(str, Enum):
    """Message direction."""
    TELEGRAM_TO_CURSOR = "telegram_to_cursor"
    CURSOR_TO_TELEGRAM = "cursor_to_telegram"

class TelegramMessage(BaseModel):
    """Telegram message model."""
    message_id: int
    chat_id: int
    user_id: int
    username: Optional[str] = None
    text: str
    message_type: MessageType = MessageType.TEXT
    timestamp: datetime
    reply_to_message_id: Optional[int] = None

class CursorMessage(BaseModel):
    """Cursor API message model."""
    message_id: str
    content: str
    message_type: MessageType = MessageType.TEXT
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class RelayMessage(BaseModel):
    """Relay message model."""
    id: str
    telegram_message: Optional[TelegramMessage] = None
    cursor_message: Optional[CursorMessage] = None
    direction: MessageDirection
    status: str = "pending"  # pending, processing, completed, failed
    created_at: datetime
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ChatSession(BaseModel):
    """Chat session model."""
    session_id: str
    telegram_chat_id: int
    cursor_conversation_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    last_activity: datetime
    message_count: int = 0

class RelayConfig(BaseModel):
    """Relay configuration."""
    auto_reply: bool = True
    max_message_length: int = 4096
    allowed_users: Optional[List[int]] = None
    blocked_users: Optional[List[int]] = None
    command_prefix: str = "/"
    enable_file_sharing: bool = True
    enable_code_execution: bool = False