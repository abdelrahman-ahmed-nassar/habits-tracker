How to Convert Your React App Into a Desktop App
Vipin Singh Inkiya
Vipin Singh Inkiya
4 min read
·
Oct 6, 2024
--


3



Press enter or click to view image in full size

If you’ve built a React web app and want to take it to the next level by making it available on desktop platforms, you’re in the right place! This guide will help you transform your React application into a desktop app using Electron, the most popular framework for building cross-platform desktop applications with JavaScript, HTML, and CSS.

By following these steps, you’ll unlock new possibilities for your app, delivering a better user experience and making it accessible beyond the browser.

Why Convert Your React App to a Desktop App?
Before diving into the technical details, let’s explore why you might want to convert your React app into a desktop app:

Offline Access: A desktop app can work offline, providing users uninterrupted access to your application without an internet connection.
System Integration: Desktop apps can integrate more deeply with the operating system (file systems, notifications, and hardware access).
User Experience: Desktop apps offer a different experience than browser-based apps, such as customized window controls and context menus.
Monetization: Desktop apps can be distributed through platforms like the Windows Store or the Mac App Store.
Step 1: Setting Up Electron
To convert your React app to a desktop app, we will use Electron. Electron combines Chromium and Node.js to build desktop apps with JavaScript. Essentially, it’s like wrapping your React app in a web browser but delivering it as a desktop app.

Install Electron in Your React Project
First, start by installing Electron:

npm install electron --save-dev
Step 2: Create main.js
Next, create a main.js file in the root of your project. This file will control the main process of your desktop app.

const { app, BrowserWindow } = require('electron');
const path = require('path');
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL('http://localhost:3000'); // Load your React app
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
Here’s a quick breakdown of what’s happening in main.js:

We create a new browser window with BrowserWindow.
We load our React app (running on localhost:3000).
We handle the window-all-closed event to quit the app when all windows are closed.
Step 3: Update package.json
Add Electron as the start script for the desktop version. In package.json, add this to your scripts section:

"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "electron": "electron ."
}
Now you can run:

npm run electron
This will start Electron and load your React app in a desktop window. 🎉

Step 4: Build Your React App for Production
Once you’ve confirmed everything works, it’s time to build the React app. Run:

npm run build
This will bundle your React app into static files, which you can load into Electron.

Step 5: Load Your Built React App in Electron
Update your main.js file to load the production build instead of localhost:3000. Replace:

mainWindow.loadURL('http://localhost:3000');
With:

mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
Step 6: Package Your App
To package your desktop app, you can use Electron Builder, which simplifies the process of creating installers for your app.

Install Electron Builder:

npm install electron-builder --save-dev
Update your package.json to include a build section:

"build": {
  "appId": "com.example.react-desktop",
  "productName": "React Desktop App",
  "directories": {
    "output": "dist"
  },
  "files": [
    "build/**/*",
    "main.js"
  ],
  "mac": {
    "category": "public.app-category.utilities"
  },
  "win": {
    "target": "nsis"
  }
}
Now you can package your app by running:

npm run electron:build
This command will create a packaged app in the dist folder, ready to be distributed!

Bonus: Engaging With System APIs
One of the coolest things about turning your React app into a desktop app is the ability to engage with system APIs. For example, you can display native notifications, interact with the file system, or even create system tray icons.

Here’s a quick example of how to show a native notification:

const { Notification } = require('electron');
function showNotification() {
  const notification = {
    title: 'React Desktop App',
    body: 'Your desktop app is running successfully!',
  };
  new Notification(notification).show();
}
app.on('ready', showNotification);
Now, when your app starts, it’ll show a native notification to the user. Imagine the possibilities!

Wrapping Up
Converting your React app into a desktop app opens up a world of new opportunities. With Electron, you can deliver a powerful, cross-platform desktop experience without needing to rebuild your entire app. Now you’ve got a fully functional desktop app from your React project — go out there and make something awesome!

The Road Ahead
You can dive deeper into Electron’s documentation to unlock even more features, such as system tray icons, advanced file handling, and deep OS integration. The journey doesn’t end here!

Happy coding, and welcome to the world of desktop development!