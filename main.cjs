const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("node:fs/promises");
const { indexDirectory, queryDB, initDB } = require("./appDB.cjs");
const log = require("electron-log");
const mode = process.env.NODE_ENV;
let mainWindow;

log.initialize({ preload: true });
log.errorHandler.startCatching();

async function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    width: 900,
    height: 680,
  });
  await initDB();
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

  ipcMain.handle("read-dir", async (event, path) => {
    const files = await fs.readdir(path);
    return files;
  });

  ipcMain.handle("read-file", async (event, path) => {
    const file = await fs.readFile(path, "utf-8");
    return file;
  });

  ipcMain.handle("write-file", async (event, path, content) => {
    await fs.writeFile(path, content);
  });

  ipcMain.handle("index-directory", async (event, path) => {
    await indexDirectory(path);
  });
  ipcMain.handle("vector-query", async (event, query) => {
    return await queryDB(query);
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
