"""
Simple test script for the Telegram-Cursor API relay.
"""
import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all modules can be imported."""
    print("🧪 Testing imports...")
    
    try:
        from models import TelegramMessage, MessageType, CursorMessage
        print("✅ Models imported successfully")
        
        from config import settings
        print("✅ Config imported successfully")
        
        from logger import get_logger
        print("✅ Logger imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_models():
    """Test the data models."""
    print("\n🧪 Testing data models...")
    
    try:
        from models import TelegramMessage, MessageType, CursorMessage
        
        # Test TelegramMessage
        telegram_msg = TelegramMessage(
            message_id=12345,
            chat_id=67890,
            user_id=11111,
            username="testuser",
            text="This is a test message",
            message_type=MessageType.TEXT,
            timestamp=datetime.now()
        )
        
        print(f"✅ TelegramMessage created: {telegram_msg.text}")
        
        # Test CursorMessage
        cursor_msg = CursorMessage(
            message_id="cursor_123",
            content="This is a test response",
            message_type=MessageType.TEXT,
            timestamp=datetime.now()
        )
        
        print(f"✅ CursorMessage created: {cursor_msg.content}")
        
        return True
    except Exception as e:
        print(f"❌ Model test error: {e}")
        return False

def test_config():
    """Test configuration loading."""
    print("\n🧪 Testing configuration...")
    
    try:
        from config import settings
        
        print(f"✅ Debug mode: {settings.debug}")
        print(f"✅ Log level: {settings.log_level}")
        print(f"✅ Port: {settings.port}")
        
        return True
    except Exception as e:
        print(f"❌ Config test error: {e}")
        return False

def test_logger():
    """Test logger initialization."""
    print("\n🧪 Testing logger...")
    
    try:
        from logger import get_logger
        
        logger = get_logger("test")
        logger.info("Test log message")
        
        print("✅ Logger test passed")
        return True
    except Exception as e:
        print(f"❌ Logger test error: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting Simple Tests for Telegram-Cursor Relay")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_models,
        test_config,
        test_logger
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The relay system is ready to use!")
        print("\nNext steps:")
        print("1. Set up your Telegram bot token in .env")
        print("2. Run: python3 main.py")
        print("3. Start chatting with your bot!")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()