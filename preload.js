const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: (title) => ipcRenderer.invoke("open-directory-picker"),
});
