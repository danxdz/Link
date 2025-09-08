const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { createApp } = require('./app-generator');
const { deployApp } = require('./deployer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Telegram Bot
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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
    
    console.log('🤖 Telegram bot initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
  }
}

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    telegram_bot: telegramBot ? 'connected' : 'not_configured',
    timestamp: new Date().toISOString()
  });
});

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
        `Just tell me what app you want:\n` +
        `"make me the app todo list"\n` +
        `"make me the app blog"\n` +
        `"make me the app weather dashboard"\n\n` +
        `I'll create it and give you a live link! 🚀`
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
        `1. Tell me what app you want:\n` +
        `   "make me the app todo list"\n` +
        `   "create app blog with dark mode"\n` +
        `   "make me the app weather dashboard"\n\n` +
        `2. I'll create the code and deploy it\n\n` +
        `3. You'll get a live link to test!\n\n` +
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
        `✅ App Generator: Ready\n` +
        `✅ Deployment: Ready\n` +
        `⏰ Time: ${new Date().toLocaleString()}`
      );
      return;
    }

    // Default response for unrecognized messages
    await telegramBot.sendMessage(chatId,
      `🤔 I didn't understand that!\n\n` +
      `Try: "make me the app [app name]"\n` +
      `Or use /help for more info.`
    );
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Telegram Bot: ${telegramBot ? 'Active' : 'Not configured'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  if (telegramBot) {
    telegramBot.stopPolling();
    console.log('Telegram bot polling stopped');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Gracefully shutting down...');
  if (telegramBot) {
    telegramBot.stopPolling();
    console.log('Telegram bot polling stopped');
  }
  process.exit(0);
});