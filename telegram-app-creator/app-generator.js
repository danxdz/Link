const axios = require('axios');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

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
    
    // Try to parse JSON response
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, generate mock app
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

// Push code to GitHub repository
async function pushCodeToRepo(repoUrl, appCode) {
  try {
    const tempDir = path.join(__dirname, 'temp', Date.now().toString());
    await fs.ensureDir(tempDir);

    // Write all files
    for (const [filePath, content] of Object.entries(appCode)) {
      const fullPath = path.join(tempDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
    }

    // Initialize git and push
    const git = simpleGit(tempDir);
    await git.init();
    await git.add('.');
    await git.commit('Initial commit - Created by AI');
    
    // Extract clone URL from repo URL
    const cloneUrl = repoUrl.replace('github.com/', `github.com:${GITHUB_USERNAME}/`).replace('https://', `https://${GITHUB_TOKEN}@`);
    
    await git.addRemote('origin', cloneUrl);
    await git.push('origin', 'main');

    // Cleanup
    await fs.remove(tempDir);

    return { success: true };

  } catch (error) {
    console.error('Git push error:', error.message);
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

module.exports = { createApp };