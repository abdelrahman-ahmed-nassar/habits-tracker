const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Menu navigation handlers
  onMenuNavigate: (callback) => ipcRenderer.on("menu-navigate", callback),
  onMenuNewHabit: (callback) => ipcRenderer.on("menu-new-habit", callback),
  onMenuExportData: (callback) => ipcRenderer.on("menu-export-data", callback),
  onMenuImportData: (callback) => ipcRenderer.on("menu-import-data", callback),

  // Platform info
  platform: process.platform,

  // App info
  getVersion: () => ipcRenderer.invoke("app-version"),

  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
