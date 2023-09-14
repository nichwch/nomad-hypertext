const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectoryPicker: () => ipcRenderer.invoke("open-directory-picker"),
  getStoreValue: (key) => ipcRenderer.invoke("getStoreValue", key),
  setStoreValue: (key, value) =>
    ipcRenderer.invoke("setStoreValue", key, value),
});
