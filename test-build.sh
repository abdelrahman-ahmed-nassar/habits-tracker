#!/bin/bash

echo "🧪 Testing Habits Tracker Electron Build..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the habits-tracker root directory"
    exit 1
fi

echo "📦 Building backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

echo "🎨 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "⚡ Preparing Electron..."
npm run prepare:electron
if [ $? -ne 0 ]; then
    echo "❌ Electron preparation failed"
    exit 1
fi

echo "📱 Testing Electron packaging..."
npm run electron:pack
if [ $? -ne 0 ]; then
    echo "❌ Electron packaging failed"
    exit 1
fi

echo "✅ All builds completed successfully!"
echo ""
echo "📁 Build outputs:"
echo "   - Backend: backend/dist/"
echo "   - Frontend: frontend/dist/"
echo "   - Electron: frontend/electron-dist/"
echo ""
echo "🚀 To run in development mode: npm run dev"
echo "📦 To create installer: cd frontend && npm run electron:dist"
