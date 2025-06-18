import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import multer from 'multer';
import { backblazeService } from '/imports/api/backblaze';
import { Files } from '/imports/api/files';
import '/imports/api/files';

// Set MONGO_URL from settings if not already set
if (!process.env.MONGO_URL && Meteor.settings.private?.mongoUrl) {
  process.env.MONGO_URL = Meteor.settings.private.mongoUrl;
  console.log('🗄️  Setting MONGO_URL from settings.json');
}

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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
  console.log('☁️  Backblaze:', privateSettings.backblaze ? 'Configured ✓' : 'Not configured ✗');
  
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
      debugMode: privateSettings.debugMode,
      backblazeConfigured: !!privateSettings.backblaze
    }));
  });

  // File upload endpoint
  WebApp.connectHandlers.use('/api/upload', upload.single('file'), async (req, res) => {
    try {
      console.log('📤 Upload request received');
      
      if (!req.file) {
        console.log('❌ No file in request');
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: 'No file uploaded' }));
        return;
      }

      console.log('📤 Uploading file:', req.file.originalname);

      // Check if Backblaze is configured
      const settings = global.processedSettings || {};
      if (!settings.private?.backblaze) {
        console.log('⚠️  Backblaze not configured, saving file info only');
        
        // Just save file info to MongoDB without Backblaze upload
        const fileId = await Files.insertAsync({
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: 'anonymous',
          status: 'local-only'
        });

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          success: true,
          fileId: fileId,
          message: 'File info saved (Backblaze not configured)'
        }));
        return;
      }

      // Try to upload to Backblaze
      try {
        const result = await backblazeService.uploadFile(
          req.file.originalname,
          req.file.buffer,
          req.file.mimetype
        );

        // Save to MongoDB with Backblaze info
        const fileId = await Files.insertAsync({
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          backblazeUrl: result.downloadUrl,
          backblazeFileId: result.fileId,
          uploadedAt: new Date(),
          uploadedBy: 'anonymous',
          status: 'uploaded'
        });

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          success: true,
          fileId: fileId,
          downloadUrl: result.downloadUrl
        }));

      } catch (backblazeError) {
        console.error('❌ Backblaze upload failed:', backblazeError.message);
        
        // Save file info anyway, but mark as failed
        const fileId = await Files.insertAsync({
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: 'anonymous',
          status: 'upload-failed',
          error: backblazeError.message
        });

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          success: true,
          fileId: fileId,
          message: 'File info saved but upload to Backblaze failed',
          error: backblazeError.message
        }));
      }

    } catch (error) {
      console.error('❌ Upload error:', error.message);
      console.error(error.stack);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }));
    }
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
        debugMode: settings.private?.debugMode,
        hasBackblaze: !!settings.private?.backblaze
      }
    };
  }
});