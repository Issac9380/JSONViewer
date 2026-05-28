import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  onWindowStateChanged: (callback: (maximized: boolean) => void) => {
    const handler = (_event: unknown, maximized: boolean) => callback(maximized)
    ipcRenderer.on('window-state-changed', handler)
    return () => { ipcRenderer.removeListener('window-state-changed', handler) }
  }
})
