"""
Main relay logic connecting Telegram and Cursor API.
"""
import asyncio
import uuid
from typing import Dict, Optional, List
from datetime import datetime
from models import RelayMessage, MessageDirection, TelegramMessage, CursorMessage, ChatSession
from telegram_client import TelegramClient
from cursor_client import CursorClient, MockCursorClient
from logger import get_logger
from config import settings

logger = get_logger("relay")

class TelegramCursorRelay:
    """Main relay class connecting Telegram and Cursor API."""
    
    def __init__(self):
        self.telegram_client = TelegramClient()
        self.cursor_client = MockCursorClient() if not settings.cursor_api_key else CursorClient()
        self.active_sessions: Dict[int, ChatSession] = {}
        self.message_queue: List[RelayMessage] = []
        self.is_running = False
        
    async def initialize(self):
        """Initialize the relay system."""
        try:
            # Initialize clients
            await self.telegram_client.initialize()
            await self.cursor_client.initialize()
            
            # Set up message handler
            self.telegram_client._send_to_relay = self._handle_telegram_message
            
            logger.info("Relay system initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize relay system: {e}")
            raise
    
    async def _handle_telegram_message(self, telegram_msg: TelegramMessage):
        """Handle incoming Telegram message."""
        try:
            # Create relay message
            relay_msg = RelayMessage(
                id=str(uuid.uuid4()),
                telegram_message=telegram_msg,
                direction=MessageDirection.TELEGRAM_TO_CURSOR,
                status="pending",
                created_at=datetime.now()
            )
            
            # Add to queue
            self.message_queue.append(relay_msg)
            
            # Process immediately
            await self._process_message(relay_msg)
            
        except Exception as e:
            logger.error(f"Error handling Telegram message: {e}")
            await self._send_error_response(telegram_msg.chat_id, "Error processing message")
    
    async def _process_message(self, relay_msg: RelayMessage):
        """Process a relay message."""
        try:
            relay_msg.status = "processing"
            
            if relay_msg.direction == MessageDirection.TELEGRAM_TO_CURSOR:
                await self._process_telegram_to_cursor(relay_msg)
            elif relay_msg.direction == MessageDirection.CURSOR_TO_TELEGRAM:
                await self._process_cursor_to_telegram(relay_msg)
            
            relay_msg.status = "completed"
            relay_msg.processed_at = datetime.now()
            
        except Exception as e:
            relay_msg.status = "failed"
            relay_msg.error_message = str(e)
            logger.error(f"Error processing relay message {relay_msg.id}: {e}")
    
    async def _process_telegram_to_cursor(self, relay_msg: RelayMessage):
        """Process message from Telegram to Cursor."""
        telegram_msg = relay_msg.telegram_message
        
        # Get or create conversation
        conversation_id = await self._get_conversation_id(telegram_msg.chat_id)
        
        # Send to Cursor API
        cursor_response = await self.cursor_client.send_message(
            message=telegram_msg.text,
            conversation_id=conversation_id,
            context={
                "user_id": telegram_msg.user_id,
                "username": telegram_msg.username,
                "message_type": telegram_msg.message_type.value
            }
        )
        
        # Store cursor response
        relay_msg.cursor_message = cursor_response
        
        # Send response back to Telegram
        await self._send_cursor_response_to_telegram(telegram_msg.chat_id, cursor_response)
        
        logger.info(f"Message relayed from Telegram to Cursor: {telegram_msg.text[:50]}...")
    
    async def _process_cursor_to_telegram(self, relay_msg: RelayMessage):
        """Process message from Cursor to Telegram."""
        cursor_msg = relay_msg.cursor_message
        
        # This would be used for proactive messages from Cursor
        # For now, we only handle responses to Telegram messages
        pass
    
    async def _get_conversation_id(self, chat_id: int) -> str:
        """Get or create conversation ID for a chat."""
        if chat_id in self.active_sessions:
            session = self.active_sessions[chat_id]
            if session.cursor_conversation_id:
                return session.cursor_conversation_id
        
        # Create new conversation ID
        conversation_id = f"telegram_chat_{chat_id}_{int(datetime.now().timestamp())}"
        
        if chat_id in self.active_sessions:
            self.active_sessions[chat_id].cursor_conversation_id = conversation_id
        
        return conversation_id
    
    async def _send_cursor_response_to_telegram(self, chat_id: int, cursor_msg: CursorMessage):
        """Send Cursor response to Telegram."""
        try:
            # Format the response
            response_text = self._format_cursor_response(cursor_msg)
            
            # Send to Telegram
            await self.telegram_client.send_message(chat_id, response_text)
            
            logger.info(f"Response sent to Telegram chat {chat_id}")
            
        except Exception as e:
            logger.error(f"Failed to send response to Telegram: {e}")
            await self._send_error_response(chat_id, "Failed to send response")
    
    def _format_cursor_response(self, cursor_msg: CursorMessage) -> str:
        """Format Cursor response for Telegram."""
        content = cursor_msg.content
        
        # Add metadata if available
        if cursor_msg.metadata:
            model = cursor_msg.metadata.get("model", "Unknown")
            usage = cursor_msg.metadata.get("usage", {})
            
            if usage:
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
                
                footer = f"\n\n---\n🤖 Powered by {model} | Tokens: {prompt_tokens}+{completion_tokens}"
                content += footer
        
        # Ensure message fits Telegram limits
        if len(content) > 4096:
            content = content[:4090] + "..."
        
        return content
    
    async def _send_error_response(self, chat_id: int, error_message: str):
        """Send error response to Telegram."""
        try:
            await self.telegram_client.send_message(
                chat_id, 
                f"❌ {error_message}"
            )
        except Exception as e:
            logger.error(f"Failed to send error response: {e}")
    
    async def start(self):
        """Start the relay system."""
        try:
            self.is_running = True
            logger.info("Starting Telegram-Cursor relay...")
            
            # Start Telegram bot polling
            await self.telegram_client.start_polling()
            
            logger.info("Relay system started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start relay system: {e}")
            raise
    
    async def stop(self):
        """Stop the relay system."""
        try:
            self.is_running = False
            logger.info("Stopping Telegram-Cursor relay...")
            
            # Stop Telegram bot
            await self.telegram_client.stop_polling()
            
            # Close Cursor client
            await self.cursor_client.close()
            
            logger.info("Relay system stopped")
            
        except Exception as e:
            logger.error(f"Error stopping relay system: {e}")
    
    async def get_status(self) -> Dict[str, any]:
        """Get relay system status."""
        return {
            "is_running": self.is_running,
            "active_sessions": len(self.active_sessions),
            "message_queue_size": len(self.message_queue),
            "telegram_bot_status": "active" if self.telegram_client.application else "inactive",
            "cursor_client_status": "active" if self.cursor_client.session else "inactive"
        }