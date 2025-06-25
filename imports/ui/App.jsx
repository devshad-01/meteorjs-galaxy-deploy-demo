import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Images } from '../api/images';

export const App = () => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [folder, setFolder] = useState('forum_posts');
  const [storage, setStorage] = useState('cloudinary');

  // Subscribe to images and get data
  const { images, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('images');
    return {
      images: Images.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handle.ready()
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    if (!name || (!url && !file)) {
      setErrorMsg('Please provide a title and an image.');
      setLoading(false);
      return;
    }

    if (editingId) {
      Meteor.callAsync('images.update', editingId, name, description)
        .then(() => {
          setEditingId(null);
          setName('');
          setUrl('');
          setDescription('');
          setFile(null);
          setSuccessMsg('Post updated!');
        })
        .catch((error) => {
          setErrorMsg(error.reason || 'Failed to update post.');
        })
        .finally(() => setLoading(false));
    } else {
      let imageUrl = url;
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result;
          if (storage === 'cloudinary') {
            try {
              const response = await fetch('/api/cloudinary/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64, folder })
              });
              const data = await response.json();
              if (response.ok && data.url) {
                imageUrl = data.url;
                try {
                  const insertResult = await Meteor.callAsync('images.insert', name, imageUrl, description);
                  setName('');
                  setUrl('');
                  setDescription('');
                  setFile(null);
                  setSuccessMsg('Post created!');
                } catch (error) {
                  setErrorMsg(error.reason || error.message || 'Failed to create post.');
                } finally {
                  setLoading(false);
                }
              } else {
                setLoading(false);
                setErrorMsg((data && data.error) || 'Image upload failed.');
              }
            } catch (err) {
              setLoading(false);
              setErrorMsg('Image upload failed.');
            }
          } else if (storage === 'backblaze') {
            Meteor.call('images.uploadToB2', file.name, file.type, { base64 }, async (err, result) => {
              if (!err && result && result.url) {
                imageUrl = result.url;
                try {
                  const insertResult = await Meteor.callAsync('images.insert', name, imageUrl, description);
                  setName('');
                  setUrl('');
                  setDescription('');
                  setFile(null);
                  setSuccessMsg('Post created!');
                } catch (error) {
                  setErrorMsg(error.reason || error.message || 'Failed to create post.');
                } finally {
                  setLoading(false);
                }
              } else {
                setLoading(false);
                setErrorMsg((err && (err.reason || err.message)) || 'Image upload failed.');
              }
            });
          }
        };
        reader.onerror = () => { setLoading(false); setErrorMsg('Failed to read image file.'); };
        reader.readAsDataURL(file);
        return;
      }
      Meteor.callAsync('images.insert', name, imageUrl, description)
        .then(() => {
          setName('');
          setUrl('');
          setDescription('');
          setFile(null);
          setSuccessMsg('Post created!');
        })
        .catch((error) => {
          setErrorMsg(error.reason || 'Failed to create post.');
        })
        .finally(() => setLoading(false));
    }
  };

  const handleEdit = (image) => {
    setEditingId(image._id);
    setName(image.name);
    setUrl(image.url);
    setDescription(image.description);
  };

  const handleDelete = (imageId) => {
    if (confirm('Are you sure you want to delete this image?')) {
      Meteor.callAsync('images.remove', imageId)
        .catch(() => setErrorMsg('Failed to delete post.'));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setUrl('');
    setDescription('');
  };

  if (isLoading) {
    return <div className="loading">Loading images...</div>;
  }

  return (
    <div className="app">
      <h1>📸 Simple Image Manager</h1>
      
      {/* Add/Edit Form */}
      <div className="form-container">
        <h2>{editingId ? 'Edit Image' : 'Add New Image'}</h2>
        <form onSubmit={handleSubmit} className="image-form">
          <input
            type="text"
            placeholder="Image name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required={!editingId && !url}
            disabled={editingId}
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={editingId}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <select value={folder} onChange={e => setFolder(e.target.value)} disabled={editingId}>
            <option value="forum_posts">Forum Post</option>
            <option value="avatars">Avatar</option>
          </select>
          <select value={storage} onChange={e => setStorage(e.target.value)} disabled={editingId}>
            <option value="cloudinary">Cloudinary</option>
            <option value="backblaze">Backblaze B2</option>
          </select>
          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {editingId ? '✏️ Update' : loading ? 'Uploading...' : '🚀 Post'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="cancel-btn">
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
        <div className="form-messages">
          {loading && <div className="loading-msg">Uploading... Please wait.</div>}
          {errorMsg && <div className="error-msg">{errorMsg}</div>}
          {successMsg && <div className="success-msg">{successMsg}</div>}
        </div>
      </div>

      {/* Images List */}
      <div className="images-container">
        <h2>Images ({images.length})</h2>
        {images.length === 0 ? (
          <p className="no-images">No images yet. Add one above! 👆</p>
        ) : (
          <div className="images-grid">
            {images.map((image) => (
              <div key={image._id} className="image-card">
                <img src={image.url} alt={image.name} />
                <div className="image-info">
                  <h3>{image.name}</h3>
                  {image.description && <p>{image.description}</p>}
                  <small>Added: {image.createdAt.toLocaleDateString()}</small>
                  <div className="image-actions">
                    <button onClick={() => handleEdit(image)} className="edit-btn">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(image._id)} className="delete-btn">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
