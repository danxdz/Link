# 🤖 Telegram App Creator

An AI-powered Telegram bot that creates and deploys web applications instantly!

## 🚀 What It Does

Just send a message to the bot:
```
"make me the app todo list"
```

And get back:
```
✅ Done! Your todo list app is ready!
🔗 Live URL: https://todo-list-abc123.onrender.com
📁 GitHub: https://github.com/username/todo-list-abc123
```

## 🏗️ Architecture

```
Telegram → Bot Handler → AI Generator → GitHub → Deploy → Live URL
```

## 🛠️ Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in:

```bash
# Required
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username

# Optional (for real AI and deployment)
OPENAI_API_KEY=your_openai_api_key
RENDER_API_KEY=your_render_api_key
```

### 3. Get Your Tokens

#### Telegram Bot Token:
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow prompts to create your bot
4. Copy the token

#### GitHub Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Copy the token

#### OpenAI API Key (Optional):
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key

#### Render API Key (Optional):
1. Go to https://dashboard.render.com/account/api-keys
2. Create new API key
3. Copy the key

### 4. Run the Bot
```bash
npm start
```

## 🎯 Usage

### Telegram Commands:
- `/start` - Welcome message
- `/help` - Show help
- `/status` - Check bot status

### App Creation:
Just send any of these messages:
- "make me the app todo list"
- "create app blog with dark mode"
- "build me weather dashboard app"
- "i want calculator app"

## 🔧 Features

### ✅ What Works:
- **Telegram Bot** - Receives and responds to messages
- **App Generation** - Creates React apps with Tailwind CSS
- **GitHub Integration** - Creates repos and pushes code
- **Mock Deployment** - Returns demo URLs

### 🚧 With API Keys:
- **Real AI Generation** - Uses OpenAI to create custom apps
- **Real Deployment** - Deploys to Render automatically
- **Custom Features** - AI can create specific functionality

## 📁 Project Structure

```
telegram-app-creator/
├── server.js          # Main server and bot handler
├── app-generator.js   # AI-powered app creation
├── deployer.js        # Auto-deployment to Render
├── package.json       # Dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🎨 Generated Apps

Each app includes:
- **Modern React** with hooks
- **Tailwind CSS** for styling
- **Responsive design**
- **Interactive features**
- **Professional UI**
- **README with instructions**

## 🚀 Deployment

### Local Development:
```bash
npm run dev
```

### Production:
```bash
npm start
```

### Deploy to Render:
1. Connect your GitHub repo to Render
2. Set environment variables
3. Deploy!

## 🔒 Security

- All sensitive data stored in environment variables
- GitHub tokens have minimal required permissions
- No hardcoded credentials

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🆘 Support

If you encounter any issues:
1. Check your environment variables
2. Verify your tokens are valid
3. Check the console logs
4. Open an issue on GitHub

---

**Happy App Creating! 🎉**