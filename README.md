# Meteor Deployment Demo

A simple Meteor app to test hosting and configuration using settings.json and environment variables.

## 🚀 Quick Start

### Development

```bash
npm run dev
```

This runs the app with `settings.json` configuration.

### Production

```bash
npm run prod
```

This runs the app with `settings-production.json` configuration.

### Build for Deployment

```bash
npm run build
```

This creates a production bundle in `../build` directory.

## ⚙️ Configuration

### Settings Files

- `settings.json` - Development configuration
- `settings-production.json` - Production configuration

### Environment Variables

The app also supports these environment variables:

- `PORT` - Server port (default: 3000)
- `ROOT_URL` - App root URL (default: http://localhost:3000)
- `MONGO_URL` - MongoDB connection string
- `METEOR_SETTINGS` - JSON string of settings (alternative to settings file)

## 📝 Example Environment Variables for Hosting

Create a `.env` file (don't commit this) or set these in your hosting platform:

```bash
PORT=3000
ROOT_URL=https://your-app-domain.com
MONGO_URL=mongodb://your-mongo-host:27017/your-db
METEOR_SETTINGS='{"public":{"appName":"My Hosted App","environment":"production"},"private":{"secret":"your-secret"}}'
```

## 🌐 Common Hosting Platforms

### Heroku

```bash
# Add buildpack
heroku buildpacks:set https://github.com/AdmitHub/meteor-buildpack-horse.git

# Set environment variables
heroku config:set ROOT_URL=https://your-app.herokuapp.com
heroku config:set MONGO_URL=mongodb://your-mongo-url
```

### DigitalOcean App Platform

```yaml
# app.yaml
name: meteor-app
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/your-repo
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: PORT
        value: "8080"
      - key: ROOT_URL
        value: https://your-app.ondigitalocean.app
```

### Galaxy (Meteor's hosting)

```bash
# Deploy to Galaxy
meteor deploy your-app.meteorapp.com --settings settings-production.json
```

## 🔍 Testing Configuration

Visit these endpoints to verify configuration:

- `/` - Main app with configuration display
- `/api/info` - JSON API endpoint with server info

## 📂 Project Structure

```
/
├── settings.json              # Dev configuration
├── settings-production.json   # Prod configuration
├── package.json              # Scripts and dependencies
├── client/
│   └── main.jsx             # Client entry point
├── server/
│   └── main.js              # Server with settings demo
└── imports/
    └── ui/
        └── App.jsx          # Main React component
```

## 🔧 Environment Variables Setup

### Using .env Files with Settings

The app now supports referencing environment variables directly in your settings.json files:

**1. Create a `.env` file:**

```bash
# Database Configuration
MONGO_URL=mongodb://localhost:27017/meteor-demo
MONGO_OPLOG_URL=mongodb://localhost:27017/local

# Server Configuration
ROOT_URL=http://localhost:3000
PORT=3000

# App Configuration
APP_NAME=Meteor Demo App
APP_VERSION=1.0.0
DEBUG_MODE=true

# API Keys (examples)
API_KEY=your-api-key-here
SECRET_KEY=your-secret-key-here
```

**2. Reference env vars in settings.json:**

```json
{
  "public": {
    "appName": "APP_NAME",
    "version": "APP_VERSION",
    "environment": "development"
  },
  "private": {
    "serverPort": "PORT",
    "mongoUrl": "MONGO_URL",
    "secret": "SECRET_KEY",
    "apiKey": "API_KEY",
    "debugMode": "DEBUG_MODE"
  }
}
```

**3. Run with environment variables:**

```bash
# Development with env vars
npm run dev-env

# Production with env vars
npm run prod-env

# Build with env vars
npm run build-env
```

### How It Works

1. **Environment Variables**: Stored in `.env` file (git ignored)
2. **Settings Files**: Reference env vars by name (e.g., `"PORT"`)
3. **Server Code**: Automatically substitutes actual values when loading
4. **Result**: Same settings files work across all environments

### Environment Variable Substitution

The server automatically replaces strings in settings.json that match environment variable names:

- `"PORT"` → `process.env.PORT` value (3000)
- `"APP_NAME"` → `process.env.APP_NAME` value ("Meteor Demo App")
- `"DEBUG_MODE"` → `process.env.DEBUG_MODE` (parsed as boolean)

### Deployment Benefits

- **Security**: Secrets stay in environment, not in code
- **Flexibility**: Same settings files work everywhere
- **Simplicity**: Just set env vars on hosting platform
- **Best Practice**: Industry standard approach

### Example Deployment

**Heroku:**

```bash
heroku config:set APP_NAME="My Production App"
heroku config:set MONGO_URL="mongodb://prod-server/db"
heroku config:set SECRET_KEY="super-secret-key"
git push heroku main
```

**Galaxy:**
Set env vars in Galaxy dashboard, then:

```bash
meteor deploy your-app.meteorapp.com --settings settings-production.json
```

The same `settings-production.json` file works everywhere! 🎉
