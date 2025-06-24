import { Meteor } from 'meteor/meteor';
import { Buffer } from 'buffer';
import B2 from 'backblaze-b2';
import { check } from 'meteor/check';

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

Meteor.methods({
  async 'images.uploadToB2'(fileName, fileType, fileData) {
    console.log('[Backblaze] Upload method called:', fileName, fileType);
    check(fileName, String);
    check(fileType, String);
    check(fileData, Object);
    try {
      if (!Meteor.settings.private || !Meteor.settings.private.backblaze) {
        throw new Meteor.Error('Backblaze credentials not configured');
      }
      const b2 = new B2({
        applicationKeyId: Meteor.settings.private.backblaze.keyId,
        applicationKey: Meteor.settings.private.backblaze.applicationKey,
      });
      await b2.authorize();
      const bucketName = Meteor.settings.private.backblaze.bucketName;
      const bucketId = (await b2.listBuckets()).data.buckets.find(b => b.bucketName === bucketName)?.bucketId;
      if (!bucketId) throw new Meteor.Error('Bucket not found');
      const base64 = fileData.base64;
      if (typeof base64 !== 'string') {
        throw new Meteor.Error('invalid-file', 'File data is not a valid base64 string');
      }
      const buffer = Buffer.from(base64.split(',')[1], 'base64');
      const uploadUrlResp = await b2.getUploadUrl({ bucketId });
      const uploadResp = await b2.uploadFile({
        uploadUrl: uploadUrlResp.data.uploadUrl,
        uploadAuthToken: uploadUrlResp.data.authorizationToken,
        fileName,
        data: buffer,
        contentType: fileType,
      });
      if (!uploadResp || !uploadResp.data || !uploadResp.data.fileId) {
        console.error('[Backblaze] Upload failed, no fileId:', uploadResp);
        throw new Meteor.Error('upload-failed', 'Backblaze did not return a fileId');
      }
      const fileUrl = `https://f000.backblazeb2.com/file/${bucketName}/${fileName}`;
      console.log('[Backblaze] Upload successful:', fileUrl);
      return { url: fileUrl };
    } catch (err) {
      console.error('[Backblaze] Upload error:', err);
      throw new Meteor.Error('backblaze-upload-failed', err.message || err.reason || 'Unknown error');
    }
  },
});
