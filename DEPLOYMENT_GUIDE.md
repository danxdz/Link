# 🚀 Deployment Guide - Telegram-Cursor Relay

## 🎯 **RECOMMENDED: Node.js Web App Deployment**

The **Node.js web application** is the best choice for deployment because:
- ✅ **Modern Web Interface**: Beautiful React UI
- ✅ **Single Deployment**: One app serves everything
- ✅ **Real-time Features**: WebSocket support
- ✅ **Better UX**: Users get a web interface
- ✅ **Render Optimized**: Perfect for Render.com

## 🌐 **Render.com Deployment (RECOMMENDED)**

### Step 1: Prepare Your Repository
```bash
# Your project is already ready in /workspace
# All files are merged and deployment-ready
```

### Step 2: Deploy to Render

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**:
   ```
   Name: telegram-cursor-relay
   Environment: Node
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   CURSOR_API_KEY=your_cursor_api_key_here (optional)
   NODE_ENV=production
   PORT=10000 (Render sets this automatically)
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build to complete
   - Your app will be live at `https://your-app-name.onrender.com`

### Step 3: Configure Telegram Webhook (Optional)
```bash
# Set webhook to your Render URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app-name.onrender.com/api/telegram-webhook"}'
```

## 🐳 **Docker Deployment**

### Local Docker
```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Docker on Cloud Platforms
- **Railway**: Connect GitHub repo, auto-deploy
- **Fly.io**: `fly deploy`
- **DigitalOcean App Platform**: Connect repo, auto-deploy

## ☁️ **Other Cloud Platforms**

### Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel

# Note: You'll need a separate backend service
```

### Netlify (Frontend Only)
```bash
# Build command: npm run build:frontend
# Publish directory: dist
# Note: You'll need a separate backend service
```

### Heroku
```bash
# Install Heroku CLI
npm i -g heroku

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## 🔧 **Environment Variables**

### Required
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=production
```

### Optional
```env
CURSOR_API_KEY=your_cursor_api_key_here
CURSOR_API_URL=https://api.cursor.sh
PORT=10000
```

## 📱 **Getting Telegram Bot Token**

1. **Open Telegram** and search for `@BotFather`
2. **Send `/newbot`** command
3. **Choose a name** (e.g., "My AI Assistant")
4. **Choose a username** (e.g., "my_ai_assistant_bot")
5. **Copy the token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 🎯 **Deployment Checklist**

### Before Deployment
- ✅ **Repository Ready**: All files in main directory
- ✅ **Dependencies**: package.json configured
- ✅ **Build Scripts**: Frontend builds to dist/
- ✅ **Environment**: .env.example created
- ✅ **Documentation**: README updated

### After Deployment
- ✅ **App Accessible**: URL loads correctly
- ✅ **API Working**: /api/health returns 200
- ✅ **Telegram Bot**: Responds to messages
- ✅ **WebSocket**: Real-time chat works
- ✅ **Environment**: Variables set correctly

## 🚀 **Quick Deploy Commands**

### Render.com (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy ready"
git push origin main

# 2. Connect to Render
# - Go to render.com
# - Connect GitHub repo
# - Set environment variables
# - Deploy!
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

## 🔍 **Troubleshooting**

### Common Issues

1. **Build Fails**:
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check build logs for errors

2. **App Won't Start**:
   - Verify environment variables
   - Check PORT configuration
   - Review server logs

3. **Telegram Bot Not Working**:
   - Verify bot token is correct
   - Check if bot is not blocked
   - Review Telegram API logs

4. **WebSocket Issues**:
   - Check CORS configuration
   - Verify Socket.IO setup
   - Review browser console

### Debug Commands
```bash
# Check environment
echo $TELEGRAM_BOT_TOKEN

# Test API
curl https://your-app.onrender.com/api/health

# Check logs
# (Platform-specific logging commands)
```

## 🎉 **Success!**

Once deployed, you'll have:
- ✅ **Web Interface**: Beautiful chat UI
- ✅ **Telegram Bot**: Mobile access
- ✅ **Real-time Sync**: Messages sync between platforms
- ✅ **AI Responses**: Powered by Cursor API
- ✅ **Production Ready**: Scalable and reliable

## 📊 **Monitoring**

### Health Checks
- **App Health**: `https://your-app.onrender.com/api/health`
- **System Status**: `https://your-app.onrender.com/api/status`
- **Telegram Bot**: Send `/start` to your bot

### Logs
- **Render**: Built-in logging dashboard
- **Railway**: Real-time logs in dashboard
- **Fly.io**: `fly logs` command

**🎯 Your Telegram-Cursor relay is now live and ready to use! 🎯**