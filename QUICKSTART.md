# Quick Start Guide

Get your Telegram-Cursor API relay running in 5 minutes!

## 🚀 Step 1: Get Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name for your bot (e.g., "My Cursor Assistant")
4. Choose a username (e.g., "my_cursor_assistant_bot")
5. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 🛠️ Step 2: Setup the Relay

```bash
# Run the setup script
python setup.py

# Copy environment template
cp .env.example .env
```

## ⚙️ Step 3: Configure

Edit `.env` file and add your bot token:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
DEBUG=True
LOG_LEVEL=INFO
```

## 🚀 Step 4: Run

```bash
python main.py
```

You should see:
```
✅ Telegram bot initialized successfully
✅ Cursor client initialized successfully
✅ Relay system initialized successfully
🚀 Starting Telegram-Cursor relay...
✅ Telegram bot started polling
✅ Relay system started successfully
```

## 💬 Step 5: Test

1. Open Telegram and find your bot
2. Send `/start`
3. Send any message like "Hello, how are you?"
4. You should get a response from the AI!

## 🔧 Optional: Real Cursor API

To use the real Cursor API instead of mock responses:

1. Get your Cursor API key
2. Add it to `.env`:
   ```env
   CURSOR_API_KEY=your_cursor_api_key_here
   ```

## 📊 Monitor

Check status at: http://localhost:8000/status

## 🆘 Need Help?

- Check logs in `logs/` directory
- Review the full README.md
- Enable debug mode: `DEBUG=True` in `.env`

That's it! You now have a working Telegram-Cursor AI relay! 🎉