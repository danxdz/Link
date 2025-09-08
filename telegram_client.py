"""
Telegram client for handling bot interactions.
"""
import asyncio
from typing import Optional, Dict, Any, List
from telegram import Update, Bot, Message, Chat, User
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.error import TelegramError
from models import TelegramMessage, MessageType, ChatSession
from logger import get_logger
from config import settings

logger = get_logger("telegram_client")

class TelegramClient:
    """Telegram bot client."""
    
    def __init__(self):
        self.bot_token = settings.telegram_bot_token
        self.application: Optional[Application] = None
        self.active_sessions: Dict[int, ChatSession] = {}
        
    async def initialize(self):
        """Initialize the Telegram bot."""
        try:
            self.application = Application.builder().token(self.bot_token).build()
            
            # Add handlers
            self.application.add_handler(CommandHandler("start", self.start_command))
            self.application.add_handler(CommandHandler("help", self.help_command))
            self.application.add_handler(CommandHandler("status", self.status_command))
            self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
            
            logger.info("Telegram bot initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Telegram bot: {e}")
            raise
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command."""
        user = update.effective_user
        chat_id = update.effective_chat.id
        
        welcome_message = f"""
🤖 Welcome to Cursor AI Assistant!

Hi {user.first_name}! I'm your bridge to Cursor's AI capabilities.

Available commands:
/help - Show this help message
/status - Check connection status
/clear - Clear conversation history

Just send me a message and I'll relay it to Cursor AI for processing!
        """
        
        await update.message.reply_text(welcome_message)
        
        # Create or update session
        session_id = f"telegram_{chat_id}"
        session = ChatSession(
            session_id=session_id,
            telegram_chat_id=chat_id,
            is_active=True
        )
        self.active_sessions[chat_id] = session
        
        logger.info(f"New session started for user {user.id} in chat {chat_id}")
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command."""
        help_text = """
🆘 Help - Cursor AI Assistant

Commands:
/start - Start a new conversation
/help - Show this help message
/status - Check connection status
/clear - Clear conversation history

Features:
• Send text messages to get AI responses
• Share code snippets for analysis
• Get help with programming tasks
• Ask questions about your code

Just type your message and I'll process it with Cursor AI!
        """
        await update.message.reply_text(help_text)
    
    async def status_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /status command."""
        chat_id = update.effective_chat.id
        session = self.active_sessions.get(chat_id)
        
        if session:
            status_text = f"""
📊 Status Report

✅ Connection: Active
💬 Session: {session.session_id}
📝 Messages: {session.message_count}
🕒 Last Activity: {session.last_activity.strftime('%Y-%m-%d %H:%M:%S')}
            """
        else:
            status_text = "❌ No active session. Use /start to begin."
        
        await update.message.reply_text(status_text)
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle incoming messages."""
        try:
            message = update.message
            user = update.effective_user
            chat_id = update.effective_chat.id
            
            # Check if user is allowed
            if not self._is_user_allowed(user.id):
                await message.reply_text("❌ Access denied. Contact administrator.")
                return
            
            # Create Telegram message object
            telegram_msg = TelegramMessage(
                message_id=message.message_id,
                chat_id=chat_id,
                user_id=user.id,
                username=user.username,
                text=message.text,
                message_type=self._determine_message_type(message),
                timestamp=message.date
            )
            
            # Update session
            if chat_id in self.active_sessions:
                session = self.active_sessions[chat_id]
                session.message_count += 1
                session.last_activity = telegram_msg.timestamp
            else:
                # Create new session
                session_id = f"telegram_{chat_id}"
                session = ChatSession(
                    session_id=session_id,
                    telegram_chat_id=chat_id,
                    is_active=True
                )
                self.active_sessions[chat_id] = session
            
            # Send to relay
            await self._send_to_relay(telegram_msg)
            
            logger.info(f"Message processed from user {user.id}: {message.text[:50]}...")
            
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await update.message.reply_text("❌ Error processing message. Please try again.")
    
    def _is_user_allowed(self, user_id: int) -> bool:
        """Check if user is allowed to use the bot."""
        # For now, allow all users. You can implement whitelist/blacklist logic here.
        return True
    
    def _determine_message_type(self, message: Message) -> MessageType:
        """Determine the type of message."""
        if message.text.startswith('```') or '`' in message.text:
            return MessageType.CODE
        elif message.text.startswith('/'):
            return MessageType.COMMAND
        else:
            return MessageType.TEXT
    
    async def _send_to_relay(self, telegram_msg: TelegramMessage):
        """Send message to relay system."""
        # This will be implemented in the relay logic
        pass
    
    async def send_message(self, chat_id: int, text: str, reply_to_message_id: Optional[int] = None):
        """Send a message to a Telegram chat."""
        try:
            if self.application:
                bot = self.application.bot
                await bot.send_message(
                    chat_id=chat_id,
                    text=text,
                    reply_to_message_id=reply_to_message_id
                )
                logger.info(f"Message sent to chat {chat_id}")
        except TelegramError as e:
            logger.error(f"Failed to send message to chat {chat_id}: {e}")
            raise
    
    async def start_polling(self):
        """Start the bot polling."""
        if self.application:
            await self.application.initialize()
            await self.application.start()
            await self.application.updater.start_polling()
            logger.info("Telegram bot started polling")
    
    async def stop_polling(self):
        """Stop the bot polling."""
        if self.application:
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()
            logger.info("Telegram bot stopped")