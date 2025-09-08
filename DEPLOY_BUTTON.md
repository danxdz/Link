# 🚀 One-Click Deploy to Render!

## 🎯 **Magic Deploy Button**

Click this button to deploy instantly to Render:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/danxdz/Test)

## 🔧 **What Happens When You Click:**

1. **Opens Render.com** with your repository pre-selected
2. **Auto-configures** the service settings
3. **Sets up** Node.js environment
4. **Ready to deploy** with one more click!

## ⚙️ **Manual Configuration (if needed):**

If the magic button doesn't work, here's the manual setup:

### Service Configuration:
```
Name: telegram-cursor-relay
Environment: Node
Build Command: npm run build
Start Command: npm start
```

### Environment Variables:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=production
```

## 🎉 **After Deployment:**

- ✅ **Web Interface**: Your app will be live at `https://your-app-name.onrender.com`
- ✅ **Telegram Bot**: Configure with your bot token
- ✅ **Real-time Chat**: WebSocket communication works perfectly
- ✅ **Mobile Access**: Use Telegram bot for mobile

## 📱 **Next Steps:**

1. **Get Telegram Bot Token**:
   - Open Telegram, search for `@BotFather`
   - Send `/newbot` and follow instructions
   - Copy the token

2. **Set Environment Variable**:
   - Go to your Render dashboard
   - Click on your service
   - Go to "Environment" tab
   - Add `TELEGRAM_BOT_TOKEN=your_token_here`

3. **Start Chatting**:
   - Visit your deployed URL
   - Start chatting with AI!

**🎯 Render is perfect for this project - it handles everything Vercel can't! 🎯**