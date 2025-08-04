#!/bin/bash

# Vercel build script for obfuscated React app
echo "🔧 Starting obfuscated build process..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application with obfuscation
echo "🔨 Building obfuscated application..."
npm run build

# Verify build output
if [ -d "build" ]; then
    echo "✅ Build successful! Output directory created."
    echo "📊 Build size:"
    du -sh build/
else
    echo "❌ Build failed! No output directory found."
    exit 1
fi

echo "🚀 Ready for deployment!"
