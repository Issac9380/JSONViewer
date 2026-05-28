/// <reference types="vite/client" />

interface ElectronAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  openFile: () => Promise<{ content: string; filePath: string } | null>
  saveFile: (content: string) => Promise<boolean>
  readDroppedFile: (filePath: string) => Promise<{ content: string; filePath: string } | null>
  getWindowState: () => Promise<boolean>
  onWindowStateChanged: (callback: (maximized: boolean) => void) => () => void
}

interface Window {
  electronAPI: ElectronAPI
}
