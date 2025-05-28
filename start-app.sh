#!/bin/bash

# Habits Tracker Startup Script

echo "==================================================="
echo "         STARTING HABITS TRACKER APPLICATION"
echo "==================================================="
echo "This window will remain open while the application is running."
echo "Please do not close this window until you're done using the application."
echo ""

# Get directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in your PATH."
    echo "Please install Node.js from https://nodejs.org/"
    read -p "Press Enter to continue..."
    exit 1
fi

# Check if running in development or production mode
if [ -f "frontend/dist/index.html" ]; then
    echo "Running in production mode..."
    
    # Check if backend is already running
    if netstat -an | grep -q ":5002 "; then
        echo "Port 5002 is already in use. The backend may already be running."
        echo "If the app doesn't work, please close other applications using port 5002."
    fi
    
    echo "Starting Electron app from production build..."
    pushd "$SCRIPT_DIR/frontend"
    electron .
    popd
else
    echo "Running in development mode..."
    echo "(No production build found, starting in development mode)"
    echo ""
    node "$SCRIPT_DIR/dev-electron.js"
fi

echo ""
echo "Application closed. You can now close this window."
read -p "Press Enter to continue..."
