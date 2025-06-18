import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Files } from '/imports/api/files';

export const FileManager = () => {
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');

  // Helper function to check if file is an image
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  // Subscribe to files and get them
  const files = useTracker(() => {
    const handle = Meteor.subscribe('files');
    return Files.find({}, { sort: { createdAt: -1 } }).fetch();
  }, []);

  // Separate images from other files
  const images = files.filter(file => isImage(file.type));
  const otherFiles = files.filter(file => !isImage(file.type));

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ File uploaded successfully');
        event.target.value = ''; // Clear input
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      Meteor.call('files.remove', fileId, (error) => {
        if (error) {
          alert('Delete failed: ' + error.message);
        }
      });
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file._id);
    setNewName(file.name);
  };

  const handleUpdate = () => {
    Meteor.call('files.update', editingFile, newName, (error) => {
      if (error) {
        alert('Update failed: ' + error.message);
      } else {
        setEditingFile(null);
        setNewName('');
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ImagePreview = ({ file }) => {
    if (!isImage(file.type)) return null;

    return (
      <div style={{ 
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <img 
          src={file.backblazeUrl}
          alt={file.name}
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
            borderRadius: '8px',
            border: '2px solid #ddd',
            cursor: 'pointer'
          }}
          onClick={() => window.open(file.backblazeUrl, '_blank')}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none', color: '#999', padding: '20px' }}>
          🖼️ Image preview not available
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h2>📁 File Manager (Backblaze B2)</h2>
      
      {/* Upload Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px dashed #ddd'
      }}>
        <h3>📤 Upload File</h3>
        <input 
          type="file" 
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
          accept="image/*,*" // Accept images and all files
        />
        {uploading && <p>⏳ Uploading...</p>}
        <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
          💡 Tip: Upload images to see them in the gallery below!
        </p>
      </div>

      {/* Image Gallery Section */}
      {images.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>🖼️ Image Gallery ({images.length})</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            {images.map((image) => (
              <div 
                key={image._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa'
                }}
              >
                <img 
                  src={image.backblazeUrl}
                  alt={image.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(image.backblazeUrl, '_blank')}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ 
                  display: 'none', 
                  height: '150px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  backgroundColor: '#f8f9fa'
                }}>
                  🖼️ Preview not available
                </div>
                <div style={{ padding: '10px' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '14px',
                    marginBottom: '5px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {image.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    {formatFileSize(image.size)}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <a 
                      href={image.backblazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '6px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      📥 View
                    </a>
                    <button
                      onClick={() => handleDelete(image._id)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List */}
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
        <h3>📋 All Files ({files.length})</h3>
        
        {files.length === 0 ? (
          <p>No files uploaded yet. Upload your first file above! 👆</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {files.map((file) => (
              <div 
                key={file._id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                {/* File Info Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: isImage(file.type) ? '15px' : '0'
                }}>
                  <div style={{ flex: 1 }}>
                    {editingFile === file._id ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <button onClick={handleUpdate} style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          ✅ Save
                        </button>
                        <button 
                          onClick={() => setEditingFile(null)}
                          style={{ 
                            padding: '8px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <strong style={{ fontSize: '16px' }}>{file.name}</strong>
                          {isImage(file.type) && <span style={{ 
                            backgroundColor: '#17a2b8', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px' 
                          }}>🖼️ Image</span>}
                        </div>
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          📊 {formatFileSize(file.size)} • 
                          🗓️ {new Date(file.createdAt).toLocaleDateString()} • 
                          📁 {file.type}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                    <a 
                      href={file.backblazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      📥 Download
                    </a>
                    
                    <button
                      onClick={() => handleEdit(file)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(file._id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Image Preview Section */}
                <ImagePreview file={file} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
