const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const Store = require("electron-store");
const path = require("path");
const mode = process.env.NODE_ENV;
let mainWindow;

async function createWindow() {
  const { default: store } = await import("./store.js");
  Store.initRenderer();
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

  ipcMain.handle("open-directory-picker", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory", "multiSelections"],
    });
    if (!canceled) {
      return filePaths[0];
    }
  });

  ipcMain.handle("getStoreValue", (event, key) => {
    //@ts-ignore
    const val = store.get(key);
    console.log(`getting ${key}: ${val}`);
    return val;
  });

  ipcMain.handle("setStoreValue", (event, key, value) => {
    console.log(`setting ${key} to ${value}`);
    //@ts-ignore
    // return store.set(key, value);
    store.set("notesDir", "test succeeded");
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
  //@ts-ignore
  if (mainWindow === null) createWindow();
});
