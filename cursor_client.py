"""
Cursor API client for handling AI interactions.
"""
import asyncio
import aiohttp
import json
from typing import Optional, Dict, Any, List
from models import CursorMessage, MessageType
from logger import get_logger
from config import settings

logger = get_logger("cursor_client")

class CursorClient:
    """Cursor API client."""
    
    def __init__(self):
        self.api_url = settings.cursor_api_url
        self.api_key = settings.cursor_api_key
        self.session: Optional[aiohttp.ClientSession] = None
        self.conversations: Dict[str, List[CursorMessage]] = {}
    
    async def initialize(self):
        """Initialize the Cursor client."""
        try:
            self.session = aiohttp.ClientSession(
                headers={
                    "Authorization": f"Bearer {self.api_key}" if self.api_key else "",
                    "Content-Type": "application/json"
                }
            )
            logger.info("Cursor client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Cursor client: {e}")
            raise
    
    async def send_message(self, message: str, conversation_id: Optional[str] = None, 
                          context: Optional[Dict[str, Any]] = None) -> CursorMessage:
        """Send a message to Cursor API."""
        try:
            if not self.session:
                await self.initialize()
            
            # Prepare the request payload
            payload = {
                "message": message,
                "conversation_id": conversation_id,
                "context": context or {},
                "model": "cursor-ai",
                "stream": False
            }
            
            # Make the API request
            async with self.session.post(
                f"{self.api_url}/v1/chat/completions",
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Create Cursor message object
                    cursor_msg = CursorMessage(
                        message_id=data.get("id", f"cursor_{asyncio.get_event_loop().time()}"),
                        content=data.get("choices", [{}])[0].get("message", {}).get("content", ""),
                        message_type=MessageType.TEXT,
                        timestamp=data.get("created", asyncio.get_event_loop().time()),
                        metadata={
                            "conversation_id": data.get("conversation_id"),
                            "model": data.get("model"),
                            "usage": data.get("usage")
                        }
                    )
                    
                    # Store in conversation history
                    if cursor_msg.metadata.get("conversation_id"):
                        conv_id = cursor_msg.metadata["conversation_id"]
                        if conv_id not in self.conversations:
                            self.conversations[conv_id] = []
                        self.conversations[conv_id].append(cursor_msg)
                    
                    logger.info(f"Message sent to Cursor API: {message[:50]}...")
                    return cursor_msg
                    
                else:
                    error_text = await response.text()
                    logger.error(f"Cursor API error {response.status}: {error_text}")
                    raise Exception(f"Cursor API error: {response.status}")
                    
        except Exception as e:
            logger.error(f"Failed to send message to Cursor API: {e}")
            raise
    
    async def get_conversation_history(self, conversation_id: str) -> List[CursorMessage]:
        """Get conversation history."""
        return self.conversations.get(conversation_id, [])
    
    async def clear_conversation(self, conversation_id: str):
        """Clear conversation history."""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            logger.info(f"Conversation {conversation_id} cleared")
    
    async def close(self):
        """Close the client session."""
        if self.session:
            await self.session.close()
            logger.info("Cursor client session closed")

class MockCursorClient(CursorClient):
    """Mock Cursor client for testing without API access."""
    
    async def send_message(self, message: str, conversation_id: Optional[str] = None, 
                          context: Optional[Dict[str, Any]] = None) -> CursorMessage:
        """Mock send message."""
        import time
        
        # Simulate API delay
        await asyncio.sleep(1)
        
        # Generate mock response
        mock_response = f"I received your message: '{message}'. This is a mock response from Cursor AI. In a real implementation, this would be processed by the actual Cursor API."
        
        cursor_msg = CursorMessage(
            message_id=f"mock_{int(time.time())}",
            content=mock_response,
            message_type=MessageType.TEXT,
            timestamp=time.time(),
            metadata={
                "conversation_id": conversation_id or f"mock_conv_{int(time.time())}",
                "model": "mock-cursor-ai",
                "usage": {"prompt_tokens": len(message), "completion_tokens": len(mock_response)}
            }
        )
        
        logger.info(f"Mock response generated for: {message[:50]}...")
        return cursor_msg