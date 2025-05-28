const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");

let mainWindow;
let backendProcess;

// Better development mode detection
const isDev =
  process.env.ELECTRON_ENV !== "production" &&
  (process.env.NODE_ENV === "development" ||
    !app.isPackaged ||
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath));

console.log("Development mode:", isDev);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("ELECTRON_ENV:", process.env.ELECTRON_ENV);
console.log("app.isPackaged:", app.isPackaged);

// Configure autoUpdater for production
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/icon.png"), // We'll add this later
    show: false, // Don't show until ready
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });
  // Load the app
  const startUrl = isDev
    ? "http://localhost:5173" // Vite dev server
    : `file://${path.join(__dirname, "../dist/index.html")}`;

  console.log("Loading URL:", startUrl);
  console.log("__dirname:", __dirname);

  // Check if dist/index.html exists in production mode
  if (!isDev) {
    const indexPath = path.join(__dirname, "../dist/index.html");
    console.log("Checking for index.html at:", indexPath);
    console.log("File exists:", fs.existsSync(indexPath));
  }

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function startBackend() {
  if (isDev) {
    // In development, assume backend is running separately
    console.log(
      "Development mode: Backend should be running separately on port 5002"
    );
    return;
  }

  // In production, start the bundled backend
  let backendPath;

  if (app.isPackaged) {
    // When properly packaged with electron-builder
    backendPath = path.join(
      process.resourcesPath,
      "backend",
      "backend",
      "src",
      "index.js"
    );
  } else {
    // When running manually (not from development mode)
    backendPath = path.join(
      __dirname,
      "../../backend/dist/backend/src/index.js"
    );
  }

  try {
    console.log("Starting backend from:", backendPath);

    // Make sure the path exists
    if (!fs.existsSync(backendPath)) {
      console.error(`Backend path does not exist: ${backendPath}`);

      // Try to find the backend
      const possibleLocations = [
        path.join(
          process.resourcesPath,
          "backend",
          "backend",
          "src",
          "index.js"
        ),
        path.join(process.resourcesPath, "backend", "index.js"),
        path.join(__dirname, "../../backend/dist/backend/src/index.js"),
      ];

      for (const loc of possibleLocations) {
        if (fs.existsSync(loc)) {
          console.log(`Found backend at alternative location: ${loc}`);
          backendPath = loc;
          break;
        }
      }

      if (!fs.existsSync(backendPath)) {
        dialog.showErrorBox(
          "Backend Error",
          "Could not find the backend server files."
        );
        app.quit();
        return;
      }
    }

    backendProcess = spawn("node", [backendPath], {
      cwd: path.dirname(backendPath),
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: "5002",
      },
    });

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on("close", (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

    backendProcess.on("error", (error) => {
      console.error("Failed to start backend:", error);
      dialog.showErrorBox(
        "Backend Error",
        "Failed to start the application backend."
      );
    });
  } catch (error) {
    console.error("Error starting backend:", error);
  }
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Habit",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-new-habit");
          },
        },
        { type: "separator" },
        {
          label: "Export Data",
          click: () => {
            mainWindow.webContents.send("menu-export-data");
          },
        },
        {
          label: "Import Data",
          click: () => {
            mainWindow.webContents.send("menu-import-data");
          },
        },
        { type: "separator" },
        {
          role: "quit",
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        {
          label: "Daily View",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            mainWindow.webContents.send("menu-navigate", "daily");
          },
        },
        {
          label: "Weekly View",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            mainWindow.webContents.send("menu-navigate", "weekly");
          },
        },
        {
          label: "Monthly View",
          accelerator: "CmdOrCtrl+3",
          click: () => {
            mainWindow.webContents.send("menu-navigate", "monthly");
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow.webContents.send("menu-navigate", "settings");
          },
        },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About Habits Tracker",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Habits Tracker",
              message: "Habits Tracker",
              detail:
                "A personal habit tracking application built with Electron and React.",
            });
          },
        },
        {
          label: "Learn More",
          click: () => {
            shell.openExternal("https://github.com/your-repo/habits-tracker");
          },
        },
      ],
    },
  ];

  // macOS specific adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });

    // Window menu
    template[5].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  startBackend();
  createWindow();
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Make sure the backend is properly terminated
app.on("before-quit", () => {
  console.log("Application quitting, cleaning up resources...");
  if (backendProcess) {
    console.log("Terminating backend server...");
    try {
      backendProcess.kill();
      console.log("Backend server terminated successfully");
    } catch (error) {
      console.error("Error terminating backend:", error);
    }
  }
});

// Ensure the backend is always terminated, even in case of crashes
app.on("will-quit", () => {
  if (backendProcess && !backendProcess.killed) {
    try {
      backendProcess.kill("SIGKILL");
    } catch (error) {
      // Last resort, just log the error
      console.error("Error force-killing backend:", error);
    }
  }
});

// Auto-updater events
if (!isDev) {
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available.");
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("Update not available.");
  });

  autoUpdater.on("error", (err) => {
    console.log("Error in auto-updater. " + err);
  });

  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    console.log(log_message);
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded");
    autoUpdater.quitAndInstall();
  });
}
