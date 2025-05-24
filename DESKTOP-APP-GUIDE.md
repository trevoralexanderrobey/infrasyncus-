# InfraSyncus Desktop Application

## 🎉 Ready-to-Use Desktop App!

Your InfraSyncus application has been packaged as a standalone desktop application. No more command line needed!

## Installation Options

### Option 1: DMG Installer (Mac - Recommended)
1. Double-click `dist-electron/InfraSyncus-1.0.0.dmg`
2. Drag InfraSyncus to your Applications folder
3. Double-click InfraSyncus in Applications to launch

### Option 2: ZIP File (Mac - Portable)
1. Double-click `dist-electron/InfraSyncus-1.0.0-mac.zip` to extract
2. Double-click the extracted `InfraSyncus.app` to run

### Option 3: Direct App Bundle (Mac - Development)
1. Navigate to `dist-electron/mac/`
2. Double-click `InfraSyncus.app` to run directly

## What Happens When You Launch

1. **Automatic Startup**: The app automatically starts both the backend server and frontend interface
2. **No Configuration**: Everything is pre-configured and ready to use
3. **Direct Access**: Opens directly to the InfraSyncus interface
4. **Clean Shutdown**: Closing the app properly shuts down all services

## Features Available

- ✅ **Text Analysis**: Paste text and see instant network visualization
- ✅ **Zettelkasten**: Create and link notes with graph visualization  
- ✅ **Graph Export**: Save analysis in JSON, GEXF, or CSV formats
- ✅ **File Import**: Import TXT, MD, or CSV files for analysis
- ✅ **Real-time Updates**: Live graph updates as you type

## Default Credentials

- **Zettelkasten Password**: `InfraSyncus2024!`

## Security Note

The desktop app runs a local server (port 3001) that only accepts connections from localhost. Your data stays completely private on your machine.

## Creating Installers for Other Platforms

### Windows
```bash
npm run dist:win
```
Creates: `.exe` installer and portable `.exe`

### Linux  
```bash
npm run dist:linux
```
Creates: `.AppImage` and `.deb` packages

### All Platforms
```bash
npm run dist
```
Creates packages for the current platform

## Troubleshooting

### App Won't Start
- Check if port 3001 is available
- Try running: `lsof -ti:3001 | xargs kill -9`
- Restart the app

### "App is damaged" (Mac)
```bash
xattr -cr /Applications/InfraSyncus.app
```

### Performance Issues
- Close other applications using significant resources
- Restart the app if memory usage is high

## Distribution

You can share the following files with others:
- `InfraSyncus-1.0.0.dmg` - Mac installer
- `InfraSyncus-1.0.0-mac.zip` - Mac portable app

Recipients just need to double-click to install and run!

---

**That's it!** 🚀 Your InfraSyncus app is now a professional desktop application that users can install and run like any other software. 