const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: (title) => ipcRenderer.send("open-directory-picker"),
});
