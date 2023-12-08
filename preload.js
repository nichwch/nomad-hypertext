const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  readDir: (path, descending) =>
    ipcRenderer.invoke("read-dir", path, descending),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
  writeFile: (path, content) => ipcRenderer.invoke("write-file", path, content),
  newFile: (path) => ipcRenderer.invoke("new-file", path),
  deleteFile: (path) => ipcRenderer.invoke("delete-file", path),
  indexDirectory: (path) => {
    return ipcRenderer.invoke("index-directory", path);
  },
  reindexFile: (path, deletedContent, newContent) =>
    ipcRenderer.invoke("reindex-file", path, deletedContent, newContent),

  vectorQuery: (query, threshold) =>
    ipcRenderer.invoke("vector-query", query, threshold),
  clearDB: (query) => ipcRenderer.invoke("clear-db", query),
  finderDir: (path) => ipcRenderer.invoke("finder-dir", path),
  getNoteDir: () => ipcRenderer.invoke("get-note-dir"),
  setNoteDir: (path) => ipcRenderer.invoke("set-note-dir", path),
  debugPrintAll: (path) => ipcRenderer.invoke("debug-print-all", path),
});
