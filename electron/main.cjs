const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function getIconPath() {
  if (isDev) {
    return path.join(__dirname, "../icon.png");
  }
  return path.join(process.resourcesPath, "icon.png");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 580,
    height: 240,
    minWidth: 400,
    minHeight: 200,
    resizable: true,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: "#121417",
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for window controls
ipcMain.handle("set-always-on-top", (event, enabled) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(enabled);
    return true;
  }
  return false;
});

ipcMain.handle("set-decorations", (event, enabled) => {
  // Electron doesn't support toggling frame at runtime easily
  // We can simulate by recreating window or just ignore
  // For now, we'll skip this as Electron doesn't support it dynamically
  return true;
});

ipcMain.handle("get-window-size", () => {
  if (mainWindow) {
    const [width, height] = mainWindow.getSize();
    return { width, height };
  }
  return { width: 520, height: 240 };
});

ipcMain.handle("set-window-size", (event, width, height) => {
  if (mainWindow) {
    mainWindow.setSize(Math.round(width), Math.round(height));
    return true;
  }
  return false;
});

ipcMain.handle("set-min-size", (event, width, height) => {
  if (mainWindow) {
    mainWindow.setMinimumSize(Math.round(width), Math.round(height));
    return true;
  }
  return false;
});

ipcMain.handle("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
