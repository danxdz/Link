# Telegram-Cursor Web App

A modern web application that provides a beautiful interface for the Telegram-Cursor API relay system. Chat with AI through both web interface and Telegram bot simultaneously!

## 🚀 Features

- **🌐 Modern Web Interface**: Beautiful React-based chat interface
- **📱 Telegram Integration**: Real-time sync with Telegram bot
- **⚡ Real-time Communication**: WebSocket-based instant messaging
- **🎨 Responsive Design**: Works on desktop and mobile
- **📊 Live Status**: Connection status and message monitoring
- **🔧 Settings Panel**: Configuration and system information
- **🤖 Mock Mode**: Test without Cursor API access

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Socket.IO Client** for real-time communication
- **Lucide React** for beautiful icons
- **Modern CSS** with gradients and animations

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket communication
- **Telegram Bot API** integration
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- Node.js 16+ and npm
- Telegram Bot Token (from @BotFather)
- Cursor API Key (optional - mock mode available)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### 4. Open the App

Visit http://localhost:5173 in your browser and start chatting!

## ⚙️ Configuration

Edit `backend/.env`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Cursor API Configuration (optional)
CURSOR_API_KEY=your_cursor_api_key_here
CURSOR_API_URL=https://api.cursor.sh

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Getting Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the token to `backend/.env`

## 🎯 Usage

### Web Interface

1. **Start Chatting**: Type messages in the input field
2. **Real-time Responses**: Get instant AI responses
3. **Telegram Sync**: See Telegram messages in the sidebar
4. **Settings**: Click the settings icon for system info

### Telegram Bot

1. Find your bot on Telegram
2. Send `/start` to begin
3. Chat normally - messages sync to web interface
4. Responses appear in both Telegram and web app

## 🔧 Development

### Project Structure

```
telegram-cursor-web/
├── src/                    # React frontend
│   ├── App.tsx            # Main component
│   ├── App.css            # Styles
│   └── main.tsx           # Entry point
├── backend/               # Node.js backend
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── .env.example      # Environment template
├── package.json           # Root package.json
└── README.md             # This file
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Production
npm run build           # Build frontend for production
npm run start           # Start backend in production mode

# Installation
npm run install:all     # Install all dependencies
```

### API Endpoints

- `GET /api/status` - System status
- `GET /api/health` - Health check
- `POST /api/send-message` - Send message to Cursor API

### WebSocket Events

- `web_message` - Send message from web client
- `cursor_response` - Receive AI response
- `telegram_message` - Receive Telegram message
- `connect`/`disconnect` - Connection status

## 🎨 UI Features

### Chat Interface
- **Message Bubbles**: User and AI messages with distinct styling
- **Real-time Typing**: Instant message delivery
- **Auto-scroll**: Automatically scroll to new messages
- **Responsive Design**: Works on all screen sizes

### Sidebar
- **Telegram Messages**: Live feed of Telegram conversations
- **Message History**: See all Telegram interactions
- **Real-time Updates**: Instant sync with Telegram

### Status Indicators
- **Connection Status**: Visual connection indicator
- **Settings Panel**: System information and configuration
- **Message Count**: Track conversation length

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start backend
npm run start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Variables

Set these in production:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `CURSOR_API_KEY` - Your Cursor API key
- `PORT` - Server port (default: 3001)
- `NODE_ENV=production`

## 🔒 Security

- **CORS Configuration**: Properly configured for web requests
- **Environment Variables**: Sensitive data in environment files
- **Input Validation**: Message validation and sanitization
- **Rate Limiting**: Consider implementing for production

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**:
   - Check if backend is running on port 3001
   - Verify WebSocket connection in browser console
   - Check CORS configuration

2. **Telegram Bot Not Responding**:
   - Verify bot token in `.env`
   - Check if bot is not blocked
   - Review backend logs

3. **Build Issues**:
   - Clear node_modules and reinstall
   - Check Node.js version (16+)
   - Verify all dependencies installed

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the browser console for errors
2. Review backend logs
3. Verify environment configuration
4. Check API endpoints manually

## 🔮 Future Enhancements

- **File Upload**: Support for image and file sharing
- **Voice Messages**: Voice input and output
- **Multi-language**: Internationalization support
- **Themes**: Dark/light mode toggle
- **Notifications**: Browser notifications for new messages
- **PWA Support**: Progressive Web App capabilities