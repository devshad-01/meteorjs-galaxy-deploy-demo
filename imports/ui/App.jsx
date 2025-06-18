import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { FileManager } from './FileManager';

export const App = () => {
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch server info from our API endpoint
    fetch('/api/info')
      .then(response => response.json())
      .then(data => {
        setServerInfo(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching server info:', error);
        setLoading(false);
      });
  }, []);

  // Access public settings (available on client)
  const settings = Meteor.settings.public || {};

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h1>🚀 {settings.appName || 'Meteor Deployment Demo'}</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>📋 Configuration Info</h2>
        <p><strong>Environment:</strong> {settings.environment || 'development'}</p>
        <p><strong>Version:</strong> {settings.version || '1.0.0'}</p>
        <p><strong>Settings Source:</strong> {settings.appName ? 'settings.json' : 'defaults'}</p>
      </div>

      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>🖥️ Server Information</h2>
        {loading ? (
          <p>Loading server info...</p>
        ) : serverInfo ? (
          <div>
            <p><strong>Server App Name:</strong> {serverInfo.appName}</p>
            <p><strong>Server Environment:</strong> {serverInfo.environment}</p>
            <p><strong>Server Port:</strong> {serverInfo.port}</p>
            <p><strong>Root URL:</strong> {serverInfo.rootUrl}</p>
            <p><strong>Backblaze B2:</strong> {serverInfo.backblazeConfigured ? '✅ Configured' : '❌ Not configured'}</p>
            <p><strong>Server Time:</strong> {new Date(serverInfo.timestamp).toLocaleString()}</p>
          </div>
        ) : (
          <p>Failed to load server info</p>
        )}
      </div>

      {/* File Manager Component */}
      <FileManager />

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>🎯 Features Demonstrated</h2>
        <p>This app demonstrates:</p>
        <ul>
          <li>✅ Using settings.json for configuration</li>
          <li>✅ Environment variables support</li>
          <li>✅ Different settings for dev/production</li>
          <li>✅ Simple API endpoints</li>
          <li>✅ Client-server configuration sharing</li>
          <li>✅ CRUD operations with MongoDB</li>
          <li>✅ File uploads to Backblaze B2</li>
          <li>✅ File management (Create, Read, Update, Delete)</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#d1ecf1', 
        padding: '15px', 
        borderRadius: '8px'
      }}>
        <h2>🚀 How to Deploy</h2>
        <p><strong>Development:</strong> <code>npm run dev</code></p>
        <p><strong>Production:</strong> <code>npm run prod</code></p>
        <p><strong>Build:</strong> <code>npm run build</code></p>
        <p><strong>Galaxy:</strong> Use dashboard with <code>--settings settings.json</code></p>
      </div>
    </div>
  );
};
