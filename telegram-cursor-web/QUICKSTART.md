# Quick Start Guide - Web App

Get your Telegram-Cursor web app running in 3 minutes!

## 🚀 Step 1: Get Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name (e.g., "My Web AI Assistant")
4. Choose a username (e.g., "my_web_ai_bot")
5. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 🛠️ Step 2: Setup

```bash
# Install all dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
```

## ⚙️ Step 3: Configure

Edit `backend/.env` and add your bot token:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
PORT=3001
NODE_ENV=development
```

## 🚀 Step 4: Run

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📱 Telegram Bot: Active
🤖 Cursor API: Mock mode
🌐 WebSocket: http://localhost:3001
```

## 💻 Step 5: Open Web App

1. Open http://localhost:5173 in your browser
2. You should see the beautiful chat interface
3. Start typing messages!

## 📱 Step 6: Test Telegram

1. Find your bot on Telegram
2. Send `/start`
3. Send any message
4. Watch it appear in the web app sidebar!

## 🎉 You're Done!

You now have:
- ✅ Beautiful web chat interface
- ✅ Real-time Telegram integration
- ✅ AI responses (mock mode)
- ✅ Live message sync

## 🔧 Optional: Real Cursor API

To use real Cursor API instead of mock:

1. Get your Cursor API key
2. Add to `backend/.env`:
   ```env
   CURSOR_API_KEY=your_cursor_api_key_here
   ```

## 📊 Monitor

- **Web App**: http://localhost:5173
- **Backend Status**: http://localhost:3001/api/status
- **Health Check**: http://localhost:3001/api/health

## 🆘 Need Help?

- Check browser console for errors
- Check backend terminal for logs
- Verify bot token is correct
- Make sure both servers are running

That's it! Enjoy your new web-based AI chat system! 🎉