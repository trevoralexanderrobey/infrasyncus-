# 🤖 AI Setup Guide for InfraSyncus v2.0.0

## 🎯 **Recommended Models for 8GB RAM Systems**

InfraSyncus supports advanced AI features including code analysis and multimodal image processing. Here's how to set up the optimal models for your system.

### **📊 Memory Requirements Overview**

| Model | Type | RAM Usage | Features | Speed | Recommended For |
|-------|------|-----------|----------|--------|-----------------|
| `llava:7b` | Multimodal | 4.1GB | Text + Images, OCR, Diagrams | Medium | **BEST OVERALL** |
| `codellama:7b` | Code | 4.1GB | Programming Analysis | Fast | Code-heavy workflows |
| `bakllava` | Multimodal | 4.1GB | Lightweight Vision | Fast | Quick image analysis |
| `moondream:1.8b` | Multimodal | 1.7GB | Ultra-fast Vision | Very Fast | Resource-constrained |

## 🚀 **Quick Setup (Recommended)**

### **Step 1: Install Ollama**
```bash
# macOS (via Homebrew)
brew install ollama

# macOS (direct download)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### **Step 2: Install Recommended Models**

**🎯 For Best Experience (Multimodal + Code):**
```bash
# Install LLaVA for multimodal analysis (images + text)
ollama pull llava:7b

# Install CodeLlama for programming analysis  
ollama pull codellama:7b
```

**⚡ For Speed-Optimized Setup:**
```bash
# Ultra-fast multimodal model
ollama pull moondream:1.8b

# Keep CodeLlama for code analysis
ollama pull codellama:7b
```

**💾 For Memory-Constrained Systems:**
```bash
# Start with tiny multimodal model
ollama pull moondream:1.8b
# Add BakLLaVA if you have more RAM later
ollama pull bakllava
```

### **Step 3: Verify Installation**
```bash
# Check installed models
ollama list

# Test text generation
ollama run codellama:7b "Explain recursion in programming"

# Test multimodal (if image file available)
ollama run llava:7b "Describe this image" --image-file screenshot.png
```

## 🎨 **Multimodal Capabilities**

### **What You Can Analyze:**
- **📸 Screenshots** - Extract code from images, analyze UI designs
- **📊 Diagrams** - Understand flowcharts, architecture diagrams  
- **📝 Documents** - OCR text from scanned papers, whiteboards
- **🖼️ Concept Maps** - Extract knowledge structures from visual notes
- **💻 Code Screenshots** - Analyze code from Stack Overflow, tutorials

### **Example Use Cases:**
```typescript
// Analyze a code screenshot
POST /api/zettelkasten/ai/analyze-image
{
  "imageBase64": "data:image/png;base64,iVBOR...",
  "query": "Extract programming concepts from this code",
  "password": "demo-password"
}

// Analyze a concept diagram  
POST /api/zettelkasten/ai/analyze-image
{
  "imageBase64": "data:image/png;base64,iVBOR...",
  "query": "What concepts and relationships are shown?",
  "password": "demo-password"
}
```

## 🧠 **Enhanced Features Available**

### **🔍 Knowledge Discovery**
- **Concept Clustering** - Auto-group related ideas
- **Knowledge Paths** - Find connections between concepts
- **Centrality Analysis** - Identify your most important concepts
- **Gap Detection** - Discover missing connections

### **🤖 AI-Powered Analysis**
- **Code Analysis** - Extract programming concepts with CodeLlama
- **Image Understanding** - Analyze visual content with LLaVA
- **Concept Suggestions** - AI recommends related topics
- **Knowledge Insights** - AI analyzes your learning patterns

### **📊 Advanced Visualization**
- **Enhanced Graph View** - Concepts sized by importance
- **Cluster Highlighting** - Visual topic groupings  
- **Temporal Evolution** - See how knowledge grows over time
- **Similarity Networks** - Find conceptually similar ideas

## ⚙️ **Configuration Options**

### **Environment Variables**
```bash
# In your terminal or .env file
export OLLAMA_HOST="http://localhost:11434"
export ZETTELKASTEN_PASSWORD="your-password"
```

### **Model Selection in App**
InfraSyncus automatically detects available models and uses:
- **Best multimodal model** for image analysis
- **CodeLlama** for code analysis  
- **Fallback responses** when models unavailable

## 🔧 **Troubleshooting**

### **Common Issues:**

**🚨 "No multimodal model available"**
```bash
# Install a multimodal model
ollama pull llava:7b
# Or for faster option
ollama pull moondream:1.8b
```

**🚨 "Ollama not available"**  
```bash
# Start Ollama service
ollama serve
# Check if running
curl http://localhost:11434/api/tags
```

**🚨 "Out of memory errors"**
```bash
# Use smaller models
ollama pull moondream:1.8b
# Remove large models
ollama rm llava:13b
```

**🚨 "Slow performance"**
- Use `moondream:1.8b` for speed
- Close other memory-intensive apps
- Ensure Ollama is running locally (not remote)

### **Performance Tips:**
1. **Start with small models** - `moondream:1.8b` is very capable
2. **One model at a time** - Don't load multiple large models
3. **Local storage** - Keep models on fast SSD storage
4. **Background processing** - Let models warm up before heavy use

## 🌟 **Advanced Usage**

### **API Endpoints Available:**
```typescript
// Model management
GET /api/zettelkasten/ai/models
GET /api/zettelkasten/ai/models/recommended

// Analysis endpoints  
POST /api/zettelkasten/ai/analyze-code
POST /api/zettelkasten/ai/analyze-image
POST /api/zettelkasten/ai/analyze-text-enhanced

// Knowledge discovery
GET /api/zettelkasten/garden/clusters
GET /api/zettelkasten/garden/centrality  
GET /api/zettelkasten/garden/gaps
POST /api/zettelkasten/ai/suggest-concepts
```

### **Integration Tips:**
- **Incremental Analysis** - Use `analyze-incremental` to build knowledge over time
- **Domain Specification** - Provide domain context for better suggestions
- **Batch Processing** - Analyze multiple texts to build rich networks
- **Cross-Modal** - Combine text, code, and image analysis for complete understanding

## 📈 **Next Steps**

1. **Start Simple** - Install `moondream:1.8b` and experiment
2. **Add CodeLlama** - For programming-related content
3. **Upgrade to LLaVA** - When you want superior image understanding
4. **Explore APIs** - Try different analysis endpoints
5. **Build Knowledge** - Let the AI help discover patterns in your learning

---

**🎯 Perfect Setup for Most Users:**
```bash
ollama pull llava:7b        # 4.1GB - Excellent multimodal
ollama pull codellama:7b    # 4.1GB - Great for code
# Total: ~8.2GB when both loaded (only one active at a time)
```

This gives you the **best of both worlds** - powerful multimodal analysis and excellent code understanding, while staying within your 16GB system limits! 🚀 