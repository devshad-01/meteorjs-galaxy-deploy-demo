import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  console.log('� Testing settings.json...');
  
  // Test settings.json loading
  console.log('Settings loaded:', !!Meteor.settings);
  console.log('Public settings:', Meteor.settings.public || 'None');
  console.log('Private settings available:', !!Meteor.settings.private);
  
  if (Meteor.settings.private) {
    console.log('MongoDB URL configured:', !!Meteor.settings.private.mongoUrl);
  }
  
  console.log('✅ Settings test complete!');
});