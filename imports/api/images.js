import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Images = new Mongo.Collection('images');

if (Meteor.isServer) {
  // Publish all images
  Meteor.publish('images', function() {
    return Images.find();
  });
}

// Methods for CRUD operations
Meteor.methods({
  async 'images.insert'(name, url, description) {
    return await Images.insertAsync({
      name,
      url,
      description,
      createdAt: new Date(),
      userId: this.userId || 'anonymous'
    });
  },

  async 'images.remove'(imageId) {
    return await Images.removeAsync(imageId);
  },

  async 'images.update'(imageId, name, description) {
    return await Images.updateAsync(imageId, {
      $set: {
        name,
        description,
        updatedAt: new Date()
      }
    });
  }
});
