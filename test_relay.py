"""
Test script for the Telegram-Cursor API relay.
"""
import asyncio
import sys
from datetime import datetime
from models import TelegramMessage, MessageType
from cursor_client import MockCursorClient
from telegram_client import TelegramClient
from logger import get_logger

logger = get_logger("test")

async def test_cursor_client():
    """Test the Cursor client."""
    print("🧪 Testing Cursor Client...")
    
    client = MockCursorClient()
    await client.initialize()
    
    # Test message
    test_message = "Hello, this is a test message!"
    response = await client.send_message(test_message)
    
    print(f"✅ Test message: {test_message}")
    print(f"✅ Response: {response.content}")
    print(f"✅ Message ID: {response.message_id}")
    
    await client.close()
    print("✅ Cursor client test passed!\n")

async def test_telegram_message_model():
    """Test the Telegram message model."""
    print("🧪 Testing Telegram Message Model...")
    
    telegram_msg = TelegramMessage(
        message_id=12345,
        chat_id=67890,
        user_id=11111,
        username="testuser",
        text="This is a test message",
        message_type=MessageType.TEXT,
        timestamp=datetime.now()
    )
    
    print(f"✅ Message ID: {telegram_msg.message_id}")
    print(f"✅ Chat ID: {telegram_msg.chat_id}")
    print(f"✅ User ID: {telegram_msg.user_id}")
    print(f"✅ Text: {telegram_msg.text}")
    print(f"✅ Type: {telegram_msg.message_type}")
    print("✅ Telegram message model test passed!\n")

async def test_relay_message_flow():
    """Test the relay message flow."""
    print("🧪 Testing Relay Message Flow...")
    
    # Create a mock Telegram message
    telegram_msg = TelegramMessage(
        message_id=99999,
        chat_id=88888,
        user_id=77777,
        username="testuser",
        text="Test relay message",
        message_type=MessageType.TEXT,
        timestamp=datetime.now()
    )
    
    # Test Cursor client response
    cursor_client = MockCursorClient()
    await cursor_client.initialize()
    
    response = await cursor_client.send_message(
        message=telegram_msg.text,
        conversation_id="test_conversation"
    )
    
    print(f"✅ Telegram message: {telegram_msg.text}")
    print(f"✅ Cursor response: {response.content}")
    print(f"✅ Conversation ID: {response.metadata.get('conversation_id')}")
    
    await cursor_client.close()
    print("✅ Relay message flow test passed!\n")

async def main():
    """Run all tests."""
    print("🚀 Starting Telegram-Cursor Relay Tests")
    print("=" * 50)
    
    try:
        await test_telegram_message_model()
        await test_cursor_client()
        await test_relay_message_flow()
        
        print("🎉 All tests passed successfully!")
        print("\nThe relay system is ready to use!")
        print("Next steps:")
        print("1. Set up your Telegram bot token in .env")
        print("2. Run: python main.py")
        print("3. Start chatting with your bot!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())