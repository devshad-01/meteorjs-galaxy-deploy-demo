import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Images } from '../api/images';

export const App = () => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Subscribe to images and get data
  const { images, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('images');
    return {
      images: Images.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handle.ready()
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !url) return;

    if (editingId) {
      // Update existing image
      Meteor.call('images.update', editingId, name, description, (error) => {
        if (!error) {
          setEditingId(null);
          setName('');
          setUrl('');
          setDescription('');
        }
      });
    } else {
      // Add new image
      Meteor.call('images.insert', name, url, description, (error) => {
        if (!error) {
          setName('');
          setUrl('');
          setDescription('');
        }
      });
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
      Meteor.call('images.remove', imageId);
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
            type="url"
            placeholder="Image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={editingId} // Don't allow URL changes when editing
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <div className="form-buttons">
            <button type="submit">
              {editingId ? '✏️ Update' : '➕ Add Image'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="cancel-btn">
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
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
