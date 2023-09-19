const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  readDir: (path) => ipcRenderer.invoke("read-dir", path),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (path, content) => ipcRenderer.invoke("write-file", path, content),
  newFile: (path) => ipcRenderer.invoke("new-file", path),
  indexDirectory: (path) => {
    return ipcRenderer.invoke("index-directory", path);
  },
  vectorQuery: (query) => ipcRenderer.invoke("vector-query", query),
});
