// Cloudinary image upload handler for forum posts
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import cloudinary from 'cloudinary';

// Configure Cloudinary (replace with your credentials)
cloudinary.v2.config({
  cloud_name: Meteor.settings.cloudinary.cloud_name,
  api_key: Meteor.settings.cloudinary.api_key,
  api_secret: Meteor.settings.cloudinary.api_secret,
});

// Middleware to parse JSON bodies with default size limit (100kb)
WebApp.connectHandlers.use('/api/cloudinary/upload', bodyParser.json());

WebApp.connectHandlers.use('/api/cloudinary/upload', (err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    res.writeHead(413, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Image is too large. Please upload a smaller file (max 100kb).' }));
  } else {
    next();
  }
});

WebApp.connectHandlers.use('/api/cloudinary/upload', (req, res, next) => {
  if (req.method === 'POST') {
    const { imageBase64, folder } = req.body;
    if (!imageBase64) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'No image data provided' }));
      return;
    }
    const uploadFolder = folder || 'forum_posts';
    cloudinary.v2.uploader.upload(imageBase64, { folder: uploadFolder })
      .then(result => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: result.secure_url }));
      })
      .catch(error => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      });
  } else {
    next();
  }
});
