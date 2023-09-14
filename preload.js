const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  readDir: (file) => ipcRenderer.invoke("read-dir", file),
});
