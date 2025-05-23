# InfraSyncus v2.0.0 Installation Guide
## JanusGraph Edition

Welcome to InfraSyncus v2.0.0, featuring advanced JanusGraph knowledge graph capabilities!

## 📦 Package Downloads

### For Apple Silicon (M1/M2/M3) Macs:
- **InfraSyncus-2.0.0-arm64.dmg** - Recommended installer
- **InfraSyncus-2.0.0-arm64-mac.zip** - Portable version

### For Intel Macs:
- **InfraSyncus-2.0.0.dmg** - Recommended installer  
- **InfraSyncus-2.0.0-mac.zip** - Portable version

## 🖥️ System Requirements

- **macOS 10.13** or later
- **4GB RAM** minimum (8GB recommended for graph analysis)
- **1GB free disk space** 
- **Docker Desktop** (optional, for JanusGraph features)

## 🚀 Installation Steps

### Method 1: DMG Installer (Recommended)

1. **Download** the appropriate `.dmg` file for your Mac
2. **Double-click** the downloaded DMG file
3. **Drag** InfraSyncus to your Applications folder
4. **Launch** from Applications or Spotlight

### Method 2: ZIP Archive

1. **Download** the appropriate `.zip` file
2. **Extract** the archive
3. **Move** `InfraSyncus.app` to your Applications folder  
4. **Launch** from Applications

## 🔒 First Launch Security

On first launch, you may see a security warning:

1. Go to **System Preferences > Security & Privacy**
2. Click **"Open Anyway"** to allow InfraSyncus to run
3. Or right-click the app and select **"Open"**

## 🗃️ What's New in v2.0.0

### 🎯 JanusGraph Integration
- **Open-source graph database** replacing Neo4j
- **Better scalability** for large knowledge graphs
- **Gremlin query language** for advanced graph operations
- **Docker-based setup** for easy deployment

### 🧠 Enhanced Features
- **Persistent knowledge graphs** that build over time
- **Advanced text analysis** with co-occurrence relationships
- **Real-time graph visualization** updates
- **Improved Zettelkasten** note linking

## ⚡ Quick Start

1. **Launch InfraSyncus** from Applications
2. **Wait** for the backend to start (first launch may take 30-60 seconds)
3. **Begin analyzing text** immediately - no setup required!
4. **Access Help menu** for JanusGraph setup instructions

## 🐳 Optional: JanusGraph Setup

For advanced graph features, install JanusGraph:

1. **Install Docker Desktop** from [docker.com](https://docker.com)
2. **Open Terminal** and navigate to InfraSyncus app directory
3. **Run JanusGraph**:
   ```bash
   docker-compose -f docker-compose.janusgraph.yml up -d
   ```
4. **Restart InfraSyncus** to connect to JanusGraph

### JanusGraph Benefits:
- 📊 **Persistent graph storage** across sessions
- 🔍 **Advanced graph queries** and analysis
- 📈 **Better performance** for large datasets
- 🌐 **Knowledge graph building** over time

## 📂 File Locations

### Application Data:
- **Main App**: `/Applications/InfraSyncus.app`
- **User Data**: `~/Library/Application Support/InfraSyncus/`
- **Logs**: `~/Library/Logs/InfraSyncus/`

### Configuration:
- **Settings**: Stored within the app bundle
- **Database**: Local SQLite database for notes
- **JanusGraph**: Docker volume (if using JanusGraph)

## 🛠️ Troubleshooting

### Application Won't Start
1. **Check macOS version** (10.13+ required)
2. **Verify security settings** in System Preferences
3. **Restart your Mac** if needed
4. **Check Console app** for error messages

### Backend Connection Issues
1. **Wait longer** on first startup (can take 60+ seconds)
2. **Check port 3001** isn't used by other apps
3. **Restart the application**
4. **Check Activity Monitor** for InfraSyncus processes

### JanusGraph Not Working
1. **Verify Docker is running**
2. **Check Docker Desktop** is installed and started
3. **Run setup command** in Terminal
4. **Restart InfraSyncus** after Docker setup

## 🔄 Updating

### Automatic Updates
- InfraSyncus will **check for updates** on startup
- **Download notifications** will appear when available
- **Install updates** through the application menu

### Manual Updates
1. **Download** the latest DMG from releases
2. **Quit** the current InfraSyncus app
3. **Install** the new version (replaces old version)
4. **Launch** the updated application

## 🗑️ Uninstallation

To completely remove InfraSyncus:

1. **Drag** InfraSyncus.app to Trash
2. **Delete user data** (optional):
   ```bash
   rm -rf ~/Library/Application\ Support/InfraSyncus/
   rm -rf ~/Library/Logs/InfraSyncus/
   ```
3. **Stop JanusGraph** (if used):
   ```bash
   docker-compose -f docker-compose.janusgraph.yml down
   docker volume prune
   ```

## 📞 Support

### Getting Help
- **Help Menu** → JanusGraph Setup Guide
- **Help Menu** → Documentation
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@infrasyncus.com

### Community
- **Discussions**: GitHub Discussions
- **Updates**: Follow releases on GitHub
- **Feedback**: We welcome your suggestions!

## 🎉 Welcome to InfraSyncus v2.0.0!

You're now ready to explore advanced text network analysis with JanusGraph-powered knowledge graphs. Start by analyzing some text and watch your ideas come to life as an interactive network!

---

**Version**: 2.0.0 - JanusGraph Edition  
**Release Date**: 2025  
**Platform**: macOS (Intel & Apple Silicon)  
**License**: MIT 