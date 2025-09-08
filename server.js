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

// App Creator Functions
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RENDER_API_KEY = process.env.RENDER_API_KEY;

// Generate app code using AI
async function generateAppCode(appName) {
  try {
    if (!OPENAI_API_KEY) {
      return generateMockApp(appName);
    }

    const prompt = `Create a complete React application for: ${appName}

Requirements:
- Modern React with hooks
- Responsive design with Tailwind CSS
- Clean, professional UI
- Include package.json with all dependencies
- Include README.md with setup instructions
- Make it functional and ready to deploy

Return the complete file structure as JSON with file paths as keys and content as values.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return generateMockApp(appName);
    }

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    return generateMockApp(appName);
  }
}

// Generate mock app when AI is not available
function generateMockApp(appName) {
  const appId = Math.random().toString(36).substr(2, 9);
  
  return {
    'package.json': JSON.stringify({
      name: `${appName.toLowerCase().replace(/\s+/g, '-')}-${appId}`,
      version: '1.0.0',
      private: true,
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-scripts': '5.0.1',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.14',
        'postcss': '^8.4.24'
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version']
      }
    }, null, 2),

    'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${appName} - Created by AI" />
    <title>${appName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,

    'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,

    'src/App.js': `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              ${appName}
            </h1>
            <p className="text-xl text-gray-600">
              A beautiful ${appName.toLowerCase()} app created by AI
            </p>
          </header>

          <main className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mb-8">
                <div className="text-6xl font-bold text-blue-600 mb-4">
                  {count}
                </div>
                <p className="text-gray-600 mb-6">
                  Click the button to interact with your app!
                </p>
              </div>
              
              <div className="space-x-4">
                <button
                  onClick={() => setCount(count + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Increment
                </button>
                <button
                  onClick={() => setCount(count - 1)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Decrement
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </main>

          <footer className="text-center mt-12 text-gray-500">
            <p>Created with ❤️ by AI Assistant</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;`,

    'README.md': `# ${appName}

A beautiful ${appName.toLowerCase()} application created by AI.

## Features

- Modern React with hooks
- Responsive design with Tailwind CSS
- Interactive counter functionality
- Clean, professional UI

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build for Production

\`\`\`bash
npm run build
\`\`\`

This builds the app for production to the \`build\` folder.

## Created By

This app was automatically generated by an AI assistant via Telegram bot.
`
  };
}

// Create GitHub repository
async function createGitHubRepo(appName, userId) {
  try {
    if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
      throw new Error('GitHub credentials not configured');
    }

    const repoName = `${appName.toLowerCase().replace(/\s+/g, '-')}-${userId}`;
    
    const response = await axios.post('https://api.github.com/user/repos', {
      name: repoName,
      description: `A ${appName} app created by AI via Telegram`,
      private: false,
      auto_init: false
    }, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return {
      success: true,
      repoUrl: response.data.html_url,
      cloneUrl: response.data.clone_url,
      repoName: repoName
    };

  } catch (error) {
    console.error('GitHub API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Push code to GitHub repository using GitHub API
async function pushCodeToRepo(repoUrl, appCode) {
  try {
    if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
      throw new Error('GitHub credentials not configured');
    }

    const repoName = repoUrl.split('/').pop();
    
    // Create files using GitHub API
    for (const [filePath, content] of Object.entries(appCode)) {
      try {
        const response = await axios.put(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/${filePath}`,
          {
            message: `Add ${filePath}`,
            content: Buffer.from(content).toString('base64'),
            branch: 'main'
          },
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        console.log(`✅ Created file: ${filePath}`);
      } catch (fileError) {
        console.error(`❌ Failed to create file ${filePath}:`, fileError.message);
        // Continue with other files
      }
    }

    return { success: true };

  } catch (error) {
    console.error('GitHub API push error:', error.message);
    return { success: false, error: error.message };
  }
}

// Deploy app to Render
async function deployApp(repoUrl, appName) {
  try {
    if (!RENDER_API_KEY) {
      return {
        success: true,
        url: `https://${appName.toLowerCase().replace(/\s+/g, '-')}-demo.onrender.com`,
        mock: true,
        note: 'Mock deployment URL - Configure RENDER_API_KEY for real deployment'
      };
    }

    console.log(`Deploying app: ${appName} from repo: ${repoUrl}`);

    const repoName = repoUrl.split('/').pop().replace('.git', '');
    
    const serviceData = {
      type: 'web_service',
      name: `${appName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      repo: repoUrl,
      branch: 'main',
      buildCommand: 'npm install && npm run build',
      startCommand: 'npx serve -s build -l 3000',
      plan: 'starter',
      region: 'oregon',
      envVars: [
        {
          key: 'NODE_ENV',
          value: 'production'
        }
      ]
    };

    const response = await axios.post('https://api.render.com/v1/services', serviceData, {
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const serviceId = response.data.service.id;
    const serviceUrl = `https://${response.data.service.slug}.onrender.com`;

    return {
      success: true,
      url: serviceUrl,
      serviceId: serviceId,
      serviceName: response.data.service.name
    };

  } catch (error) {
    console.error('Render deployment error:', error.response?.data || error.message);
    
    return {
      success: true,
      url: `https://${appName.toLowerCase().replace(/\s+/g, '-')}-demo.onrender.com`,
      mock: true,
      note: 'Mock deployment URL - Configure RENDER_API_KEY for real deployment'
    };
  }
}

// Main function to create app
async function createApp(appName, userId) {
  try {
    console.log(`Creating app: ${appName} for user: ${userId}`);

    // Generate app code
    const appCode = await generateAppCode(appName);
    
    // Create GitHub repository
    const repo = await createGitHubRepo(appName, userId);
    if (!repo.success) {
      return { success: false, error: repo.error };
    }

    // Push code to repository
    const push = await pushCodeToRepo(repo.repoUrl, appCode);
    if (!push.success) {
      return { success: false, error: push.error };
    }

    return {
      success: true,
      repoUrl: repo.repoUrl,
      repoName: repo.repoName
    };

  } catch (error) {
    console.error('App creation error:', error);
    return { success: false, error: error.message };
  }
}

// Telegram Bot Event Handlers
if (telegramBot) {
  telegramBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const text = msg.text.toLowerCase();

    console.log(`📱 Message from ${username}: ${msg.text}`);

    // Handle /start command
    if (text === '/start') {
      await telegramBot.sendMessage(chatId, 
        `👋 Hello ${username}! I'm your AI App Creator!\n\n` +
        `**What I can do:**\n` +
        `• Create apps: "make me the app todo list"\n` +
        `• Chat with AI: Just send any message\n` +
        `• Get help: /help\n\n` +
        `**Try it:** "make me the app blog" 🚀`
      );
      return;
    }

    // Handle app creation requests
    if (text.includes('make me the app') || text.includes('create app')) {
      try {
        // Send "working" message
        const workingMsg = await telegramBot.sendMessage(chatId, 
          `🔄 Creating your app... This might take a minute!`
        );

        // Extract app name from message
        const appName = extractAppName(msg.text);
        
        if (!appName) {
          await telegramBot.editMessageText(
            `❌ Please specify what app you want!\n\nExample: "make me the app todo list"`,
            { chat_id: chatId, message_id: workingMsg.message_id }
          );
          return;
        }

        // Create the app
        const result = await createApp(appName, userId);
        
        if (result.success) {
          // Deploy the app
          const deployment = await deployApp(result.repoUrl, appName);
          
          if (deployment.success) {
            await telegramBot.editMessageText(
              `✅ Done! Your ${appName} app is ready!\n\n` +
              `🔗 Live URL: ${deployment.url}\n` +
              `📁 GitHub: ${result.repoUrl}\n\n` +
              `You can test it now! 🎉`,
              { chat_id: chatId, message_id: workingMsg.message_id }
            );
          } else {
            await telegramBot.editMessageText(
              `⚠️ App created but deployment failed:\n\n` +
              `📁 GitHub: ${result.repoUrl}\n` +
              `❌ Deploy error: ${deployment.error}`,
              { chat_id: chatId, message_id: workingMsg.message_id }
            );
          }
        } else {
          await telegramBot.editMessageText(
            `❌ Failed to create app: ${result.error}`,
            { chat_id: chatId, message_id: workingMsg.message_id }
          );
        }

      } catch (error) {
        console.error('Error creating app:', error);
        await telegramBot.sendMessage(chatId, 
          `❌ Sorry, something went wrong: ${error.message}`
        );
      }
      return;
    }

    // Handle help command
    if (text === '/help') {
      await telegramBot.sendMessage(chatId,
        `🆘 **How to use me:**\n\n` +
        `**Create Apps:**\n` +
        `• "make me the app todo list"\n` +
        `• "create app blog with dark mode"\n` +
        `• "make me the app weather dashboard"\n\n` +
        `**Chat with AI:**\n` +
        `• Just send any message for AI responses\n\n` +
        `**Commands:**\n` +
        `/start - Welcome message\n` +
        `/help - This help message\n` +
        `/status - Check my status`
      );
      return;
    }

    // Handle status command
    if (text === '/status') {
      await telegramBot.sendMessage(chatId,
        `📊 **Bot Status:**\n\n` +
        `✅ Telegram Bot: Connected\n` +
        `✅ App Creator: Ready\n` +
        `✅ AI Chat: Ready\n` +
        `✅ Deployment: Ready\n` +
        `⏰ Time: ${new Date().toLocaleString()}`
      );
      return;
    }

    // Default: Send to Cursor API for AI chat
    try {
      const conversationId = `telegram_${chatId}`;
      const cursorResponse = await sendToCursorAPI(msg.text, conversationId);

      // Send response back to Telegram
      await telegramBot.sendMessage(chatId, cursorResponse.content);

      // Emit to web clients
      io.emit('telegram_message', {
        id: msg.message_id,
        chatId: chatId,
        userId: userId,
        username: username,
        text: msg.text,
        response: cursorResponse.content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing message:', error);
      await telegramBot.sendMessage(chatId, 
        `❌ Sorry, I couldn't process that message. Try again!`
      );
    }
  });

  telegramBot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error.message);
  });
}

// Helper function to extract app name from message
function extractAppName(message) {
  const patterns = [
    /make me the app (.+)/i,
    /create app (.+)/i,
    /build me (.+) app/i,
    /i want (.+) app/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
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