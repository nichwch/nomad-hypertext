// src/electron.js

const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

const mode = process.env.NODE_ENV;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 900,
    height: 680,
  });

  const url =
    mode === "production"
      ? // in production, use the statically build version of our application
        `file://${path.join(__dirname, "../public/index.html")}`
      : // in dev, target the host and port of the local rollup web server
        "http://localhost:5173";
  mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("set-note-directory", () => {
    dialog.showOpenDialog({ properties: ["openDirectory", "multiSelections"] });
  });
}

app.on("ready", createWindow);

// those two events completely optional to subscrbe to, but that's a common way to get the
// user experience people expect to have on macOS: do not quit the application directly
// after the user close the last window, instead wait for Command + Q (or equivalent).
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
