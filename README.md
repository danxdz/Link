# Telegram-Cursor API Relay

A powerful relay system that connects Telegram bots with Cursor AI API, featuring both a **Python backend** and a **modern web application**. Chat with AI through Telegram, web interface, or both simultaneously!

## 🚀 **RECOMMENDED: Web Application**

The **Node.js web application** provides the best user experience:
- ✅ **Beautiful Web Interface**: Modern React UI
- ✅ **Real-time Communication**: WebSocket support
- ✅ **Telegram Integration**: Live message sync
- ✅ **Easy Deployment**: Perfect for Render.com
- ✅ **Mobile Responsive**: Works on all devices

## 🎯 **Quick Start (Web App)**

### 1. Get Telegram Bot Token
- Open Telegram, search for `@BotFather`
- Send `/newbot` and follow instructions
- Copy the bot token

### 2. Deploy to Render.com (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy ready"
git push origin main

# 2. Connect to Render
# - Go to render.com
# - Connect GitHub repo
# - Set environment variables:
#   TELEGRAM_BOT_TOKEN=your_token_here
#   NODE_ENV=production
# - Deploy!
```

### 3. Local Development
```bash
# Install dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Telegram bot token

# Start development servers
npm run dev
```

Then open **http://localhost:5173** and start chatting!

## 🌟 **Features**

### Web Application
- **🌐 Modern Chat Interface**: Beautiful React UI with real-time messaging
- **📱 Telegram Integration**: Live sync with Telegram bot
- **⚡ WebSocket Communication**: Instant message delivery
- **🎨 Responsive Design**: Perfect on desktop and mobile
- **📊 Live Status**: Connection monitoring and system info
- **🔧 Settings Panel**: Configuration and diagnostics

### Python Backend (Alternative)
- **🐍 FastAPI Server**: RESTful API with health checks
- **🤖 Telegram Bot**: Full bot integration with commands
- **🧠 Cursor API**: Real API integration + mock mode
- **📝 Comprehensive Logging**: Detailed error tracking
- **🐳 Docker Support**: Easy containerized deployment

## 🛠️ **Tech Stack**

### Web Application
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.IO
- **Real-time**: WebSocket communication
- **Styling**: Modern CSS with gradients
- **Icons**: Lucide React

### Python Backend
- **Framework**: FastAPI + Uvicorn
- **Telegram**: python-telegram-bot
- **HTTP**: aiohttp + requests
- **Data**: Pydantic models
- **Logging**: Loguru

## 📁 **Project Structure**

```
/workspace/
├── src/                    # React frontend
│   ├── App.tsx            # Main chat component
│   ├── App.css            # Beautiful styles
│   └── main.tsx           # Entry point
├── backend/               # Node.js backend
│   ├── server.js          # Express + Socket.IO server
│   ├── package.json       # Backend dependencies
│   └── .env.example      # Environment template
├── package.json           # Root package management
├── Dockerfile            # Production container
├── docker-compose.yml    # Easy deployment
├── README.md             # This file
├── DEPLOYMENT_GUIDE.md   # Complete deployment guide
└── [Python files]        # Alternative Python backend
```

## 🚀 **Deployment Options**

### 🌐 **Render.com (Recommended)**
- **Best for**: Web application deployment
- **Features**: Auto-deploy, SSL, custom domains
- **Cost**: Free tier available
- **Setup**: Connect GitHub repo, set env vars, deploy!

### 🐳 **Docker**
```bash
docker-compose up -d
```

### ☁️ **Other Platforms**
- **Railway**: `railway up`
- **Fly.io**: `fly deploy`
- **Heroku**: `git push heroku main`
- **Vercel**: Frontend only
- **Netlify**: Frontend only

## ⚙️ **Configuration**

### Environment Variables
```env
# Required
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional
CURSOR_API_KEY=your_cursor_api_key_here
CURSOR_API_URL=https://api.cursor.sh
NODE_ENV=production
PORT=10000
```

### Getting Telegram Bot Token
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name and username
4. Copy the bot token

## 🎯 **Usage**

### Web Interface
1. **Open the app**: Visit your deployed URL or localhost:5173
2. **Start chatting**: Type messages in the input field
3. **Real-time responses**: Get instant AI responses
4. **Telegram sync**: See Telegram messages in sidebar

### Telegram Bot
1. **Find your bot**: Search for your bot on Telegram
2. **Send `/start`**: Begin conversation
3. **Chat normally**: Messages sync to web interface
4. **Get responses**: AI responses appear in both places

## 📊 **Monitoring**

### Health Checks
- **App Health**: `/api/health`
- **System Status**: `/api/status`
- **Telegram Bot**: Send `/start` to test

### Logs
- **Web App**: Browser console + server logs
- **Python Backend**: `logs/relay.log` and `logs/errors.log`

## 🔧 **Development**

### Web Application
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Production
npm run build           # Build frontend
npm run start           # Start backend
```

### Python Backend
```bash
# Development
python3 setup.py
python3 main.py

# Production
docker-compose up -d
```

## 🐛 **Troubleshooting**

### Common Issues
1. **Connection Issues**: Check if backend is running
2. **Telegram Bot Not Responding**: Verify bot token
3. **Build Issues**: Clear node_modules and reinstall
4. **Deployment Issues**: Check environment variables

### Debug Mode
```env
NODE_ENV=development
LOG_LEVEL=DEBUG
```

## 📚 **Documentation**

- **📖 README.md**: This file
- **🚀 DEPLOYMENT_GUIDE.md**: Complete deployment guide
- **⚡ QUICKSTART.md**: Quick start guide
- **📋 FINAL_CHECKLIST.md**: Project completeness checklist

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For issues and questions:
1. Check the deployment guide
2. Review environment configuration
3. Check logs for errors
4. Verify Telegram bot token

## 🔮 **Future Enhancements**

- **File Upload**: Support for images and files
- **Voice Messages**: Voice input and output
- **Multi-language**: Internationalization
- **Themes**: Dark/light mode
- **Notifications**: Browser notifications
- **PWA Support**: Progressive Web App

---

## 🎉 **Ready to Deploy!**

Your Telegram-Cursor relay is complete and ready for deployment! Choose the **web application** for the best user experience, or use the **Python backend** for a more traditional API approach.

**🚀 Start chatting with AI through Telegram and web interface! 🚀**