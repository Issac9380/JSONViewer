import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'JSON Viewer',
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('maximize', () => mainWindow?.webContents.send('window-state-changed', true))
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window-state-changed', false))

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.handle('minimize-window', () => mainWindow?.minimize())
ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.handle('close-window', () => mainWindow?.close())

ipcMain.handle('open-file', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'JSON / Text', extensions: ['json', 'txt'] }],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  try {
    const content = await readFile(result.filePaths[0], 'utf-8')
    return { content, filePath: result.filePaths[0] }
  } catch {
    return null
  }
})

ipcMain.handle('save-file', async (_event, content: string) => {
  if (!mainWindow) return false
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    defaultPath: 'output.json'
  })
  if (result.canceled || !result.filePath) return false
  try {
    await writeFile(result.filePath, content, 'utf-8')
    return true
  } catch {
    return false
  }
})

ipcMain.handle('read-dropped-file', async (_event, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8')
    return { content, filePath }
  } catch {
    return null
  }
})

ipcMain.handle('get-window-state', () => {
  return mainWindow?.isMaximized() ?? false
})
