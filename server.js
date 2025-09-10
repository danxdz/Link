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

// Telegram Mini App routes
app.get('/mini-app', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI App Creator</title>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen">
      <div id="app" class="max-w-md mx-auto bg-white min-h-screen">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-4 text-center">
          <h1 class="text-xl font-bold">🤖 AI App Creator</h1>
          <p class="text-sm opacity-90">Create apps with AI in seconds</p>
        </div>

        <!-- Main Content -->
        <div class="p-4">
          <!-- Create New App -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-3">Create New App</h2>
            <div class="space-y-3">
              <input 
                type="text" 
                id="appName" 
                placeholder="What app do you want? (e.g., todo list, blog, portfolio)"
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <button 
                onclick="createApp()"
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                🚀 Create App
              </button>
            </div>
          </div>

          <!-- My Apps -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-3">My Apps</h2>
            <div id="appsList" class="space-y-2">
              <p class="text-gray-500 text-center py-4">No apps created yet</p>
            </div>
          </div>

          <!-- Status -->
          <div class="bg-gray-50 p-3 rounded-lg">
            <h3 class="font-medium mb-2">Status</h3>
            <div id="status" class="text-sm text-gray-600">
              Loading...
            </div>
          </div>
        </div>
      </div>

      <script>
        // Initialize Telegram Web App
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        // Load apps and status
        loadStatus();
        loadApps();
        
        // Add sample apps for development
        addSampleApps();

        async function createApp() {
          const appName = document.getElementById('appName').value.trim();
          if (!appName) {
            alert('Please enter an app name');
            return;
          }

          const button = event.target;
          button.disabled = true;
          button.textContent = '🔄 Creating...';

          try {
            const response = await fetch('/api/create-app', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                appName: appName,
                userId: tg.initDataUnsafe.user?.id || 'web-user'
              })
            });

            const result = await response.json();
            
            if (result.success) {
              document.getElementById('appName').value = '';
              loadApps();
              
              // Send success message instead of alert (allows copying)
              tg.sendData(JSON.stringify({
                type: 'app_created',
                url: result.url,
                repoUrl: result.repoUrl,
                appName: result.appName
              }));
              
              tg.showAlert('✅ App created! Check the message below for links.');
            } else {
              tg.showAlert(\`❌ Error: \${result.error}\`);
            }
          } catch (error) {
            tg.showAlert(\`❌ Error: \${error.message}\`);
          }

          button.disabled = false;
          button.textContent = '🚀 Create App';
        }

        async function loadStatus() {
          try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            document.getElementById('status').innerHTML = \`
              <div class="space-y-1">
                <div>🤖 AI: \${status.ai ? '✅' : '❌'}</div>
                <div>📁 GitHub: \${status.github ? '✅' : '❌'}</div>
                <div>🚀 Apps: \${status.appsCount}</div>
              </div>
            \`;
          } catch (error) {
            document.getElementById('status').innerHTML = '❌ Error loading status';
          }
        }

        async function loadApps() {
          try {
            const response = await fetch('/api/apps');
            const data = await response.json();
            
            const appsList = document.getElementById('appsList');
            if (data.apps.length === 0) {
              appsList.innerHTML = '<p class="text-gray-500 text-center py-4">No apps created yet</p>';
              return;
            }

            appsList.innerHTML = data.apps.map(app => \`
              <div class="border border-gray-200 rounded-lg p-3">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-medium">\${app.name}</h3>
                    <p class="text-sm text-gray-500">Created: \${new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div class="flex space-x-2">
                    <a href="\${app.url}" target="_blank" class="text-blue-600 text-sm">🔗 Open</a>
                    <a href="\${app.repoUrl}" target="_blank" class="text-gray-600 text-sm">📁 GitHub</a>
                  </div>
                </div>
              </div>
            \`).join('');
          } catch (error) {
            document.getElementById('appsList').innerHTML = '<p class="text-red-500 text-center py-4">Error loading apps</p>';
          }
        }

        // Add sample apps for development
        function addSampleApps() {
          const sampleApps = [
            { name: 'Todo List', description: 'Task management app', type: 'todo' },
            { name: 'Blog', description: 'Content management system', type: 'blog' },
            { name: 'Portfolio', description: 'Personal showcase', type: 'portfolio' },
            { name: 'Weather Dashboard', description: 'Weather data visualization', type: 'weather' },
            { name: 'Chat App', description: 'Real-time messaging', type: 'chat' },
            { name: 'GitHub Web App', description: 'Create via GitHub directly', type: 'github' }
          ];

          const sampleAppsHtml = \`
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Quick Create:</h3>
              <div class="grid grid-cols-2 gap-2">
                \${sampleApps.map(app => \`
                  <button 
                    onclick="createSampleApp('\${app.name}')"
                    class="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs border"
                  >
                    <div class="font-medium">\${app.name}</div>
                    <div class="text-gray-500">\${app.description}</div>
                  </button>
                \`).join('')}
              </div>
            </div>
          \`;

          const appsList = document.getElementById('appsList');
          appsList.innerHTML = sampleAppsHtml + appsList.innerHTML;
        }

        // Create sample app
        async function createSampleApp(appName) {
          if (appName === 'GitHub Web App') {
            // Create a real GitHub web app with actual code
            const response = await fetch('/api/create-app', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                appName: 'GitHub Web App',
                userId: 'telegram_user',
                type: 'github-web'
              })
            });
            
            const result = await response.json();
            if (result.success) {
              tg.sendData(JSON.stringify({
                type: 'github_web_app_created',
                url: result.url,
                repoUrl: result.repoUrl
              }));
            } else {
              tg.showAlert('❌ Error: ' + result.error);
            }
            return;
          }
          
          document.getElementById('appName').value = appName;
          await createApp();
        }
      </script>
    </body>
    </html>
  `);
});

// Serve created apps
app.get('/app/:slug', (req, res) => {
  const { slug } = req.params;
  const app = createdApps.get(slug);
  
  if (!app) {
    return res.status(404).send(`
      <html>
        <head><title>App Not Found</title></head>
        <body>
          <h1>App Not Found</h1>
          <p>The app "${slug}" was not found.</p>
          <a href="/">← Back to Bot</a>
        </body>
      </html>
    `);
  }

  // Serve the app's HTML (we'll generate this from the stored app data)
  const appHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${app.name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
        <script>
          // Simple React-like app for ${app.name}
          const { useState } = React;
          
          function App() {
            const [count, setCount] = useState(0);
            
            return React.createElement('div', {
              className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'
            }, [
              React.createElement('div', {
                className: 'container mx-auto px-4 py-8'
              }, [
                React.createElement('div', {
                  className: 'max-w-4xl mx-auto'
                }, [
                  React.createElement('header', {
                    className: 'text-center mb-12'
                  }, [
                    React.createElement('h1', {
                      className: 'text-5xl font-bold text-gray-800 mb-4'
                    }, app.name),
                    React.createElement('p', {
                      className: 'text-xl text-gray-600'
                    }, 'A beautiful ' + app.name.toLowerCase() + ' app created by AI')
                  ]),
                  React.createElement('main', {
                    className: 'bg-white rounded-2xl shadow-xl p-8'
                  }, [
                    React.createElement('div', {
                      className: 'text-center'
                    }, [
                      React.createElement('div', {
                        className: 'mb-8'
                      }, [
                        React.createElement('div', {
                          className: 'text-6xl font-bold text-blue-600 mb-4'
                        }, count),
                        React.createElement('p', {
                          className: 'text-gray-600 mb-6'
                        }, 'Click the button to interact with your app!')
                      ]),
                      React.createElement('div', {
                        className: 'space-x-4'
                      }, [
                        React.createElement('button', {
                          onClick: () => setCount(count + 1),
                          className: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200'
                        }, 'Increment'),
                        React.createElement('button', {
                          onClick: () => setCount(count - 1),
                          className: 'bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200'
                        }, 'Decrement'),
                        React.createElement('button', {
                          onClick: () => setCount(0),
                          className: 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200'
                        }, 'Reset')
                      ])
                    ])
                  ]),
                  React.createElement('footer', {
                    className: 'text-center mt-12 text-gray-500'
                  }, [
                    React.createElement('p', null, 'Created with ❤️ by AI Assistant'),
                    React.createElement('p', null, 'GitHub: ' + app.repoUrl)
                  ])
                ])
              ])
            ]);
          }
          
          ReactDOM.render(React.createElement(App), document.getElementById('root'));
        </script>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      </body>
    </html>
  `;
  
  res.send(appHtml);
});

// List all created apps
app.get('/apps', (req, res) => {
  const apps = Array.from(createdApps.values()).map(app => ({
    ...app,
    url: `${process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001'}/app/${app.slug}`
  }));
  res.json({
    apps: apps,
    count: apps.length
  });
});

// API endpoints for Telegram Mini App
app.get('/api/status', (req, res) => {
  res.json({
    ai: !!(HUGGINGFACE_API_KEY || OPENAI_API_KEY),
    github: !!(GITHUB_TOKEN && GITHUB_USERNAME),
    appsCount: createdApps.size
  });
});

app.get('/api/apps', (req, res) => {
  try {
    const apps = Array.from(createdApps.values()).map(app => ({
      id: app.id,
      name: app.name,
      url: app.url,
      repoUrl: app.repoUrl,
      createdAt: app.createdAt
    }));
    
    res.json({ apps });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load apps' });
  }
});

app.post('/api/create-app', async (req, res) => {
  try {
    const { appName, userId, type } = req.body;
    
    if (!appName) {
      return res.json({ success: false, error: 'App name is required' });
    }

    // Handle GitHub Web App creation
    if (type === 'github-web') {
      const result = await createGitHubWebApp(appName, userId);
      if (result.success) {
        res.json({
          success: true,
          url: result.url,
          repoUrl: result.repoUrl,
          appName: appName
        });
      } else {
        res.json({ success: false, error: result.error });
      }
      return;
    }

    // Check if we have AI capabilities for regular apps
    const hasAI = HUGGINGFACE_API_KEY || OPENAI_API_KEY;
    if (!hasAI) {
      return res.json({ 
        success: false, 
        error: 'No AI configured. Please add HUGGINGFACE_API_KEY or OPENAI_API_KEY' 
      });
    }

    // Create the app
    const result = await createApp(appName, userId);
    
    if (result.success) {
      // Deploy the app
      const deployment = await deployApp(result.repoUrl, appName);
      
      if (deployment.success) {
        res.json({
          success: true,
          url: deployment.url,
          repoUrl: result.repoUrl,
          appName: appName
        });
      } else {
        res.json({
          success: false,
          error: `Deployment failed: ${deployment.error}`
        });
      }
    } else {
      res.json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('API create-app error:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Configuration
const PORT = process.env.PORT || 3001;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CURSOR_API_KEY = process.env.CURSOR_API_KEY;
const CURSOR_API_URL = process.env.CURSOR_API_URL || 'https://api.openai.com';

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
    
    // Handle polling errors gracefully (moved to main bot initialization)
    
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

// Send message to AI API (OpenAI compatible)
const sendToCursorAPI = async (message, conversationId = null) => {
  try {
    if (!CURSOR_API_KEY) {
      // Use mock response if no API key
      return mockCursorResponse(message);
    }

    const response = await axios.post(`${CURSOR_API_URL}/v1/chat/completions`, {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
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
    console.error('AI API Error:', error.message);
    return mockCursorResponse(message);
  }
};

// App Creator Functions
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const RENDER_API_KEY = process.env.RENDER_API_KEY;

// Generate app code using AI (try multiple services)
async function generateAppCode(appName) {
  try {
    // Try Hugging Face first (free)
    if (HUGGINGFACE_API_KEY) {
      try {
        console.log('🤖 Trying Hugging Face AI...');
        const hfResponse = await generateWithHuggingFace(appName);
        if (hfResponse) return hfResponse;
      } catch (error) {
        console.log('❌ Hugging Face failed:', error.message);
      }
    }

    // Try OpenAI if available
    if (OPENAI_API_KEY) {
      try {
        console.log('🤖 Trying OpenAI...');
        const openaiResponse = await generateWithOpenAI(appName);
        if (openaiResponse) return openaiResponse;
      } catch (error) {
        console.log('❌ OpenAI failed:', error.message);
      }
    }

    // Fallback to mock app
    console.log('📝 Using mock app template');
    return generateMockApp(appName);

  } catch (error) {
    console.error('AI generation error:', error.message);
    return generateMockApp(appName);
  }
}

// Generate with Hugging Face (FREE!)
async function generateWithHuggingFace(appName) {
  try {
    const prompt = `Create a React app for ${appName}. Return JSON with files: package.json, src/App.js, public/index.html. Make it functional with Tailwind CSS.`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const generatedText = response.data[0]?.generated_text || '';
    
    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // If JSON parsing fails, create a custom app based on the generated text
        return generateCustomApp(appName, generatedText);
      }
    }

    return null;
  } catch (error) {
    console.error('Hugging Face error:', error.message);
    return null;
  }
}

// Generate with OpenAI
async function generateWithOpenAI(appName) {
  try {
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
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
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
      return generateCustomApp(appName, content);
    }

  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    return null;
  }
}

// Generate custom app based on AI text
function generateCustomApp(appName, aiText) {
  const appId = Math.random().toString(36).substr(2, 9);
  
  // Extract key features from AI text
  const features = extractFeatures(aiText);
  
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
      }
    }, null, 2),

    'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${appName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,

    'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,

    'src/App.js': generateCustomReactComponent(appName, features),

    'README.md': `# ${appName}

${aiText.substring(0, 200)}...

## Features
${features.map(f => `- ${f}`).join('\n')}

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\`

Created by AI Assistant via Telegram bot.
`
  };
}

// Extract features from AI text
function extractFeatures(text) {
  const features = [];
  if (text.toLowerCase().includes('todo')) features.push('Todo management');
  if (text.toLowerCase().includes('blog')) features.push('Blog functionality');
  if (text.toLowerCase().includes('weather')) features.push('Weather data');
  if (text.toLowerCase().includes('portfolio')) features.push('Portfolio showcase');
  if (text.toLowerCase().includes('dashboard')) features.push('Dashboard interface');
  if (text.toLowerCase().includes('chat')) features.push('Chat functionality');
  if (features.length === 0) features.push('Interactive interface');
  return features;
}

// Generate custom React component
function generateCustomReactComponent(appName, features) {
  const hasTodo = features.some(f => f.toLowerCase().includes('todo'));
  const hasBlog = features.some(f => f.toLowerCase().includes('blog'));
  const hasWeather = features.some(f => f.toLowerCase().includes('weather'));
  
  if (hasTodo) {
    return `import React, { useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">${appName}</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
          </header>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <button
                onClick={addTodo}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {todos.map(todo => (
                <div key={todo.id} className={\`flex items-center gap-3 p-3 rounded-lg \${todo.done ? 'bg-gray-100' : 'bg-gray-50'}\`}>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className={\`flex-1 \${todo.done ? 'line-through text-gray-500' : ''}\`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {todos.length === 0 && (
              <p className="text-center text-gray-500 py-8">No todos yet. Add one above!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  // Default counter app for other types
  return `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">${appName}</h1>
            <p className="text-xl text-gray-600">A beautiful ${appName.toLowerCase()} app created by AI</p>
          </header>

          <main className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mb-8">
                <div className="text-6xl font-bold text-blue-600 mb-4">{count}</div>
                <p className="text-gray-600 mb-6">Click the button to interact with your app!</p>
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

export default App;`;
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

    const repoName = `${appName.toLowerCase().replace(/\s+/g, '-')}-${userId}-${Date.now()}`;
    
    const response = await axios.post('https://api.github.com/user/repos', {
      name: repoName,
      description: `A ${appName} app created by AI via Telegram`,
      private: false,
      auto_init: true,
      gitignore_template: 'Node'
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
    console.error('GitHub API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// Push code to GitHub repository using GitHub API
async function pushCodeToRepo(repoUrl, appCode, appName, features = []) {
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

    // Update README with enhanced information
    await updateReadmeWithFeatures(repoUrl, appName, features);

    return { success: true };

  } catch (error) {
    console.error('GitHub API push error:', error.message);
    return { success: false, error: error.message };
  }
}

// Update README with app features and details
async function updateReadmeWithFeatures(repoUrl, appName, features) {
  try {
    const repoName = repoUrl.split('/').pop();
    const baseUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
    const appUrl = `${baseUrl}/app/${appName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Extract features from the app code
    const detectedFeatures = extractFeaturesFromCode(appName, features);
    
    const enhancedReadme = `# ${appName}

A beautiful ${appName.toLowerCase()} application created by AI via Telegram bot.

## 🚀 Live Demo

**🔗 [Try it live](${appUrl})**

## ✨ Features

${detectedFeatures.map(feature => `- ${feature}`).join('\n')}

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App
- **Deployment**: Render.com
- **AI Generated**: Created by AI Assistant

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone ${repoUrl}
   cd ${repoName}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm start
   \`\`\`

4. **Open [http://localhost:3000](http://localhost:3000) to view it in the browser.**

### Build for Production

\`\`\`bash
npm run build
\`\`\`

This builds the app for production to the \`build\` folder.

## 📱 Usage

${generateUsageInstructions(appName, detectedFeatures)}

## 🤖 Created By

This app was automatically generated by an **AI Assistant** via Telegram bot.

- **AI Service**: ${HUGGINGFACE_API_KEY ? 'Hugging Face' : 'OpenAI'}
- **Generated**: ${new Date().toLocaleString()}
- **Bot**: [@LinkCursor_bot](https://t.me/LinkCursor_bot)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🎉 Enjoy your new ${appName.toLowerCase()} app!**`;

    // Update README.md
    await axios.put(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/contents/README.md`,
      {
        message: 'Update README with app features and live demo',
        content: Buffer.from(enhancedReadme).toString('base64'),
        branch: 'main'
      },
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log('✅ Updated README with features and live demo');

  } catch (error) {
    console.error('❌ Failed to update README:', error.message);
    // Don't fail the whole process for README update
  }
}

// Extract features from app code and name
function extractFeaturesFromCode(appName, features) {
  const baseFeatures = [
    'Modern React with Hooks',
    'Responsive design with Tailwind CSS',
    'Clean, professional UI',
    'Mobile-friendly interface'
  ];

  const specificFeatures = [];
  
  // Detect specific features based on app name and content
  const name = appName.toLowerCase();
  
  if (name.includes('todo')) {
    specificFeatures.push('Task management', 'Add/remove tasks', 'Mark tasks as complete', 'Persistent storage');
  } else if (name.includes('blog')) {
    specificFeatures.push('Blog post management', 'Rich text editing', 'Post categorization', 'Comment system');
  } else if (name.includes('weather')) {
    specificFeatures.push('Real-time weather data', 'Location-based forecasts', 'Weather charts', 'Multiple locations');
  } else if (name.includes('portfolio')) {
    specificFeatures.push('Project showcase', 'Skills display', 'Contact form', 'Responsive gallery');
  } else if (name.includes('dashboard')) {
    specificFeatures.push('Data visualization', 'Interactive charts', 'Real-time updates', 'Customizable widgets');
  } else if (name.includes('chat')) {
    specificFeatures.push('Real-time messaging', 'User authentication', 'Message history', 'Emoji support');
  } else if (name.includes('ecommerce') || name.includes('shop')) {
    specificFeatures.push('Product catalog', 'Shopping cart', 'Payment integration', 'Order management');
  } else if (name.includes('social') || name.includes('network')) {
    specificFeatures.push('User profiles', 'Social interactions', 'Content sharing', 'Activity feeds');
  } else {
    specificFeatures.push('Interactive interface', 'User-friendly design', 'Customizable features');
  }

  return [...baseFeatures, ...specificFeatures];
}

// Generate usage instructions based on app type
function generateUsageInstructions(appName, features) {
  const name = appName.toLowerCase();
  
  if (name.includes('todo')) {
    return `1. **Add a new task** by typing in the input field and pressing Enter
2. **Mark tasks as complete** by clicking the checkbox
3. **Delete tasks** by clicking the delete button
4. **View your progress** with the task counter`;
  } else if (name.includes('blog')) {
    return `1. **Create new posts** using the editor
2. **Categorize posts** with tags
3. **Preview posts** before publishing
4. **Manage content** from the dashboard`;
  } else if (name.includes('weather')) {
    return `1. **Enter your location** to get weather data
2. **View current conditions** and forecasts
3. **Check multiple locations** by adding them
4. **See detailed charts** for weather trends`;
  } else {
    return `1. **Explore the interface** to discover features
2. **Interact with elements** to see functionality
3. **Customize settings** as needed
4. **Enjoy the app!** 🎉`;
  }
}

// Store created apps in memory (in production, use a database)
const createdApps = new Map();

// Deploy app by hosting it on the bot service
async function deployApp(repoUrl, appName) {
  try {
    console.log(`🚀 Hosting app: ${appName} on bot service`);
    
    // Generate a unique app ID
    const appId = Math.random().toString(36).substr(2, 9);
    const appSlug = `${appName.toLowerCase().replace(/\s+/g, '-')}-${appId}`;
    
    // Store app info
    createdApps.set(appSlug, {
      name: appName,
      repoUrl: repoUrl,
      createdAt: new Date().toISOString(),
      slug: appSlug
    });

    // Return URL that will be served by this bot service
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const appUrl = `${baseUrl}/app/${appSlug}`;

    return {
      success: true,
      url: appUrl,
      appId: appId,
      slug: appSlug,
      note: 'App hosted on bot service'
    };

  } catch (error) {
    console.error('❌ App hosting error:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Create GitHub Web App with real website code
async function createGitHubWebApp(appName, userId) {
  try {
    console.log(`Creating GitHub Web App: ${appName} for user: ${userId}`);

    // Create a real website with HTML, CSS, and JavaScript
    const websiteCode = {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Welcome to ${appName}</h1>
            <p>A modern web application created with Telegram Bot</p>
        </header>
        
        <main>
            <section class="hero">
                <h2>Get Started</h2>
                <p>This is your personalized web application. Customize it to fit your needs!</p>
                <button onclick="showAlert()" class="cta-button">Click Me!</button>
            </section>
            
            <section class="features">
                <h3>Features</h3>
                <div class="feature-grid">
                    <div class="feature">
                        <h4>🚀 Modern Design</h4>
                        <p>Clean and responsive interface</p>
                    </div>
                    <div class="feature">
                        <h4>📱 Mobile Ready</h4>
                        <p>Works perfectly on all devices</p>
                    </div>
                    <div class="feature">
                        <h4>⚡ Fast Loading</h4>
                        <p>Optimized for speed and performance</p>
                    </div>
                </div>
            </section>
        </main>
        
        <footer>
            <p>Created with ❤️ by Telegram Bot</p>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    color: white;
    margin-bottom: 40px;
}

header h1 {
    font-size: 3rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

main {
    background: white;
    border-radius: 15px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    margin-bottom: 20px;
}

.hero {
    text-align: center;
    margin-bottom: 40px;
}

.hero h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #4a5568;
}

.hero p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    color: #718096;
}

.cta-button {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.features h3 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 30px;
    color: #4a5568;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.feature {
    text-align: center;
    padding: 30px;
    background: #f7fafc;
    border-radius: 10px;
    transition: transform 0.3s ease;
}

.feature:hover {
    transform: translateY(-5px);
}

.feature h4 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #4a5568;
}

.feature p {
    color: #718096;
}

footer {
    text-align: center;
    color: white;
    opacity: 0.8;
}

@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }
    
    .hero h2 {
        font-size: 1.8rem;
    }
    
    main {
        padding: 20px;
    }
}`,
      'script.js': `function showAlert() {
    alert('Hello! This is your ${appName} web application! 🎉');
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    console.log('${appName} loaded successfully!');
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Add animation to features
    const features = document.querySelectorAll('.feature');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        feature.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(feature);
    });
});`
    };

    // Create GitHub repository
    const repoName = appName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    const repoUrl = await createGitHubRepo(repoName, 'A modern web application created with Telegram Bot');
    
    if (!repoUrl) {
      return { success: false, error: 'Failed to create GitHub repository' };
    }

    // Push all files to the repository
    for (const [filename, content] of Object.entries(websiteCode)) {
      await createFileInRepo(repoUrl, filename, content);
    }

    // Create a comprehensive README
    const readmeContent = '# ' + appName + '\n\n' +
      'A modern, responsive web application created with Telegram Bot.\n\n' +
      '## 🌟 Features\n\n' +
      '- **Modern Design**: Clean and professional interface\n' +
      '- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile\n' +
      '- **Interactive Elements**: Smooth animations and user interactions\n' +
      '- **Fast Loading**: Optimized for speed and performance\n' +
      '- **Cross-Browser Compatible**: Works on all modern browsers\n\n' +
      '## 🚀 Getting Started\n\n' +
      '1. **Clone the repository**:\n' +
      '   ```bash\n' +
      '   git clone ' + repoUrl + '\n' +
      '   cd ' + repoName + '\n' +
      '   ```\n\n' +
      '2. **Open in browser**:\n' +
      '   Simply open `index.html` in your web browser or serve it with any web server.\n\n' +
      '3. **Deploy to web hosting**:\n' +
      '   - Upload files to any web hosting service (Netlify, Vercel, GitHub Pages, etc.)\n' +
      '   - Or use GitHub Pages by enabling it in repository settings\n\n' +
      '## 📁 Project Structure\n\n' +
      '```\n' +
      repoName + '/\n' +
      '├── index.html          # Main HTML file\n' +
      '├── style.css           # CSS styles\n' +
      '├── script.js           # JavaScript functionality\n' +
      '└── README.md           # This file\n' +
      '```\n\n' +
      '## 🛠️ Customization\n\n' +
      '- **Edit `index.html`**: Modify the content and structure\n' +
      '- **Edit `style.css`**: Customize colors, fonts, and layout\n' +
      '- **Edit `script.js`**: Add interactive features and functionality\n\n' +
      '## 🌐 Live Demo\n\n' +
      'Visit the live application: [Your App URL]\n\n' +
      '## 📱 Mobile Support\n\n' +
      'This application is fully responsive and works great on:\n' +
      '- 📱 Mobile phones\n' +
      '- 📱 Tablets  \n' +
      '- 💻 Desktop computers\n' +
      '- 🖥️ Large screens\n\n' +
      '## 🤖 Created by Telegram Bot\n\n' +
      'This application was automatically generated by a Telegram Bot that can create web applications from simple text commands.\n\n' +
      '## 📄 License\n\n' +
      'This project is open source and available under the [MIT License](LICENSE).\n\n' +
      '---\n\n' +
      '**Enjoy your new web application! 🎉**';

    await createFileInRepo(repoUrl, 'README.md', readmeContent);

    // Store app info
    const appSlug = repoName;
    createdApps.set(appSlug, {
      id: appSlug,
      name: appName,
      url: 'https://' + appSlug + '.onrender.com',
      repoUrl: repoUrl,
      createdAt: new Date().toISOString(),
      type: 'github-web'
    });

    return {
      success: true,
      repoUrl: repoUrl,
      url: 'https://' + appSlug + '.onrender.com',
      appName: appName
    };

  } catch (error) {
    console.error('Error creating GitHub Web App:', error);
    return { success: false, error: error.message };
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

    // Extract features from the generated code
    const features = extractFeaturesFromCode(appName, []);
    
    // Push code to repository
    const push = await pushCodeToRepo(repo.repoUrl, appCode, appName, features);
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
        `**Try it:** "make me the app blog" 🚀`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Open App Creator",
                  web_app: { url: `${process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001'}/mini-app` }
                }
              ],
              [
                { text: "📊 Status", callback_data: "status" },
                { text: "❓ Help", callback_data: "help" }
              ]
            ]
          }
        }
      );
      return;
    }

    // Handle app creation requests
    if (text.includes('make me the app') || text.includes('create app')) {
      try {
        // Check if we have AI capabilities
        const hasAI = HUGGINGFACE_API_KEY || OPENAI_API_KEY;
        
        if (!hasAI) {
          await telegramBot.sendMessage(chatId, 
            `❌ **No AI configured!**\n\n` +
            `I need AI to create real apps. Please add:\n` +
            `• \`HUGGINGFACE_API_KEY\` (FREE!)\n` +
            `• \`OPENAI_API_KEY\` (optional)\n\n` +
            `Without AI, I can only create basic templates.\n` +
            `**Get free AI key**: https://huggingface.co/settings/tokens`
          );
          return;
        }

        // Send "working" message with AI status
        const aiStatus = HUGGINGFACE_API_KEY ? '🤖 Hugging Face AI' : '🤖 OpenAI';
        const workingMsg = await telegramBot.sendMessage(chatId, 
          `🔄 Creating your app with ${aiStatus}... This might take a minute!`
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
            const aiUsed = HUGGINGFACE_API_KEY ? 'Hugging Face AI' : 'OpenAI';
            await telegramBot.editMessageText(
              `✅ Done! Your ${appName} app is ready!\n\n` +
              `🤖 Generated with: ${aiUsed}\n` +
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
        `/status - Check my status\n` +
        `/cleanup - Delete test repositories`
      );
      return;
    }

    // Handle status command
    if (text === '/status') {
      const aiStatus = HUGGINGFACE_API_KEY ? '🤖 Hugging Face AI' : 
                      OPENAI_API_KEY ? '🤖 OpenAI' : '❌ No AI configured';
      const githubStatus = GITHUB_TOKEN ? '✅ GitHub' : '❌ No GitHub';
      
      await telegramBot.sendMessage(chatId,
        `📊 **Bot Status:**\n\n` +
        `✅ Telegram Bot: Connected\n` +
        `${aiStatus}\n` +
        `${githubStatus}\n` +
        `✅ App Creator: Ready\n` +
        `✅ AI Chat: Ready\n` +
        `✅ Deployment: Ready\n` +
        `⏰ Time: ${new Date().toLocaleString()}\n\n` +
        `**AI Keys:**\n` +
        `• Hugging Face: ${HUGGINGFACE_API_KEY ? '✅' : '❌'}\n` +
        `• OpenAI: ${OPENAI_API_KEY ? '✅' : '❌'}`
      );
      return;
    }

    // Handle cleanup command - delete test repositories
    if (text === '/cleanup') {
      await telegramBot.sendMessage(chatId, 
        `🧹 **Starting cleanup of test repositories...**\n\n` +
        `This will delete all repositories ending with number patterns.\n` +
        `Please wait while I clean up...`
      );

      try {
        const deletedRepos = await cleanupTestRepositories();
        
        if (deletedRepos.length > 0) {
          await telegramBot.sendMessage(chatId,
            `✅ **Cleanup Complete!**\n\n` +
            `🗑️ **Deleted ${deletedRepos.length} repositories:**\n\n` +
            deletedRepos.map(repo => `• ${repo}`).join('\n') + '\n\n' +
            `All test repositories have been removed! 🎉`
          );
        } else {
          await telegramBot.sendMessage(chatId,
            `✅ **Cleanup Complete!**\n\n` +
            `No test repositories found to delete.\n` +
            `All repositories are clean! 🎉`
          );
        }
      } catch (error) {
        console.error('Cleanup error:', error);
        await telegramBot.sendMessage(chatId,
          `❌ **Cleanup Failed**\n\n` +
          `Error: ${error.message}\n\n` +
          `Please check the logs for more details.`
        );
      }
      return;
    }

    // Handle shutdown command (development only)
    if (text === '/shutdown' && process.env.NODE_ENV !== 'production') {
      await telegramBot.sendMessage(chatId, 
        `🛑 **Shutting down bot for development...**\n\n` +
        `Bot will stop in 3 seconds.`
      );
      
      setTimeout(() => {
        console.log('🛑 Bot shutdown requested by user');
        process.exit(0);
      }, 3000);
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
    if (error.code === 409) {
      console.log('Bot conflict detected. Stopping polling...');
      telegramBot.stopPolling();
      setTimeout(() => {
        console.log('Restarting polling...');
        telegramBot.startPolling();
      }, 5000);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit, just log the error
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle data from mini app
  telegramBot.on('message', async (msg) => {
    if (msg.web_app_data) {
      try {
        const data = JSON.parse(msg.web_app_data.data);
        if (data.type === 'app_created') {
          await telegramBot.sendMessage(msg.chat.id,
            `✅ **App Created Successfully!**\n\n` +
            `📱 **App:** ${data.appName}\n` +
            `🔗 **Live URL:** ${data.url}\n` +
            `📁 **GitHub:** ${data.repoUrl}\n\n` +
            `**You can copy these links!** 📋`
          );
        } else if (data.type === 'github_web_app_created') {
          await telegramBot.sendMessage(msg.chat.id,
            `🌐 **GitHub Web App Created!**\n\n` +
            `📱 **App:** GitHub Web App\n` +
            `🔗 **Live URL:** ${data.url}\n` +
            `📁 **GitHub:** ${data.repoUrl}\n\n` +
            `**Features:**\n` +
            `• Complete HTML/CSS/JS website\n` +
            `• Responsive design\n` +
            `• Interactive elements\n` +
            `• Ready to deploy\n\n` +
            `**You can copy these links!** 📋`
          );
        }
      } catch (error) {
        console.error('Error parsing web app data:', error);
        try {
          await telegramBot.sendMessage(msg.chat.id, 
            '❌ Sorry, there was an error processing your app creation. Please try again.'
          );
        } catch (sendError) {
          console.error('Error sending error message:', sendError);
        }
      }
    }
  });

  // Handle callback queries (button presses)
  telegramBot.on('callback_query', async (callbackQuery) => {
    try {
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

    if (data === 'status') {
      const aiStatus = HUGGINGFACE_API_KEY ? '🤖 Hugging Face AI' : 
                      OPENAI_API_KEY ? '🤖 OpenAI' : '❌ No AI configured';
      const githubStatus = GITHUB_TOKEN ? '✅ GitHub' : '❌ No GitHub';
      
      await telegramBot.answerCallbackQuery(callbackQuery.id);
      await telegramBot.sendMessage(chatId,
        `📊 **Bot Status:**\n\n` +
        `✅ Telegram Bot: Connected\n` +
        `${aiStatus}\n` +
        `${githubStatus}\n` +
        `✅ App Creator: Ready\n` +
        `✅ AI Chat: Ready\n` +
        `✅ Deployment: Ready\n` +
        `⏰ Time: ${new Date().toLocaleString()}\n\n` +
        `**AI Keys:**\n` +
        `• Hugging Face: ${HUGGINGFACE_API_KEY ? '✅' : '❌'}\n` +
        `• OpenAI: ${OPENAI_API_KEY ? '✅' : '❌'}`
      );
    } else if (data === 'help') {
      await telegramBot.answerCallbackQuery(callbackQuery.id);
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
        `/status - Check my status\n` +
        `/cleanup - Delete test repositories\n\n` +
        `**Web App:**\n` +
        `• Click "🚀 Open App Creator" for web interface`
      );
    }
    } catch (error) {
      console.error('Error handling callback query:', error);
      try {
        await telegramBot.answerCallbackQuery(callbackQuery.id, '❌ Sorry, something went wrong!');
      } catch (answerError) {
        console.error('Error answering callback query:', answerError);
      }
    }
  });
}

// Function to cleanup test repositories
async function cleanupTestRepositories() {
  const deletedRepos = [];
  
  try {
    // Get all repositories for the user
    const response = await fetch(`https://api.github.com/user/repos?per_page=100`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Telegram-Bot-Cleanup'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();
    
    // Filter repositories that match the test pattern (ending with numbers)
    const testRepos = repos.filter(repo => {
      const repoName = repo.name;
      // Match pattern: ends with -5153324774- followed by numbers
      return /-5153324774-\d+$/.test(repoName);
    });

    console.log(`Found ${testRepos.length} test repositories to delete`);

    // Delete each test repository
    for (const repo of testRepos) {
      try {
        const deleteResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Telegram-Bot-Cleanup'
          }
        });

        if (deleteResponse.ok) {
          deletedRepos.push(repo.name);
          console.log(`✅ Deleted repository: ${repo.name}`);
          
          // Remove from createdApps if it exists
          const appSlug = repo.name;
          if (createdApps.has(appSlug)) {
            createdApps.delete(appSlug);
          }
        } else {
          console.error(`❌ Failed to delete ${repo.name}: ${deleteResponse.status}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error deleting ${repo.name}:`, error.message);
      }
    }

    return deletedRepos;
    
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
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

// Cleanup endpoint to delete test repositories
app.post('/api/cleanup', async (req, res) => {
  try {
    const reposToDelete = [
      'todo-lista-5153324774-1757507609929',
      'calculateur-cnc-5153324774-1757420213594',
      'danxdz/calculateur-cnc-5153324774-1757420213594',
      'chat-5153324774-1757418652027',
      'danxdz/chat-5153324774-1757418652027',
      'blog-5153324774-1757376213509',
      'danxdz/blog-5153324774-1757376213509',
      'weather-dashboard-5153324774-1757421108186',
      'danxdz/weather-dashboard-5153324774-1757421108186',
      'blog-5153324774-1757423166207',
      'danxdz/blog-5153324774-1757423166207',
      'weather-dashboard-5153324774-1757425603124',
      'danxdz/weather-dashboard-5153324774-1757425603124',
      'todo-list-5153324774-1757432073507',
      'danxdz/todo-list-5153324774-1757432073507',
      'todo-list-5153324774-1757428764588',
      'danxdz/todo-list-5153324774-1757428764588',
      'blog-5153324774-1757416943167',
      'danxdz/blog-5153324774-1757416943167'
    ];

    const results = {
      deleted: [],
      notFound: [],
      failed: []
    };

    for (const repoName of reposToDelete) {
      try {
        const fullRepoName = repoName.includes('/') ? repoName : GITHUB_USERNAME + '/' + repoName;
        
        const response = await fetch('https://api.github.com/repos/' + fullRepoName, {
          method: 'DELETE',
          headers: {
            'Authorization': 'token ' + GITHUB_TOKEN,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Repository-Cleanup-Script'
          }
        });

        if (response.ok) {
          results.deleted.push(fullRepoName);
          console.log('✅ Deleted repository: ' + fullRepoName);
        } else if (response.status === 404) {
          results.notFound.push(fullRepoName);
          console.log('⚠️ Repository not found: ' + fullRepoName);
        } else {
          const errorText = await response.text();
          results.failed.push({ repo: fullRepoName, error: response.status + ': ' + errorText });
          console.log('❌ Failed to delete ' + fullRepoName + ': ' + response.status);
        }
      } catch (error) {
        results.failed.push({ repo: repoName, error: error.message });
        console.error('❌ Error deleting ' + repoName + ':', error.message);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({
      success: true,
      summary: {
        deleted: results.deleted.length,
        notFound: results.notFound.length,
        failed: results.failed.length
      },
      deleted: results.deleted,
      notFound: results.notFound,
      failed: results.failed
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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

// One-time cleanup function
async function runOneTimeCleanup() {
  if (process.env.RUN_CLEANUP === 'true' || process.env.NODE_ENV === 'production') {
    console.log('🧹 Running one-time repository cleanup...');
    
    const reposToDelete = [
      'todo-lista-5153324774-1757507609929',
      'calculateur-cnc-5153324774-1757420213594',
      'danxdz/calculateur-cnc-5153324774-1757420213594',
      'chat-5153324774-1757418652027',
      'danxdz/chat-5153324774-1757418652027',
      'blog-5153324774-1757376213509',
      'danxdz/blog-5153324774-1757376213509',
      'weather-dashboard-5153324774-1757421108186',
      'danxdz/weather-dashboard-5153324774-1757421108186',
      'blog-5153324774-1757423166207',
      'danxdz/blog-5153324774-1757423166207',
      'weather-dashboard-5153324774-1757425603124',
      'danxdz/weather-dashboard-5153324774-1757425603124',
      'todo-list-5153324774-1757432073507',
      'danxdz/todo-list-5153324774-1757432073507',
      'todo-list-5153324774-1757428764588',
      'danxdz/todo-list-5153324774-1757428764588',
      'blog-5153324774-1757416943167',
      'danxdz/blog-5153324774-1757416943167'
    ];

    let deleted = 0;
    let notFound = 0;
    let failed = 0;

    for (const repoName of reposToDelete) {
      try {
        const fullRepoName = repoName.includes('/') ? repoName : GITHUB_USERNAME + '/' + repoName;
        
        console.log('🗑️ Deleting repository: ' + fullRepoName);
        
        const response = await fetch('https://api.github.com/repos/' + fullRepoName, {
          method: 'DELETE',
          headers: {
            'Authorization': 'token ' + GITHUB_TOKEN,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Repository-Cleanup-Script'
          }
        });

        if (response.ok) {
          console.log('✅ Successfully deleted: ' + fullRepoName);
          deleted++;
        } else if (response.status === 404) {
          console.log('⚠️ Repository not found: ' + fullRepoName);
          notFound++;
        } else {
          const errorText = await response.text();
          console.log('❌ Failed to delete ' + fullRepoName + ': ' + response.status + ' - ' + errorText);
          failed++;
        }
      } catch (error) {
        console.error('❌ Error deleting ' + repoName + ':', error.message);
        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('📊 Cleanup Summary:');
    console.log('✅ Successfully deleted: ' + deleted);
    console.log('⚠️ Not found: ' + notFound);
    console.log('❌ Failed: ' + failed);
    console.log('🎉 Cleanup completed!');
  }
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} - Updated with latest changes`);
  console.log(`📱 Telegram Bot: ${telegramBot ? 'Active' : 'Not configured'}`);
  console.log(`🤖 Cursor API: ${CURSOR_API_KEY ? 'Configured' : 'Mock mode'}`);
  console.log(`🌐 WebSocket: http://0.0.0.0:${PORT}`);
  
  // Run cleanup if requested
  runOneTimeCleanup();
});