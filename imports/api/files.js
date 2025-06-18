import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// Create a collection for our files
export const Files = new Mongo.Collection('files');

if (Meteor.isServer) {
  // Publish files to the client
  Meteor.publish('files', function () {
    return Files.find({}, { 
      sort: { createdAt: -1 } 
    });
  });
}

// Define methods for CRUD operations
Meteor.methods({
  'files.insert'(fileData) {
    check(fileData, {
      name: String,
      size: Number,
      type: String,
      backblazeUrl: String,
      backblazeFileId: String
    });

    return Files.insert({
      ...fileData,
      createdAt: new Date(),
      userId: this.userId
    });
  },

  'files.remove'(fileId) {
    check(fileId, String);
    
    const file = Files.findOne(fileId);
    if (!file) {
      throw new Meteor.Error('file-not-found', 'File not found');
    }

    // Remove from database
    Files.remove(fileId);
    
    return true;
  },

  'files.update'(fileId, name) {
    check(fileId, String);
    check(name, String);

    const file = Files.findOne(fileId);
    if (!file) {
      throw new Meteor.Error('file-not-found', 'File not found');
    }

    Files.update(fileId, {
      $set: {
        name: name,
        updatedAt: new Date()
      }
    });

    return true;
  }
});
