const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const {
  indexDirectory,
  queryDB,
  initDB,
  clearDB,
  reindexFile,
  printAllDocuments,
  deleteIndicesForFile,
  renameIndicesForFile,
} = require("./appDB.cjs");
const log = require("electron-log");
const {
  GET_SETTINGS_FILE,
  NOTE_DIR_FILE,
  SET_SETTINGS_FILE,
  GET_APP_DIR,
} = require("./settings.cjs");
const mode = process.env.NODE_ENV;
let mainWindow;
log.initialize({ preload: true });
log.errorHandler.startCatching();
const preloadURL = path.join(__dirname, "preload.js");
log.log("PRELOAD URL", preloadURL, __dirname);

async function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: preloadURL,
    },
    width: 1300,
    height: 850,
  });
  await initDB();
  log.log("mode", mode);
  const url =
    mode !== "development"
      ? // in production, use the statically build version of our application
        `file://${path.join(__dirname, "build/index.html")}`
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
    const textFilesAndFolders = files.filter((fileName) => {
      const filePath = `${path}/${fileName}`;
      if (fileName.startsWith(".")) return false;
      let extension = fileName.split(".").pop();
      const stats = fs.statSync(filePath);
      const isDir = stats.isDirectory();
      if (extension === "txt" || extension === "md" || isDir) return true;
    });
    const filesWithMetadata = textFilesAndFolders.map((fileName) => {
      const filePath = `${path}/${fileName}`;
      const stats = fs.statSync(filePath);
      const isDir = stats.isDirectory();
      const fileNameWithoutExtension = fileName.split(".")[0];
      const dateTitle = new Date(fileNameWithoutExtension);
      return {
        name: fileName,
        path: filePath,
        createdTime: isNaN(dateTitle) ? stats.birthtime : dateTitle,
        modifiedTime: stats.mtime,
        isDir,
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

  ipcMain.handle("new-directory", async (event, path) => {
    fs.mkdirSync(path);
  });

  ipcMain.handle("delete-file", async (event, path) => {
    await deleteIndicesForFile(path);
    fs.unlinkSync(path);
  });

  // recursively delete all files in a folder
  ipcMain.handle("delete-directory", async (event, path) => {
    // fetch all folders beneath folder recursively, so we can remove their indices
    const allFiles = [];
    const fetchFilesFromDirectory = (path) => {
      const files = fs.readdirSync(path);
      files.forEach((file) => {
        const filePath = path + "/" + file;
        const stats = fs.statSync(path + "/" + file);
        console.log(filePath, stats.isDirectory());
        if (stats.isDirectory()) fetchFilesFromDirectory(filePath);
        else allFiles.push(filePath);
      });
    };

    fetchFilesFromDirectory(path);
    console.log(allFiles);
    await Promise.all(
      allFiles.map((file) => {
        deleteIndicesForFile(file);
      })
    );
    // delete the directory recursively on the filesystem
    fs.rmSync(path, { recursive: true, force: true });
  });

  ipcMain.handle("rename-file", async (event, path, newName) => {
    const pathArr = path.split("/");
    const extension = path.split(".")?.pop() || "txt";
    pathArr.pop();
    const newPath = pathArr.join("/") + "/" + newName + "." + extension;
    await renameIndicesForFile(path, newPath);
    fs.renameSync(path, newPath);
    return newPath;
  });
  ipcMain.handle("rename-directory", async (event, path, newName) => {
    // fetch all folders beneath folder recursively, so we can remove their indices
    const allFiles = [];
    const fetchFilesFromDirectory = (path) => {
      const files = fs.readdirSync(path);
      files.forEach((file) => {
        const filePath = path + "/" + file;
        const stats = fs.statSync(path + "/" + file);
        console.log(filePath, stats.isDirectory());
        if (stats.isDirectory()) fetchFilesFromDirectory(filePath);
        else allFiles.push(filePath);
      });
    };

    fetchFilesFromDirectory(path);
    console.log(allFiles);
    const pathArr = path.split("/");
    pathArr.pop();
    const newFolderPath = pathArr.join("/") + "/" + newName;
    await Promise.all(
      allFiles.map((file) => {
        const newFilePath = file.replace(path, newFolderPath);
        renameIndicesForFile(file, newFilePath);
      })
    );
    // rename the directory on the filesystem
    fs.renameSync(path, newFolderPath);
    return newFolderPath;
  });

  ipcMain.handle("index-directory", async (event, path) => {
    await indexDirectory(path);
  });
  ipcMain.handle(
    "reindex-file",
    async (event, path, deletedContent, newContent) => {
      await reindexFile(path, deletedContent, newContent);
    }
  );
  ipcMain.handle("vector-query", async (event, query, threshold) => {
    return await queryDB(query, threshold);
  });
  ipcMain.handle("clear-db", async (event) => {
    return await clearDB();
  });
  ipcMain.handle("finder-dir", async (event, path) => {
    shell.showItemInFolder(path);
  });
  ipcMain.handle("get-note-dir", (event) => {
    return GET_SETTINGS_FILE(NOTE_DIR_FILE);
  });
  ipcMain.handle("set-note-dir", async (event, path) => {
    SET_SETTINGS_FILE(NOTE_DIR_FILE, path);
    await initDB();
  });
  ipcMain.handle("get-app-dir", (event) => {
    return GET_APP_DIR();
  }),
    ipcMain.handle("debug-print-all", (event) => {
      printAllDocuments();
    });

  ipcMain.handle("open-personal-site", (event, url) => {
    shell.openExternal("https://nicholaschen.io");
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
