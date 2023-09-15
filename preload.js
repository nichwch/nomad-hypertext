const { contextBridge, ipcRenderer } = require("electron");
const log = require("electron-log");
contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  readDir: (path) => ipcRenderer.invoke("read-dir", path),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (path, content) => ipcRenderer.invoke("write-file", path, content),
  indexDirectory: (path) => {
    log.log("invoking index directory");
    return ipcRenderer.invoke("index-directory", path);
  },
  vectorQuery: (query) => ipcRenderer.invoke("vector-query", query),
});
