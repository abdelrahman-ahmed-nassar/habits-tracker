#!/bin/bash

# Habits Tracker Development Script

echo "==================================================="
echo "   STARTING HABITS TRACKER IN DEVELOPMENT MODE"
echo "==================================================="
echo "This mode provides hot-reloading for both frontend and backend."
echo "Perfect for development and testing changes."
echo ""
echo "This window will remain open while the app is running."
echo "Please DO NOT close this window until you're done coding."
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

echo "Starting development environment..."
echo ""

# Kill any processes that might be using our ports
echo "Checking for processes using port 5002..."
if command -v lsof &> /dev/null; then
    lsof -ti:5002 | xargs kill -9 2>/dev/null
elif command -v netstat &> /dev/null; then
    # For Windows subsystem for Linux or when lsof is not available
    for pid in $(netstat -ano | grep ":5002" | awk '{print $5}'); do
        if [ "$pid" != "0" ]; then
            echo "Terminating process $pid using port 5002"
            kill -9 $pid 2>/dev/null
        fi
    done
fi

# Start the development environment
node "$SCRIPT_DIR/dev-electron.js"

echo ""
echo "Development session ended."
echo "You can now close this window."
read -p "Press Enter to continue..."
