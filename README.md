# Telegram-Cursor API Relay

A powerful relay system that connects Telegram bots with Cursor AI API, allowing you to chat with an AI agent directly through Telegram.

## 🚀 Features

- **Real-time Communication**: Send messages to Cursor AI through Telegram
- **Conversation Management**: Maintains conversation context across messages
- **Error Handling**: Comprehensive error handling and logging
- **Web API**: RESTful API for monitoring and control
- **Session Management**: Track active chat sessions
- **Mock Mode**: Test without actual Cursor API access

## 📋 Prerequisites

- Python 3.8 or higher
- Telegram Bot Token (from @BotFather)
- Cursor API Key (optional - mock mode available)

## 🛠️ Installation

### Quick Setup

1. **Clone or download this project**
2. **Run the setup script**:
   ```bash
   python setup.py
   ```
3. **Configure your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

### Manual Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Create necessary directories**:
   ```bash
   mkdir -p logs data sessions
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

## ⚙️ Configuration

Edit the `.env` file with your credentials:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash

# Cursor API Configuration (optional)
CURSOR_API_URL=https://api.cursor.sh
CURSOR_API_KEY=your_cursor_api_key_here

# Application Configuration
DEBUG=True
LOG_LEVEL=INFO
PORT=8000
```

### Getting Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token to your `.env` file

## 🚀 Usage

### Starting the Relay

```bash
python main.py
```

The relay will start and begin polling for Telegram messages.

### Telegram Commands

- `/start` - Start a new conversation
- `/help` - Show help message
- `/status` - Check connection status
- `/clear` - Clear conversation history

### Web API Endpoints

- `GET /` - Root endpoint
- `GET /status` - Get relay system status
- `GET /health` - Health check
- `POST /restart` - Restart the relay system

## 🔧 Architecture

```
Telegram Bot ←→ Relay System ←→ Cursor API
     ↓              ↓              ↓
  Messages    Message Queue    AI Responses
```

### Components

1. **TelegramClient**: Handles Telegram bot interactions
2. **CursorClient**: Manages Cursor API communication
3. **Relay**: Main orchestration logic
4. **Models**: Data structures and validation
5. **Logger**: Centralized logging system

## 📝 Message Flow

1. User sends message to Telegram bot
2. TelegramClient receives and validates message
3. Relay creates RelayMessage object
4. Message sent to Cursor API
5. Response received and formatted
6. Response sent back to Telegram user

## 🧪 Testing

The system includes a mock Cursor client for testing without API access:

```python
# In cursor_client.py
cursor_client = MockCursorClient()  # Uses mock responses
```

## 📊 Monitoring

### Logs

- `logs/relay.log` - General application logs
- `logs/errors.log` - Error logs only

### Status Endpoint

```bash
curl http://localhost:8000/status
```

Returns:
```json
{
  "is_running": true,
  "active_sessions": 2,
  "message_queue_size": 0,
  "telegram_bot_status": "active",
  "cursor_client_status": "active"
}
```

## 🔒 Security Considerations

- Bot tokens should be kept secure
- Consider implementing user whitelist/blacklist
- Rate limiting for API calls
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**:
   - Check bot token in `.env`
   - Verify bot is not blocked
   - Check logs for errors

2. **API connection issues**:
   - Verify Cursor API key
   - Check network connectivity
   - Review API rate limits

3. **Permission errors**:
   - Ensure bot has necessary permissions
   - Check user access controls

### Debug Mode

Enable debug mode in `.env`:
```env
DEBUG=True
LOG_LEVEL=DEBUG
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Review this documentation
3. Check the status endpoint
4. Create an issue with detailed information

## 🔮 Future Enhancements

- File sharing support
- Code execution capabilities
- Multi-language support
- Advanced conversation management
- Webhook support
- Docker containerization