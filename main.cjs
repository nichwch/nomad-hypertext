const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("path");
const Store = require("electron-store");
const store = require("./store.cjs");

const mode = process.env.NODE_ENV;
let mainWindow;

function createWindow() {
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
    console.dir(key, { depth: null });
    console.log(value);
    console.log(`setting ${key} to ${value}`);
    //@ts-ignore
    return store.set(key, value);
  });

  ipcMain.handle("get-files", async (event, dir) => {
    const files = await fs.readdir(dir);
    console.log({ files });
    return files;
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
