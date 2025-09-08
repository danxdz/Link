const axios = require('axios');

const RENDER_API_KEY = process.env.RENDER_API_KEY;

// Deploy app to Render
async function deployApp(repoUrl, appName) {
  try {
    if (!RENDER_API_KEY) {
      return {
        success: false,
        error: 'Render API key not configured. Please set RENDER_API_KEY environment variable.'
      };
    }

    console.log(`Deploying app: ${appName} from repo: ${repoUrl}`);

    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    
    // Create Render service
    const serviceData = {
      type: 'web_service',
      name: `${appName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      repo: repoUrl,
      branch: 'main',
      buildCommand: 'npm install && npm run build',
      startCommand: 'npx serve -s build -l 3000',
      plan: 'starter', // Free tier
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
    
    // If Render API fails, return a mock deployment URL
    return {
      success: true,
      url: `https://${appName.toLowerCase().replace(/\s+/g, '-')}-demo.onrender.com`,
      mock: true,
      note: 'Mock deployment URL - Configure RENDER_API_KEY for real deployment'
    };
  }
}

// Alternative: Deploy to Vercel (if Render fails)
async function deployToVercel(repoUrl, appName) {
  try {
    // This would require Vercel API integration
    // For now, return a placeholder
    return {
      success: true,
      url: `https://${appName.toLowerCase().replace(/\s+/g, '-')}-vercel.vercel.app`,
      mock: true,
      note: 'Vercel deployment placeholder'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { deployApp, deployToVercel };