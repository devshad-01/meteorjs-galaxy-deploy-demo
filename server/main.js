import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

// Function to substitute environment variables in settings
function substituteEnvVars(obj) {
  if (typeof obj === 'string') {
    // If the string is an environment variable name, substitute it
    if (process.env[obj]) {
      // Try to parse as JSON for boolean/number values
      const envValue = process.env[obj];
      try {
        return JSON.parse(envValue);
      } catch {
        return envValue;
      }
    }
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map(substituteEnvVars);
  } else if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = substituteEnvVars(obj[key]);
    }
    return result;
  }
  return obj;
}

Meteor.startup(() => {
  console.log('🚀 Server starting up...');
  
  // Load and process settings with environment variable substitution
  const processedSettings = Meteor.settings ? substituteEnvVars(Meteor.settings) : {};
  
  // Access public settings (available on both client and server)
  const publicSettings = processedSettings.public || {};
  console.log('📱 App Name:', publicSettings.appName || 'Default App');
  console.log('🌍 Environment:', publicSettings.environment || 'development');
  console.log('🔢 Version:', publicSettings.version || '1.0.0');
  
  // Access private settings (server only)
  const privateSettings = processedSettings.private || {};
  console.log('🔒 Server Port:', privateSettings.serverPort || process.env.PORT || 3000);
  console.log('🗄️  MongoDB URL:', privateSettings.mongoUrl ? 'Configured ✓' : 'Not configured ✗');
  console.log('🔑 API Key:', privateSettings.apiKey ? 'Configured ✓' : 'Not configured ✗');
  console.log('🛠️  Debug Mode:', privateSettings.debugMode || false);
  
  // Environment variables examples
  console.log('📍 ROOT_URL:', process.env.ROOT_URL || 'http://localhost:3000');
  console.log('⚡ PORT:', process.env.PORT || '3000');
  
  // Store processed settings globally for access in methods
  global.processedSettings = processedSettings;
  
  // Create a simple API endpoint
  WebApp.connectHandlers.use('/api/info', (req, res, next) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      appName: publicSettings.appName,
      environment: publicSettings.environment,
      version: publicSettings.version,
      timestamp: new Date().toISOString(),
      port: process.env.PORT || privateSettings.serverPort || 3000,
      rootUrl: process.env.ROOT_URL || 'http://localhost:3000',
      hasApiKey: !!privateSettings.apiKey,
      debugMode: privateSettings.debugMode
    }));
  });
  
  console.log('✅ Server ready!');
});

// Meteor method to get configuration info
Meteor.methods({
  'getAppConfig'() {
    const settings = global.processedSettings || {};
    return {
      public: settings.public || {},
      // Only return safe private info (no secrets)
      serverInfo: {
        port: settings.private?.serverPort || process.env.PORT,
        hasApiKey: !!settings.private?.apiKey,
        hasSecret: !!settings.private?.secret,
        debugMode: settings.private?.debugMode
      }
    };
  }
});