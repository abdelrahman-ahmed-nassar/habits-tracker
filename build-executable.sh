#!/bin/bash

# Habits Tracker Build Script

echo "==================================================="
echo "        BUILDING HABITS TRACKER EXECUTABLE"
echo "==================================================="

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

echo "Building Habits Tracker executable..."
node "$SCRIPT_DIR/build-app.js"

echo ""
echo "Build process completed."
read -p "Press Enter to continue..."
