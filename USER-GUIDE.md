# Habits Tracker - User Guide

## Table of Contents
1. [Installation](#installation)
2. [Starting the Application](#starting-the-application)
3. [Updating the Application](#updating-the-application)
4. [Troubleshooting](#troubleshooting)
5. [Features](#features)

## Installation

### Method 1: Using the Installer (Recommended)
1. Download the latest release installer (`HabitsTracker-Setup-x.x.x.exe`) from the releases page.
2. Double-click the installer and follow the on-screen instructions.
3. After installation, you can launch the app from your desktop shortcut or start menu.

### Method 2: Using the Portable Version
1. Download the latest portable zip file (`habits-tracker-win-portable.zip`) from the releases page.
2. Extract the zip file to any location on your computer.
3. Inside the extracted folder, double-click `HabitsTracker.exe` to start the application.

## Starting the Application

### From the Installer Version
- Double-click the desktop shortcut or find "Habits Tracker" in your start menu.
- The application will automatically start both the frontend and backend components.

### From the Source Code
If you're working with the source code version of the application, you have several ways to start it:

1. **Easy Method**: Double-click `Start Habits Tracker.bat` in the project root directory.

2. **Development Mode**: Double-click `Start Development.bat` to start in development mode with hot-reloading.

3. **Manual Method**: Run the following commands in a terminal:
   ```bash
   cd /path/to/habits-tracker
   npm run dev
   ```

## Updating the Application

### Installer Version
The application will automatically check for updates when it starts. If an update is available, you'll be prompted to install it.

### Source Code Version
To update the source code version:

1. Double-click `Update App.bat` in the project root directory.
   - This will rebuild the application with your latest code changes.

2. Alternatively, run these commands in a terminal:
   ```bash
   cd /path/to/habits-tracker
   npm run build
   ```

## Creating a Standalone Executable

If you want to create your own standalone executable (.exe) file:

1. Double-click `Build Executable.bat` in the project root directory.
   - This will build both the backend and frontend, and package them into a standalone executable.
   - The process may take several minutes to complete.

2. After the build completes, you'll find the executable in:
   ```
   frontend/electron-build/HabitsTracker-Setup-x.x.x.exe
   ```

3. The standalone executable includes both the frontend and backend, so users only need to run one file to use the complete application.

## Troubleshooting

### Common Issues

#### Application Won't Start
1. **Port Conflict**: The backend runs on port 5002. If another application is using this port, the Habits Tracker won't start properly.
   - Solution: Close other applications that might use port 5002, or modify the port in the source code.

2. **Missing Dependencies**: If you're running from source code, you might be missing dependencies.
   - Solution: Run `npm run install:all` from the project root directory.

#### Data Not Saving
1. Ensure you have write permissions to the application's data directory.
2. Check that your disk has sufficient free space.

#### Slow Performance
1. The application stores data locally. If you have a very large dataset, consider backing up and clearing old data.

## Features

### Daily Habits Tracking
- Track your daily habits with simple checkmarks
- Set streaks and goals

### Notes and Journal
- Keep daily notes alongside your habit tracking
- Record mood and productivity levels

### Analytics and Insights
- View trends and analytics about your habits
- Track your progress over time

### Backup and Restore
- Backup your data regularly
- Restore from previous backups if needed

### Customization
- Customize habit categories and tags
- Adjust application settings to your preferences

---

For more detailed information and developer documentation, please refer to the README.md and ELECTRON-SETUP.md files.