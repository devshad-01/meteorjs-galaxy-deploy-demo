import { Meteor } from 'meteor/meteor';

// Import the images API - Galaxy will have already set MONGO_URL from settings
import '../imports/api/images';

Meteor.startup(() => {
  console.log('🚀 Server starting up...');
  
  // Display settings.json details
  console.log('📋 SETTINGS DETAILS:');
  console.log('='.repeat(50));
  
  if (Meteor.settings) {
    console.log('✅ Settings loaded successfully');
    
    // Public settings (safe to show)
    if (Meteor.settings.public && Object.keys(Meteor.settings.public).length > 0) {
      console.log('📱 Public Settings:');
      console.log(JSON.stringify(Meteor.settings.public, null, 2));
    } else {
      console.log('📱 Public Settings: None configured');
    }
    
    // Private settings (show safely)
    if (Meteor.settings.private) {
      console.log('🔒 Private Settings:');
      console.log('   - Server Port:', Meteor.settings.private.serverPort || 'Not set');
      console.log('   - MongoDB URL:', Meteor.settings.private.mongoUrl ? 
        `${Meteor.settings.private.mongoUrl.substring(0, 20)}...` : 'Not set');
      console.log('   - API Key:', Meteor.settings.private.apiKey || 'Not set');
      console.log('   - Secret:', Meteor.settings.private.secret || 'Not set');
      console.log('   - Debug Mode:', Meteor.settings.private.debugMode);
      
      if (Meteor.settings.private.backblaze) {
        console.log('   - Backblaze:');
        console.log('     * Key ID:', Meteor.settings.private.backblaze.keyId || 'Not set');
        console.log('     * Key Name:', Meteor.settings.private.backblaze.keyName || 'Not set');
        console.log('     * Application Key:', Meteor.settings.private.backblaze.applicationKey ? 
          `${Meteor.settings.private.backblaze.applicationKey.substring(0, 10)}...` : 'Not set');
        console.log('     * Bucket Name:', Meteor.settings.private.backblaze.bucketName || 'Not set');
      } else {
        console.log('   - Backblaze: Not configured');
      }
    } else {
      console.log('🔒 Private Settings: None configured');
    }
  } else {
    console.log('❌ No settings loaded');
  }
  
  // Environment variables
  console.log('🌍 Environment Variables:');
  console.log('   - ROOT_URL:', process.env.ROOT_URL || 'Not set');
  console.log('   - PORT:', process.env.PORT || 'Not set');
  console.log('   - MONGO_URL:', process.env.MONGO_URL ? 
    `${process.env.MONGO_URL.substring(0, 20)}...` : 'Not set');
  
  console.log('='.repeat(50));
  console.log('✅ Settings analysis complete!');
  console.log('📸 Image CRUD system ready!');
});
