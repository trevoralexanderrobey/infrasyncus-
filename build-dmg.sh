#!/bin/bash

echo "🏗️  Building InfraSyncus v2.0.0 - JanusGraph Edition"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "🔧 Installing dependencies..."
npm run install-all

echo "🏗️  Building frontend and backend..."
npm run build

echo "📦 Creating distribution packages..."

# Build for both Intel and Apple Silicon Macs
echo "🍎 Building for macOS (Intel and Apple Silicon)..."
npm run dist:mac

echo "✅ Build completed!"
echo ""
echo "📦 Distribution files created in ./dist-electron/"
echo "📁 Available packages:"
echo "   • InfraSyncus-2.0.0.dmg (Intel Mac)"
echo "   • InfraSyncus-2.0.0-arm64.dmg (Apple Silicon Mac)"
echo "   • InfraSyncus-2.0.0-mac.zip (Intel Mac - Portable)"
echo "   • InfraSyncus-2.0.0-arm64-mac.zip (Apple Silicon Mac - Portable)"
echo ""
echo "🚀 Features in v2.0.0:"
echo "   • JanusGraph graph database integration"
echo "   • Enhanced text network analysis"
echo "   • Improved knowledge graph capabilities"
echo "   • Docker-based JanusGraph setup"
echo "   • Advanced graph visualization"
echo ""
echo "📋 Installation Notes:"
echo "   • Users should install Docker for full JanusGraph features"
echo "   • Application works without JanusGraph (graceful fallback)"
echo "   • Help menu includes JanusGraph setup guide"
echo ""
echo "🎉 Ready for distribution!" 