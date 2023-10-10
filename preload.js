const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  readDir: (path, descending) =>
    ipcRenderer.invoke("read-dir", path, descending),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (path, content) => ipcRenderer.invoke("write-file", path, content),
  newFile: (path) => ipcRenderer.invoke("new-file", path),
  indexDirectory: (path) => {
    return ipcRenderer.invoke("index-directory", path);
  },
  reindexFile: (path, deletedContent, newContent) =>
    ipcRenderer.invoke("reindex-file", path, deletedContent, newContent),

  vectorQuery: (query) => ipcRenderer.invoke("vector-query", query),
  clearDB: (query) => ipcRenderer.invoke("clear-db", query),
});
