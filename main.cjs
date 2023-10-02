const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { indexDirectory, queryDB, initDB, clearDB } = require("./appDB.cjs");
const log = require("electron-log");
const mode = process.env.NODE_ENV;
let mainWindow;
log.initialize({ preload: true });
log.errorHandler.startCatching();
const preloadURL = path.join(__dirname, "preload.js");

async function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: preloadURL,
    },
    width: 900,
    height: 680,
  });
  await initDB();
  log.log("mode", mode);
  const url =
    mode !== "development"
      ? // in production, use the statically build version of our application
        `file://${path.join(__dirname, "build")}`
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
    log.log("opening file picker", canceled, filePaths);
    if (!canceled) {
      return filePaths[0];
    }
  });

  ipcMain.handle("read-dir", async (event, path, descending = false) => {
    const files = await fs.promises.readdir(path);
    const filesWithMetadata = files.map((fileName) => {
      const filePath = `${path}/${fileName}`;
      const stats = fs.statSync(filePath);
      return {
        name: fileName,
        path: filePath,
        createdTime: stats.birthtime,
        modifiedTime: stats.mtime,
      };
    });
    const sortedFiles = filesWithMetadata.sort((a, b) => {
      if (descending) return b.createdTime.getTime() - a.createdTime.getTime();
      return a.createdTime.getTime() - b.createdTime.getTime();
    });
    return sortedFiles;
  });

  ipcMain.handle("read-file", async (event, path) => {
    const file = await fs.promises.readFile(path, "utf-8");
    return file;
  });

  ipcMain.handle("write-file", async (event, path, content) => {
    await fs.promises.writeFile(path, content);
  });

  // this creates a new file with the date as the default tile
  ipcMain.handle("new-file", async (event, path) => {
    const dateString = new Date().toDateString();
    let dateStringPath = `${path}/${dateString}.txt`;
    let numRepeats = 0;
    if (!fs.existsSync(dateStringPath)) {
      return await fs.promises.writeFile(dateStringPath, "");
    } else {
      while (fs.existsSync(dateStringPath)) {
        numRepeats++;
        dateStringPath = `${path}/${dateString}-${numRepeats + 1}.txt`;
      }
      return await fs.promises.writeFile(dateStringPath, "");
    }
  });

  ipcMain.handle("index-directory", async (event, path) => {
    await indexDirectory(path);
  });
  ipcMain.handle("vector-query", async (event, query) => {
    return await queryDB(query);
  });
  ipcMain.handle("clear-db", async (event) => {
    return await clearDB();
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
