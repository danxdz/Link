const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Configuration
const PORT = process.env.PORT || 3001;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CURSOR_API_KEY = process.env.CURSOR_API_KEY;
const CURSOR_API_URL = process.env.CURSOR_API_URL || 'https://api.cursor.sh';

// Initialize Telegram Bot
let telegramBot = null;
if (TELEGRAM_TOKEN) {
  try {
    telegramBot = new TelegramBot(TELEGRAM_TOKEN, { 
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    
    // Handle polling errors gracefully
    telegramBot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error.message);
      if (error.code === 409) {
        console.log('Bot conflict detected. Stopping polling...');
        telegramBot.stopPolling();
        // Restart polling after a delay
        setTimeout(() => {
          console.log('Restarting Telegram bot polling...');
          telegramBot.startPolling();
        }, 5000);
      }
    });
    
    console.log('Telegram bot initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error.message);
  }
}

// Store active connections and conversations
const activeConnections = new Map();
const conversations = new Map();

// Mock Cursor API response for testing
const mockCursorResponse = (message) => {
  return {
    id: `mock_${Date.now()}`,
    content: `I received your message: "${message}". This is a mock response from Cursor AI. In a real implementation, this would be processed by the actual Cursor API.`,
    timestamp: new Date().toISOString(),
    metadata: {
      model: 'mock-cursor-ai',
      usage: { prompt_tokens: message.length, completion_tokens: 50 }
    }
  };
};

// Send message to Cursor API
const sendToCursorAPI = async (message, conversationId = null) => {
  try {
    if (!CURSOR_API_KEY) {
      // Use mock response if no API key
      return mockCursorResponse(message);
    }

    const response = await axios.post(`${CURSOR_API_URL}/v1/chat/completions`, {
      message: message,
      conversation_id: conversationId,
      model: 'cursor-ai',
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${CURSOR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.id,
      content: response.data.choices[0].message.content,
      timestamp: new Date().toISOString(),
      metadata: response.data
    };
  } catch (error) {
    console.error('Cursor API Error:', error.message);
    return mockCursorResponse(message);
  }
};

// Telegram Bot Event Handlers
if (telegramBot) {
  telegramBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const text = msg.text;

    console.log(`Telegram message from ${username}: ${text}`);

    // Send to Cursor API
    const conversationId = `telegram_${chatId}`;
    const cursorResponse = await sendToCursorAPI(text, conversationId);

    // Send response back to Telegram
    await telegramBot.sendMessage(chatId, cursorResponse.content);

    // Emit to web clients
    io.emit('telegram_message', {
      id: msg.message_id,
      chatId: chatId,
      userId: userId,
      username: username,
      text: text,
      response: cursorResponse.content,
      timestamp: new Date().toISOString()
    });
  });

}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Web client connected:', socket.id);
  
  activeConnections.set(socket.id, {
    socket: socket,
    connectedAt: new Date(),
    conversationId: null
  });

  // Handle web client messages
  socket.on('web_message', async (data) => {
    try {
      const { message, conversationId } = data;
      console.log(`Web message: ${message}`);

      // Send to Cursor API
      const cursorResponse = await sendToCursorAPI(message, conversationId);

      // Send response back to web client
      socket.emit('cursor_response', {
        id: cursorResponse.id,
        content: cursorResponse.content,
        timestamp: cursorResponse.timestamp,
        metadata: cursorResponse.metadata
      });

      // Store conversation
      if (conversationId) {
        if (!conversations.has(conversationId)) {
          conversations.set(conversationId, []);
        }
        conversations.get(conversationId).push({
          type: 'user',
          message: message,
          timestamp: new Date().toISOString()
        });
        conversations.get(conversationId).push({
          type: 'assistant',
          message: cursorResponse.content,
          timestamp: cursorResponse.timestamp
        });
      }

    } catch (error) {
      console.error('Error handling web message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle conversation history request
  socket.on('get_conversation', (conversationId) => {
    const history = conversations.get(conversationId) || [];
    socket.emit('conversation_history', history);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Web client disconnected:', socket.id);
    activeConnections.delete(socket.id);
  });
});

// REST API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    telegram_bot: telegramBot ? 'connected' : 'not_configured',
    cursor_api: CURSOR_API_KEY ? 'configured' : 'mock_mode',
    active_connections: activeConnections.size,
    conversations: conversations.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/send-message', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const cursorResponse = await sendToCursorAPI(message, conversationId);
    
    res.json({
      success: true,
      response: cursorResponse
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  if (telegramBot) {
    telegramBot.stopPolling();
    console.log('Telegram bot polling stopped');
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Gracefully shutting down...');
  if (telegramBot) {
    telegramBot.stopPolling();
    console.log('Telegram bot polling stopped');
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Telegram Bot: ${telegramBot ? 'Active' : 'Not configured'}`);
  console.log(`🤖 Cursor API: ${CURSOR_API_KEY ? 'Configured' : 'Mock mode'}`);
  console.log(`🌐 WebSocket: http://0.0.0.0:${PORT}`);
});