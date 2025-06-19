# Meteor Image CRUD App - Deployment Guide

A simple Meteor application with image CRUD functionality, demonstrating proper Galaxy deployment configuration.

## 🚀 Live Demo

**Deployed App:** https://demo-deploy.meteorapp.com

## 📋 Project Overview

This is a minimal Meteor application that provides:
- ✅ Simple image management (Create, Read, Update, Delete)
- ✅ MongoDB Atlas integration
- ✅ Backblaze B2 cloud storage configuration
- ✅ Galaxy deployment setup
- ✅ Settings-based configuration management

## 🛠️ Tech Stack

- **Framework:** Meteor.js 3.2.2
- **Frontend:** React 18.2.0
- **Database:** MongoDB Atlas
- **Cloud Storage:** Backblaze B2
- **Deployment:** Galaxy (meteor.com)

## 📁 Project Structure

```
meteorjs-deployment-demo/
├── .meteor/              # Meteor configuration
├── client/               # Client-side code
│   ├── main.html
│   ├── main.jsx
│   └── main.css
├── imports/
│   ├── api/
│   │   └── images.js     # Images collection & methods
│   └── ui/
│       └── App.jsx       # Main React component
├── server/
│   └── main.js           # Server startup & settings
├── settings.json         # Configuration file
└── package.json
```

## ⚙️ Configuration

### settings.json Structure

```json
{
  "galaxy.meteor.com": {
    "env": {
      "MONGO_URL": "mongodb+srv://username:password@cluster.mongodb.net/database",
      "ROOT_URL": "https://your-app.meteorapp.com"
    }
  },
  "private": {
    "serverPort": 80,
    "mongoUrl": "mongodb+srv://username:password@cluster.mongodb.net/database",
    "secret": "your-secret-key",
    "apiKey": "your-api-key",
    "debugMode": false,
    "backblaze": {
      "keyId": "your-key-id",
      "keyName": "your-key-name",
      "applicationKey": "your-application-key",
      "bucketName": "your-bucket-name"
    }
  }
}
```

### Key Configuration Sections:

1. **`galaxy.meteor.com.env`** - Galaxy-specific environment variables
2. **`private`** - Server-side settings (not sent to client)

## 🚀 Deployment Guide

### Prerequisites

1. **Meteor Account** - Sign up at [meteor.com](https://meteor.com)
2. **MongoDB Atlas** - Create cluster at [mongodb.com](https://mongodb.com)
3. **Git Repository** - Your code must be in a Git repository

### Step 1: MongoDB Setup

1. Create MongoDB Atlas cluster
2. Create database user with read/write permissions
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`
4. Whitelist Galaxy IP addresses (or use 0.0.0.0/0 for all IPs)

### Step 2: Configure settings.json

Create `settings.json` with the Galaxy-specific format:

```json
{
  "galaxy.meteor.com": {
    "env": {
      "MONGO_URL": "your-mongodb-connection-string",
      "ROOT_URL": "https://your-app-name.meteorapp.com"
    }
  }
}
```

### Step 3: Deploy to Galaxy

1. **Via Galaxy Dashboard:**
   - Go to [galaxy.meteor.com](https://galaxy.meteor.com)
   - Connect your Git repository
   - Configure deployment settings
   - Deploy!

2. **Via Command Line:**
   ```bash
   meteor deploy your-app-name.meteorapp.com --settings settings.json
   ```

## 🔧 Development Setup

### Local Development

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd meteorjs-deployment-demo
   ```

2. **Install dependencies:**
   ```bash
   meteor npm install
   ```

3. **Run locally:**
   ```bash
   meteor run --settings settings.json
   ```

4. **Access app:**
   - Local: http://localhost:3000
   - Galaxy: https://your-app.meteorapp.com

### Environment Variables

For local development, you can also use a `.env` file:

```bash
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database
ROOT_URL=http://localhost:3000
PORT=3000
```

## 🐛 Common Deployment Issues & Solutions

### Issue 1: "MONGO_URL must be set in environment"

**Problem:** Galaxy can't connect to MongoDB

**Solution:** 
- Use the Galaxy-specific format in `settings.json`:
  ```json
  {
    "galaxy.meteor.com": {
      "env": {
        "MONGO_URL": "mongodb+srv://..."
      }
    }
  }
  ```

### Issue 2: "You're not in a Meteor project directory"

**Problem:** Missing or corrupted `.meteor` folder

**Solution:**
- Ensure `.meteor` folder is committed to Git
- Check `.meteor/release` file exists
- Only `.meteor/local` should be in `.gitignore`

### Issue 3: "insert is not available on the server"

**Problem:** Using deprecated synchronous database operations

**Solution:** Use async operations:
```javascript
// ❌ Old way
Images.insert(data)

// ✅ New way  
await Images.insertAsync(data)
```

### Issue 4: Settings not loading

**Problem:** Incorrect settings.json format for Galaxy

**Solution:** Use the proper Galaxy format with `galaxy.meteor.com.env` section

## 📊 Deployment Verification

After successful deployment, you should see logs like:

```
✅ Settings loaded successfully
🌍 Environment Variables:
   - ROOT_URL: https://your-app.meteorapp.com
   - PORT: 3000
   - MONGO_URL: mongodb+srv://...
✅ Settings analysis complete!
📸 Image CRUD system ready!
```

## 🔒 Security Notes

1. **Never commit sensitive data** to Git
2. **Use environment variables** for production secrets
3. **Configure MongoDB IP whitelist** properly
4. **Use strong passwords** for database users

## 📚 Key Learnings

1. **Galaxy requires specific settings format** - Not just any `settings.json` structure
2. **Environment variables vs private settings** - Galaxy sets env vars from `galaxy.meteor.com.env`
3. **Async database operations** - Modern Meteor requires `insertAsync`, `updateAsync`, etc.
4. **Proper import order** - Collections must be imported after MONGO_URL is set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `meteor run --settings settings.json`
5. Submit a pull request

## 📝 License

MIT License - feel free to use this as a template for your own Meteor deployments!

## 🆘 Support

- **Meteor Documentation:** https://docs.meteor.com
- **Galaxy Documentation:** https://galaxy-guide.meteor.com
- **MongoDB Atlas:** https://docs.atlas.mongodb.com

---

*This deployment guide was created after successfully troubleshooting a 2-day Galaxy deployment issue. The key was understanding Galaxy's specific requirements for settings.json configuration.*
