# InfraSyncus - Knowledge Graph & Zettelkasten Platform

InfraSyncus is an advanced text analysis and knowledge management platform inspired by InfraNodus, featuring sophisticated text network analysis and zettelkasten functionality.

## ✨ Key Features

### 🧠 **Advanced Text Network Analysis**
- **4-gram sliding window analysis** (like InfraNodus)
- **Community detection** using Louvain-like algorithms
- **Content gap identification** for discovering research opportunities
- **Topic clustering** and network visualization
- **Diversity metrics** for discourse analysis

### 📝 **Zettelkasten System**
- **Atomic note creation** with tagging
- **Bidirectional linking** between notes
- **Graph visualization** of note connections
- **AI-powered suggestions** for related concepts
- **Timeline view** for chronological exploration

### 📊 **Interactive Visualizations**
- **Sigma.js-powered** network graphs
- **Real-time graph updates** as you type
- **Multiple view modes** (graph, insights, topics)
- **Force-Atlas layout** for optimal node positioning

### 🤖 **AI Integration**
- **Ollama integration** for local AI processing
- **Insight generation** from text structure
- **Research question suggestions**
- **Content gap bridging** recommendations

### 📁 **Import Capabilities**
- **PDF, TXT, MD, CSV** file support
- **Batch processing** of multiple documents
- **Automatic tagging** for imported content

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Docker (for JanusGraph)
- (Optional) Ollama for AI features

### Option 1: Quick Start with JanusGraph

```bash
# Clone and setup
git clone <repository-url>
cd infrasyncus

# Start JanusGraph and the application
./start-with-janusgraph.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

2. **Start JanusGraph (Graph Database)**
```bash
# Using Docker Compose
docker-compose -f docker-compose.janusgraph.yml up -d

# Or manually download and run JanusGraph
# See JANUSGRAPH_SETUP.md for detailed instructions
```

3. **Configure Environment**
Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/infrasyncus"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Zettelkasten
ZETTELKASTEN_PASSWORD="your-zettelkasten-password"

# JanusGraph Configuration
JANUSGRAPH_HOST="localhost"
JANUSGRAPH_PORT="8182"
```

4. **Initialize Database**
```bash
cd backend
npx prisma db push
```

5. **Start the Application**
```bash
# From root directory
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- JanusGraph Gremlin Server: http://localhost:8182

## 📖 Usage Guide

### Text Network Analysis
1. Navigate to **Text Analysis** tab
2. Enter or paste your text
3. Enter the zettelkasten password
4. Click **Analyze Text**
5. Explore the results in different view modes:
   - **Network Graph**: Interactive visualization
   - **Insights**: AI-generated analysis
   - **Topics**: Discovered topic clusters

### Zettelkasten Management
1. Navigate to **Zettelkasten** tab
2. Create atomic notes with content and tags
3. Select notes to view connections
4. Create links between related notes
5. Use AI suggestions for expanding knowledge

### File Import
- Supports .txt, .md, .csv files
- Automatically creates notes from content
- Adds import tags for organization

## 🏗️ Architecture

### Backend (NestJS)
```
backend/
├── src/
│   ├── ai/                 # AI and Zettelkasten modules
│   │   ├── zettelkasten.service.ts  # Core text analysis logic
│   │   ├── zettelkasten.controller.ts
│   │   └── ollama.service.ts        # AI integration
│   ├── auth/               # Authentication
│   ├── janusgraph/        # Graph database integration
│   ├── text-processing/   # Text analysis utilities
│   └── prisma/            # Database management
└── prisma/
    └── schema.prisma      # Database schema
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/
│   │   ├── TextAnalysis.tsx      # InfraNodus-like interface
│   │   ├── Zettelkasten.tsx      # Note management
│   │   ├── GraphVisualization.tsx # Sigma.js integration
│   │   └── Login.tsx             # Authentication
│   └── App.tsx           # Main application
```

## 🧪 Core Algorithms

### Text Network Analysis
Our implementation follows InfraNodus methodology:

1. **Preprocessing**: Stop word removal, lemmatization
2. **N-gram Generation**: 4-gram sliding windows for context retention
3. **Network Building**: Word co-occurrence matrix with distance weighting
4. **Community Detection**: Simplified Louvain algorithm for topic clustering
5. **Gap Analysis**: Structural hole identification between communities
6. **Diversity Calculation**: Shannon entropy of community distribution

### Zettelkasten Features
- **Atomic Notes**: Single-concept notes for maximum reusability
- **Bidirectional Links**: Enable non-hierarchical knowledge structures
- **Emergence**: Discover unexpected connections through graph traversal

## 🎯 Comparison with InfraNodus

| Feature | InfraSyncus | InfraNodus |
|---------|-------------|------------|
| Text Network Analysis | ✅ 4-gram sliding window | ✅ 4-gram sliding window |
| Community Detection | ✅ Simplified Louvain | ✅ Advanced Louvain |
| Content Gap Analysis | ✅ Structural holes | ✅ Structural holes |
| Zettelkasten System | ✅ **Unique Feature** | ❌ Not available |
| AI Integration | ✅ Local (Ollama) | ✅ Cloud (GPT) |
| File Import | ✅ Basic formats | ✅ Extensive formats |
| Graph Visualization | ✅ Sigma.js | ✅ Custom engine |
| Self-hosted | ✅ Fully local | ❌ SaaS only |

## 🛠️ Development

### Adding New Analysis Methods
Extend `zettelkasten.service.ts` with new algorithms:

```typescript
private advancedCommunityDetection(nodes: NetworkNode[], edges: NetworkEdge[]) {
  // Implement advanced algorithms like Leiden or multi-level modularity
}
```

### Enhancing Graph Visualization
Modify `GraphVisualization.tsx` to add new layouts:

```typescript
// Add Force-Atlas 2 or other advanced layouts
const settings = {
  renderEdgeLabels: true,
  defaultEdgeType: 'curve',
  // Add more Sigma.js settings
};
```

### AI Model Integration
Extend `ollama.service.ts` for different models:

```typescript
async generateInsights(text: string, model: string = 'llama2') {
  // Support multiple AI models
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 References

- [InfraNodus Research Paper](https://infranodus.com) - Original methodology
- [Sigma.js Documentation](https://www.sigmajs.org/) - Graph visualization
- [Prisma Documentation](https://www.prisma.io/docs/) - Database ORM
- [NestJS Documentation](https://docs.nestjs.com/) - Backend framework

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- InfraNodus team for the innovative text network analysis methodology
- Sigma.js community for the excellent graph visualization library
- The open-source community for the amazing tools and libraries

---

**Note**: This is an open-source implementation inspired by InfraNodus. For production use, please ensure you have proper environment variables and security configurations.

## 📦 v2.0.0 - Pre-built Releases

### Download Options

The latest v2.0.0 JanusGraph Edition is available as pre-built packages:

#### 🍎 macOS Downloads
- **InfraSyncus-2.0.0-arm64.dmg** - Apple Silicon (M1/M2/M3) Macs
- **InfraSyncus-2.0.0.dmg** - Intel Macs  
- **InfraSyncus-2.0.0-arm64-mac.zip** - Apple Silicon (Portable)
- **InfraSyncus-2.0.0-mac.zip** - Intel Mac (Portable)

#### 🎯 New in v2.0.0
- **JanusGraph Integration** - Advanced graph database capabilities
- **Enhanced Performance** - Better handling of large knowledge graphs
- **Docker Support** - Easy JanusGraph setup with Docker Compose
- **Improved UI** - Better graph visualization and user experience
- **Persistent Graphs** - Knowledge graphs that persist across sessions

#### ⚡ Quick Start with Pre-built App
1. **Download** the appropriate package for your Mac
2. **Install** using the DMG installer or extract the ZIP
3. **Launch** InfraSyncus from Applications
4. **Start analyzing** text immediately!
5. **Optional**: Set up JanusGraph for advanced features

For detailed installation instructions, see `INSTALLATION_GUIDE.md` included with the app.

## Installation Guide

### System Requirements
- macOS 10.13 or later
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space

### Installation Steps

1. **Download the Application**
   - Download the latest version of Infrasyncus from the releases page
   - Choose either the `.dmg` file (recommended for macOS) or the `.zip` file

2. **Installation Methods**

   **Option 1: Using DMG Installer (Recommended)**
   - Double-click the downloaded `.dmg` file
   - Drag the Infrasyncus application to your Applications folder
   - Launch Infrasyncus from your Applications folder

   **Option 2: Using ZIP Archive**
   - Extract the downloaded `.zip` file
   - Move the extracted Infrasyncus application to your Applications folder
   - Launch Infrasyncus from your Applications folder

3. **First Launch**
   - When launching for the first time, you may see a security warning
   - Go to System Preferences > Security & Privacy
   - Click "Open Anyway" to allow Infrasyncus to run

### Configuration

1. **Database Setup**
   - The application will automatically set up the required database on first launch
   - Default database location: `~/infrasyncus/data/`

2. **Environment Configuration**
   - The application comes with default configuration settings
   - Configuration files are located in: `~/infrasyncus/config/`
   - You can modify these settings as needed

### Troubleshooting

1. **Application Won't Launch**
   - Ensure you have the required system permissions
   - Check if the application is blocked in Security & Privacy settings
   - Verify that you have sufficient disk space

2. **Database Connection Issues**
   - Ensure the database directory exists and has proper permissions
   - Check if the database service is running
   - Verify the database configuration in the config files

3. **Performance Issues**
   - Close other resource-intensive applications
   - Ensure you have sufficient RAM available
   - Check system resource usage in Activity Monitor

### Support

For additional support or to report issues:
- Create an issue on our GitHub repository
- Contact our support team at support@infrasyncus.com

### Updates

The application will automatically check for updates when launched. To manually check for updates:
1. Click on the Infrasyncus menu
2. Select "Check for Updates"

### Uninstallation

To uninstall Infrasyncus:
1. Move the application to the Trash
2. Delete the following directories:
   - `~/infrasyncus/`
   - `~/Library/Application Support/Infrasyncus/`
3. Empty the Trash

## License

This software is licensed under the MIT License. See the LICENSE file for details. 