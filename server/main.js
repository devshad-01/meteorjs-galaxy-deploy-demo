import { Meteor } from 'meteor/meteor';
import '../imports/api/images';

// Set MONGO_URL from settings if not already set
if (!process.env.MONGO_URL && Meteor.settings.private?.mongoUrl) {
  process.env.MONGO_URL = Meteor.settings.private.mongoUrl;
  console.log('🗄️  Setting MONGO_URL from settings.json');
}

Meteor.startup(() => {
  console.log('🚀 Server starting up...');
  
  // Test settings.json loading
  console.log('Settings loaded:', !!Meteor.settings);
  console.log('Public settings:', Meteor.settings.public || 'None');
  console.log('Private settings available:', !!Meteor.settings.private);
  
  if (Meteor.settings.private) {
    console.log('MongoDB URL configured:', !!Meteor.settings.private.mongoUrl);
    console.log('MONGO_URL set:', !!process.env.MONGO_URL);
  }
  
  console.log('✅ Settings test complete!');
  console.log('📸 Image CRUD system ready!');
});
