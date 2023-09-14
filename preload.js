const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  readDir: (path) => ipcRenderer.invoke("read-dir", path),
  readFile: (path) => ipcRenderer.invoke("read-file", path),
});
