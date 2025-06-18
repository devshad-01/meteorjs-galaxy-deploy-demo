import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Files } from '/imports/api/files';

export const FileManager = () => {
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');

  // Subscribe to files and get them
  const files = useTracker(() => {
    const handle = Meteor.subscribe('files');
    return Files.find({}, { sort: { createdAt: -1 } }).fetch();
  }, []);

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
        />
        {uploading && <p>⏳ Uploading...</p>}
      </div>

      {/* Files List */}
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
        <h3>📋 Files ({files.length})</h3>
        
        {files.length === 0 ? (
          <p>No files uploaded yet. Upload your first file above! 👆</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {files.map((file) => (
              <div 
                key={file._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ flex: 1 }}>
                  {editingFile === file._id ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ flex: 1, padding: '5px' }}
                      />
                      <button onClick={handleUpdate} style={{ padding: '5px 10px' }}>
                        ✅ Save
                      </button>
                      <button 
                        onClick={() => setEditingFile(null)}
                        style={{ padding: '5px 10px' }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <strong>{file.name}</strong>
                      <br />
                      <small>
                        📊 {formatFileSize(file.size)} • 
                        🗓️ {new Date(file.createdAt).toLocaleDateString()} •
                        📁 {file.type}
                      </small>
                    </>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '5px' }}>
                  <a 
                    href={file.backblazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    📥 Download
                  </a>
                  
                  <button
                    onClick={() => handleEdit(file)}
                    style={{
                      padding: '5px 10px',
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
                      padding: '5px 10px',
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
