# 🚀 Meteor Galaxy Deployment Guide

## Issue Encountered & Solution

### Problem

When deploying to Meteor Galaxy through the dashboard, the deployment was failing with:

```
/bin/sh: 1: Demo: not found
```

### Root Cause

Environment variables with spaces (like `APP_NAME=Meteor Demo App`) were not properly quoted, causing the shell to interpret "Demo" as a separate command during the build process.

### Solution

Quote all environment variables that contain spaces or special characters:

```bash
# ❌ Wrong - causes shell parsing errors
APP_NAME=Meteor Demo App

# ✅ Correct - properly quoted
APP_NAME="Meteor Demo App"
```

## 📋 Safe Deployment Checklist

### 1. Environment Variables (.env file)

Ensure all values are properly quoted:

```bash
# Database Configuration
MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

# Server Configuration
ROOT_URL="https://your-app.meteorapp.com"
PORT="3000"

# App Configuration (IMPORTANT: Quote values with spaces!)
APP_NAME="Your App Name"
APP_VERSION="1.0.0"
DEBUG_MODE="true"

# API Keys
API_KEY="your-api-key"
SECRET_KEY="your-secret-key"
```

### 2. Settings Files

- `settings.json` - Development settings
- `settings-production.json` - Production settings

Use actual values in settings.json for Galaxy deployment:

```json
{
  "public": {
    "appName": "Your App Name",
    "version": "1.0.0",
    "environment": "production"
  },
  "private": {
    "mongoUrl": "mongodb+srv://...",
    "secret": "your-secret"
  }
}
```

### 3. Galaxy Dashboard Deployment Steps

1. Import your repository to Galaxy
2. In deployment settings, add: `--settings settings.json`
3. Set environment variables in Galaxy dashboard (if needed)
4. Deploy

### 4. Common Pitfalls & Solutions

#### ❌ Unquoted Environment Variables

```bash
APP_NAME=My App Name  # Causes "My" command not found
```

#### ✅ Properly Quoted

```bash
APP_NAME="My App Name"  # Works correctly
```

#### ❌ Environment Variable Placeholders in settings.json

```json
{
  "appName": "APP_NAME" // Galaxy tries to use literal "APP_NAME"
}
```

#### ✅ Actual Values in settings.json

```json
{
  "appName": "My App Name" // Uses the actual app name
}
```

## 🔧 Environment Variable Best Practices

1. **Always quote string values** with spaces or special characters
2. **Use underscores instead of spaces** when possible: `My_App_Name`
3. **Keep sensitive data out of settings files** - use Galaxy's environment variables
4. **Test locally first** with `meteor run --settings settings.json`

## 🌟 Galaxy-Specific Notes

- Galaxy automatically adds `TOOL_NODE_FLAGS=--max-old-space-size=6144` (this is normal)
- Galaxy uses its own environment variable system
- The `.env` file is mainly for local development
- Use `--settings settings.json` flag in Galaxy deployment command

## ✅ Verification Steps

After successful deployment:

1. Check app loads at your Galaxy URL
2. Verify configuration displays correctly in your app
3. Test API endpoints (like `/api/info`)
4. Check Galaxy logs for any runtime errors

## ✅ Successful Deployment Example

Here's what a successful Galaxy deployment looks like:

```
Successfully built version 1.
Bundle of the commit 755c4d3a3916ec53146b59c8f3597b8a03785086 sent
Application process starting, version 1

🚀 Server starting up...
📱 App Name: Meteor Demo App
🌍 Environment: development
🔢 Version: 1.0.0
🔒 Server Port: 3000
🗄️  MongoDB URL: Configured ✓
🔑 API Key: Configured ✓
🛠️  Debug Mode: true
📍 ROOT_URL: https://demo1.meteorapp.com
⚡ PORT: 3000
```

**Key indicators of success:**

- ✅ "Successfully built version 1"
- ✅ "Application process starting"
- ✅ Server startup logs showing proper configuration
- ✅ MongoDB and API keys showing as "Configured ✓"
- ✅ Correct ROOT_URL for your Galaxy app

**Your app is now live at:** https://demo1.meteorapp.com

---

**Key Takeaway**: When deploying to Galaxy, always quote environment variables with spaces to prevent shell parsing errors during the build process.
