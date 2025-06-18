import B2 from 'backblaze-b2';

class BackblazeService {
  constructor() {
    this.b2 = null;
    this.bucketId = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const settings = Meteor.settings.private.backblaze;
    if (!settings) {
      throw new Error('Backblaze settings not found');
    }

    this.b2 = new B2({
      applicationKeyId: settings.keyId,
      applicationKey: settings.applicationKey
    });

    try {
      // Authorize with Backblaze
      await this.b2.authorize();
      console.log('✅ Backblaze authorized successfully');

      // Get bucket (we'll use the first available bucket)
      const response = await this.b2.listBuckets();
      if (response.data.buckets.length > 0) {
        this.bucketId = response.data.buckets[0].bucketId;
        console.log('📦 Using bucket:', response.data.buckets[0].bucketName);
      } else {
        throw new Error('No buckets found in Backblaze account');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Backblaze initialization failed:', error.message);
      throw error;
    }
  }

  async uploadFile(fileName, fileBuffer, contentType) {
    await this.initialize();

    try {
      // Get upload URL
      const uploadUrlResponse = await this.b2.getUploadUrl({
        bucketId: this.bucketId
      });

      // Upload the file
      const uploadResponse = await this.b2.uploadFile({
        uploadUrl: uploadUrlResponse.data.uploadUrl,
        uploadAuthToken: uploadUrlResponse.data.authorizationToken,
        fileName: fileName,
        data: fileBuffer,
        info: {
          'Content-Type': contentType
        }
      });

      console.log('📤 File uploaded successfully:', fileName);
      
      return {
        fileId: uploadResponse.data.fileId,
        fileName: uploadResponse.data.fileName,
        downloadUrl: `https://f005.backblazeb2.com/file/${uploadResponse.data.bucketName}/${uploadResponse.data.fileName}`
      };
    } catch (error) {
      console.error('❌ File upload failed:', error.message);
      throw error;
    }
  }

  async deleteFile(fileId, fileName) {
    await this.initialize();

    try {
      await this.b2.deleteFileVersion({
        fileId: fileId,
        fileName: fileName
      });

      console.log('🗑️ File deleted successfully:', fileName);
      return true;
    } catch (error) {
      console.error('❌ File deletion failed:', error.message);
      throw error;
    }
  }
}

export const backblazeService = new BackblazeService();
