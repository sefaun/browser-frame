// canvas-target-preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCanvasFrame: (callback) => ipcRenderer.on('update-canvas-frame', callback),
})
