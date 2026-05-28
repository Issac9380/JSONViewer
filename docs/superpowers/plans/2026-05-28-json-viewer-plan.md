# JSON Viewer 桌面工具 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个基于 Electron + React + Monaco Editor 的 Windows 桌面 JSON 查看/编辑工具，支持格式化、树形浏览、语法校验、搜索替换、文件拖放、主题切换和导出。

**架构：** Electron 主进程管理窗口和文件 IPC，React 渲染进程负责 UI。左右分栏布局：左侧 Monaco Editor 编辑区，右侧 Ant Design Tree 树形视图。JSON 解析状态通过 React hook (`useJsonState`) 管理，主题通过 React Context 全局共享。

**技术栈：** Electron + electron-vite + React 18 + TypeScript + Monaco Editor + Ant Design 5 + html-to-image + jspdf + electron-builder

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `package.json` | 项目配置、依赖、脚本 |
| `electron.vite.config.ts` | electron-vite 构建配置 |
| `electron-builder.yml` | electron-builder 打包配置 |
| `tsconfig.json` / `tsconfig.node.json` / `tsconfig.web.json` | TypeScript 配置 |
| `src/main/index.ts` | Electron 主进程：创建窗口、IPC 处理 |
| `src/preload/index.ts` | 预加载脚本：暴露安全的 IPC 接口 |
| `src/renderer/index.html` | HTML 入口 |
| `src/renderer/main.tsx` | React 入口 |
| `src/renderer/App.tsx` | 根组件：布局编排、全局状态 |
| `src/renderer/components/Toolbar.tsx` | 工具栏：格式化、复制、导出、主题切换 |
| `src/renderer/components/EditorPanel.tsx` | Monaco Editor 封装组件 |
| `src/renderer/components/TreePanel.tsx` | JSON 树形视图（Ant Design Tree） |
| `src/renderer/components/StatusBar.tsx` | 底部状态栏 |
| `src/renderer/components/MainLayout.tsx` | 可拖拽调整宽度的左右分栏布局 |
| `src/renderer/hooks/useJsonState.ts` | JSON 解析/格式化状态管理 hook |
| `src/renderer/hooks/useTheme.ts` | 深色/浅色主题管理 hook |
| `src/renderer/utils/jsonToTree.ts` | JSON → Ant Design Tree 数据格式转换 |
| `src/renderer/utils/export.ts` | 导出 PNG/PDF 工具函数 |
| `src/renderer/styles/app.css` | 全局样式 |

---

### 任务 1：项目脚手架搭建

**文件：**
- 创建：`package.json`、`electron.vite.config.ts`、`tsconfig.json`、`tsconfig.node.json`、`tsconfig.web.json`
- 创建：`src/main/index.ts`、`src/preload/index.ts`、`src/renderer/index.html`、`src/renderer/main.tsx`
- 创建：`electron-builder.yml`

- [ ] **步骤 1：创建 package.json**

```json
{
  "name": "json-viewer",
  "version": "1.0.0",
  "description": "JSON Viewer - 桌面 JSON 查看工具",
  "main": "./out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "pack": "electron-builder --dir",
    "dist": "electron-vite build && electron-builder"
  },
  "dependencies": {
    "@ant-design/icons": "^5.3.0",
    "@monaco-editor/react": "^4.6.0",
    "antd": "^5.15.0",
    "html-to-image": "^1.11.11",
    "jspdf": "^2.5.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1",
    "electron-vite": "^2.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

- [ ] **步骤 2：创建 electron.vite.config.ts**

```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      }
    },
    plugins: [react()]
  }
})
```

- [ ] **步骤 3：创建 TypeScript 配置**

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "outDir": "./out",
    "strict": true,
    "skipLibCheck": true,
    "target": "ESNext",
    "lib": ["ESNext"],
    "types": ["electron-vite/node"]
  },
  "include": ["src/main/**/*", "src/preload/**/*", "electron.vite.config.*"]
}
```

`tsconfig.web.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "outDir": "./out",
    "strict": true,
    "skipLibCheck": true,
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "paths": {
      "@/*": ["./src/renderer/*"]
    }
  },
  "include": ["src/renderer/**/*"]
}
```

- [ ] **步骤 4：创建 Electron 主进程入口**

`src/main/index.ts`:
```typescript
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readFile } from 'fs/promises'

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
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

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
  const result = await dialog.showOpenDialog(mainWindow!, {
    filters: [{ name: 'JSON / Text', extensions: ['json', 'txt'] }],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const content = await readFile(result.filePaths[0], 'utf-8')
  return { content, filePath: result.filePaths[0] }
})

ipcMain.handle('save-file', async (_event, content: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    defaultPath: 'output.json'
  })
  if (result.canceled || !result.filePath) return false
  const { writeFile } = await import('fs/promises')
  await writeFile(result.filePath, content, 'utf-8')
  return true
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

mainWindow?.on('maximize', () => mainWindow?.webContents.send('window-state-changed', true))
mainWindow?.on('unmaximize', () => mainWindow?.webContents.send('window-state-changed', false))
```

- [ ] **步骤 5：创建预加载脚本**

`src/preload/index.ts`:
```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  readDroppedFile: (filePath: string) => ipcRenderer.invoke('read-dropped-file', filePath),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  onWindowStateChanged: (callback: (maximized: boolean) => void) => {
    ipcRenderer.on('window-state-changed', (_event, maximized) => callback(maximized))
  }
})
```

- [ ] **步骤 6：创建 renderer 入口文件**

`src/renderer/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JSON Viewer</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

`src/renderer/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **步骤 7：创建 electron-builder.yml**

```yaml
appId: com.jsonviewer.app
productName: JSON Viewer
directories:
  buildResources: build
  output: release
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.*'
  - '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}'
  - '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
win:
  target:
    - target: nsis
      arch: [x64]
  artifactName: ${name}-${version}-setup.${ext}
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

- [ ] **步骤 8：创建类型声明文件**

`src/renderer/env.d.ts`:
```typescript
/// <reference types="vite/client" />

interface ElectronAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  openFile: () => Promise<{ content: string; filePath: string } | null>
  saveFile: (content: string) => Promise<boolean>
  readDroppedFile: (filePath: string) => Promise<{ content: string; filePath: string } | null>
  getWindowState: () => Promise<boolean>
  onWindowStateChanged: (callback: (maximized: boolean) => void) => void
}

interface Window {
  electronAPI: ElectronAPI
}
```

- [ ] **步骤 9：安装依赖并验证脚手架**

运行：`npm install`
预期：依赖安装成功，无错误

运行：`npm run dev`
预期：Electron 窗口启动，显示空白页面

---

### 任务 2：全局主题 Hook

**文件：**
- 创建：`src/renderer/hooks/useTheme.ts`

- [ ] **步骤 1：实现 useTheme hook**

```typescript
import { useState, useCallback, useEffect } from 'react'
import type { ThemeConfig } from 'antd'

type ThemeMode = 'light' | 'dark'

const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  },
  algorithm: undefined // will be set via ConfigProvider
}

const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  },
  algorithm: undefined
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('json-viewer-theme')
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  })

  useEffect(() => {
    localStorage.setItem('json-viewer-theme', mode)
  }, [mode])

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return { mode, theme: mode === 'dark' ? darkTheme : lightTheme, toggleTheme }
}
```

---

### 任务 3：JSON → Tree 数据转换工具

**文件：**
- 创建：`src/renderer/utils/jsonToTree.ts`

- [ ] **步骤 1：实现 jsonToTree 函数**

```typescript
import type { DataNode } from 'antd/es/tree'

export function jsonToTree(key: string, value: unknown, parentPath: string = '$'): DataNode {
  const currentPath = parentPath === '$' ? '$' : `${parentPath}.${key}`

  if (value === null) {
    return { title: `${key}: null`, key: currentPath, isLeaf: true }
  }

  if (typeof value === 'boolean') {
    return { title: `${key}: ${value}`, key: currentPath, isLeaf: true }
  }

  if (typeof value === 'number') {
    return { title: `${key}: ${value}`, key: currentPath, isLeaf: true }
  }

  if (typeof value === 'string') {
    const display = value.length > 80 ? `${value.slice(0, 80)}…` : value
    return { title: `${key}: "${display}"`, key: currentPath, isLeaf: true }
  }

  if (Array.isArray(value)) {
    const children = value.map((item, index) =>
      jsonToTree(String(index), item, currentPath)
    )
    return {
      title: `${key}: [${value.length} item${value.length !== 1 ? 's' : ''}]`,
      key: currentPath,
      children
    }
  }

  if (typeof value === 'object') {
    const children = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      jsonToTree(k, v, currentPath)
    )
    const count = Object.keys(value as object).length
    return {
      title: `${key}: {${count} key${count !== 1 ? 's' : ''}}`,
      key: currentPath,
      children
    }
  }

  return { title: `${key}: ${String(value)}`, key: currentPath, isLeaf: true }
}

export function buildTreeData(parsed: unknown): DataNode[] {
  if (parsed === null || parsed === undefined) {
    return []
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, index) => jsonToTree(String(index), item, '$'))
  }

  if (typeof parsed === 'object') {
    return Object.entries(parsed as Record<string, unknown>).map(([key, value]) =>
      jsonToTree(key, value, '$')
    )
  }

  return [jsonToTree('root', parsed, '$')]
}

export function getValueByPath(parsed: unknown, path: string): string {
  if (path === '$') {
    if (typeof parsed === 'string') return `"${parsed}"`
    return JSON.stringify(parsed)
  }
  const parts = path.split('.').slice(1) // remove leading '$'
  let current: unknown = parsed
  for (const part of parts) {
    if (current === null || current === undefined) return 'undefined'
    if (Array.isArray(current)) {
      current = current[Number(part)]
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    }
  }
  if (current === null) return 'null'
  if (current === undefined) return 'undefined'
  if (typeof current === 'string') return `"${current}"`
  return JSON.stringify(current)
}
```

---

### 任务 4：JSON 状态管理 Hook

**文件：**
- 创建：`src/renderer/hooks/useJsonState.ts`

- [ ] **步骤 1：实现 useJsonState hook**

```typescript
import { useState, useCallback, useRef } from 'react'
import type { DataNode } from 'antd/es/tree'
import { buildTreeData } from '@/utils/jsonToTree'

const MAX_AUTO_PARSE_SIZE = 10 * 1024 * 1024 // 10MB

export interface JsonState {
  raw: string
  formatted: string
  parsed: unknown | null
  treeData: DataNode[]
  error: string | null
  isValid: boolean
  isLarge: boolean
}

export function useJsonState() {
  const [state, setState] = useState<JsonState>({
    raw: '',
    formatted: '',
    parsed: null,
    treeData: [],
    error: null,
    isValid: false,
    isLarge: false
  })

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parseJson = useCallback((content: string, force: boolean = false) => {
    if (content.trim() === '') {
      setState({
        raw: '',
        formatted: '',
        parsed: null,
        treeData: [],
        error: null,
        isValid: false,
        isLarge: false
      })
      return
    }

    if (content.length > MAX_AUTO_PARSE_SIZE && !force) {
      setState({
        raw: content,
        formatted: content,
        parsed: null,
        treeData: [],
        error: 'JSON 过大（>10MB），点击格式化按钮以解析',
        isValid: false,
        isLarge: true
      })
      return
    }

    try {
      const parsed = JSON.parse(content)
      const formatted = JSON.stringify(parsed, null, 2)
      const treeData = buildTreeData(parsed)
      setState({
        raw: content,
        formatted,
        parsed,
        treeData,
        error: null,
        isValid: true,
        isLarge: false
      })
    } catch (e) {
      const message = e instanceof SyntaxError ? e.message : '解析错误'
      setState(prev => ({
        raw: content,
        formatted: content,
        parsed: null,
        treeData: prev.treeData,
        error: message,
        isValid: false,
        isLarge: false
      }))
    }
  }, [])

  const setRaw = useCallback((content: string) => {
    setState(prev => ({ ...prev, raw: content }))

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      parseJson(content)
    }, 300)
  }, [parseJson])

  const forceFormat = useCallback(() => {
    parseJson(state.raw, true)
  }, [state.raw, parseJson])

  const formatContent = useCallback(() => {
    if (state.isValid) return
    try {
      const parsed = JSON.parse(state.raw)
      const formatted = JSON.stringify(parsed, null, 2)
      setState(prev => ({ ...prev, raw: formatted, formatted }))
      parseJson(formatted)
    } catch {
      // can't format invalid JSON
    }
  }, [state.raw, state.isValid, parseJson])

  return { state, setRaw, forceFormat, formatContent }
}
```

---

### 任务 5：全局样式

**文件：**
- 创建：`src/renderer/styles/app.css`

- [ ] **步骤 1：编写全局样式**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#root {
  display: flex;
  flex-direction: column;
}
```

---

### 任务 6：主布局组件（MainLayout）

**文件：**
- 创建：`src/renderer/components/MainLayout.tsx`

- [ ] **步骤 1：实现可拖拽左右分栏布局**

```tsx
import { useState, useCallback, useRef, useEffect } from 'react'

interface MainLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultRatio?: number // 0-1, left panel ratio
  minRatio?: number
  maxRatio?: number
}

export default function MainLayout({
  left,
  right,
  defaultRatio = 0.6,
  minRatio = 0.3,
  maxRatio = 0.8
}: MainLayoutProps) {
  const [ratio, setRatio] = useState(defaultRatio)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseDown = useCallback(() => {
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = (e.clientX - rect.left) / rect.width
      setRatio(Math.min(maxRatio, Math.max(minRatio, newRatio)))
    }

    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [minRatio, maxRatio])

  return (
    <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: `${ratio * 100}%`, minWidth: 0, overflow: 'hidden' }}>
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        style={{
          width: 4,
          cursor: 'col-resize',
          background: 'var(--border-color, #30363d)',
          flexShrink: 0,
          transition: dragging.current ? 'none' : 'background 0.2s'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = '#1677ff'
        }}
        onMouseLeave={(e) => {
          if (!dragging.current) {
            (e.target as HTMLElement).style.background = 'var(--border-color, #30363d)'
          }
        }}
      />
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {right}
      </div>
    </div>
  )
}
```

---

### 任务 7：TitleBar 标题栏

**文件：**
- 创建：`src/renderer/components/TitleBar.tsx`

- [ ] **步骤 1：实现自定义标题栏**

```tsx
import { useEffect, useState } from 'react'

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.electronAPI.getWindowState().then(setMaximized)
    window.electronAPI.onWindowStateChanged(setMaximized)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 36,
        padding: '0 12px',
        background: 'var(--titlebar-bg, #1e1e1e)',
        color: 'var(--titlebar-color, #ccc)',
        WebkitAppRegion: 'drag',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>JSON Viewer</span>
      <div style={{ WebkitAppRegion: 'no-drag', display: 'flex', gap: 2 }}>
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          style={{
            border: 'none', background: 'transparent', color: 'inherit',
            cursor: 'pointer', fontSize: 16, padding: '4px 10px',
            borderRadius: 4, lineHeight: 1
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          —
        </button>
        <button
          onClick={() => window.electronAPI.maximizeWindow()}
          style={{
            border: 'none', background: 'transparent', color: 'inherit',
            cursor: 'pointer', fontSize: 14, padding: '4px 10px',
            borderRadius: 4, lineHeight: 1
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {maximized ? '❐' : '□'}
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          style={{
            border: 'none', background: 'transparent', color: 'inherit',
            cursor: 'pointer', fontSize: 16, padding: '4px 10px',
            borderRadius: 4, lineHeight: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e81123'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
```

---

### 任务 8：工具栏 Toolbar

**文件：**
- 创建：`src/renderer/components/Toolbar.tsx`

- [ ] **步骤 1：实现工具栏组件**

```tsx
import { Button, Space, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  FormatPainterOutlined,
  CopyOutlined,
  ExportOutlined,
  SunOutlined,
  MoonOutlined,
  FileAddOutlined,
  SaveOutlined
} from '@ant-design/icons'

interface ToolbarProps {
  onFormat: () => void
  onCopy: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onExportPng: () => void
  onExportPdf: () => void
  isDark: boolean
  onToggleTheme: () => void
  canFormat: boolean
  hasContent: boolean
}

export default function Toolbar({
  onFormat,
  onCopy,
  onOpenFile,
  onSaveFile,
  onExportPng,
  onExportPdf,
  isDark,
  onToggleTheme,
  canFormat,
  hasContent
}: ToolbarProps) {
  const exportItems: MenuProps['items'] = [
    { key: 'png', label: '导出树形视图为 PNG', icon: <ExportOutlined />, onClick: onExportPng },
    { key: 'pdf', label: '导出树形视图为 PDF', icon: <ExportOutlined />, onClick: onExportPdf },
    { type: 'divider' },
    { key: 'save', label: '另存为 JSON 文件', icon: <SaveOutlined />, onClick: onSaveFile }
  ]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 12px',
      gap: 8,
      borderBottom: '1px solid var(--border-color, #30363d)',
      background: 'var(--toolbar-bg, #252526)',
      flexShrink: 0
    }}>
      <Space size="small">
        <Button
          icon={<FormatPainterOutlined />}
          size="small"
          onClick={onFormat}
          disabled={!canFormat}
          title="格式化 JSON (Ctrl+Shift+F)"
        >
          格式化
        </Button>
        <Button
          icon={<CopyOutlined />}
          size="small"
          onClick={onCopy}
          disabled={!hasContent}
          title="复制格式化 JSON"
        >
          复制
        </Button>
        <Button
          icon={<FileAddOutlined />}
          size="small"
          onClick={onOpenFile}
          title="打开 JSON 文件"
        >
          打开
        </Button>
        <Dropdown menu={{ items: exportItems }} placement="bottomLeft" disabled={!hasContent}>
          <Button icon={<ExportOutlined />} size="small" disabled={!hasContent}>
            导出
          </Button>
        </Dropdown>
      </Space>
      <div style={{ flex: 1 }} />
      <Button
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        size="small"
        type="text"
        onClick={onToggleTheme}
        title={isDark ? '切换浅色主题' : '切换深色主题'}
      />
    </div>
  )
}
```

---

### 任务 9：编辑器面板 EditorPanel

**文件：**
- 创建：`src/renderer/components/EditorPanel.tsx`

- [ ] **步骤 1：实现 Monaco Editor 封装组件**

```tsx
import { useRef, useCallback } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface EditorPanelProps {
  value: string
  onChange: (value: string) => void
  isDark: boolean
  onFormat: () => void
}

export default function EditorPanel({ value, onChange, isDark, onFormat }: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor

    editor.addAction({
      id: 'format-json',
      label: 'Format JSON',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
      run: () => onFormat()
    })
  }, [onFormat])

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language="json"
        theme={isDark ? 'vs-dark' : 'vs'}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          bracketPairColorization: { enabled: true },
          placeholder: '粘贴 JSON 字符串或拖放 JSON 文件…'
        }}
      />
    </div>
  )
}
```

---

### 任务 10：树形视图面板 TreePanel

**文件：**
- 创建：`src/renderer/components/TreePanel.tsx`

- [ ] **步骤 1：实现 JSON 树形视图组件**

```tsx
import { useRef, useState, useCallback } from 'react'
import { Tree, Button, Space, Empty } from 'antd'
import {
  ExpandAltOutlined,
  CompressOutlined,
  VerticalAlignBottomOutlined
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'

interface TreePanelProps {
  treeData: DataNode[]
  onSelect: (path: string) => void
  isValid: boolean
  hasContent: boolean
  treeRef: React.MutableRefObject<HTMLDivElement | null>
}

export default function TreePanel({ treeData, onSelect, isValid, hasContent, treeRef }: TreePanelProps) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const getKeysUpToLevel = useCallback((nodes: DataNode[], maxLevel: number): string[] => {
    const keys: string[] = []
    const walk = (items: DataNode[], level: number) => {
      for (const item of items) {
        keys.push(item.key as string)
        if (item.children && level < maxLevel) {
          walk(item.children, level + 1)
        }
      }
    }
    walk(nodes, 0)
    return keys
  }, [])

  const expandAll = useCallback(() => {
    const allKeys: string[] = []
    const walk = (nodes: DataNode[]) => {
      for (const item of nodes) {
        allKeys.push(item.key as string)
        if (item.children) walk(item.children)
      }
    }
    walk(treeData)
    setExpandedKeys(allKeys)
  }, [treeData])

  const collapseAll = useCallback(() => {
    setExpandedKeys([])
  }, [])

  const expandToLevel = useCallback((level: number) => {
    setExpandedKeys(getKeysUpToLevel(treeData, level))
  }, [treeData, getKeysUpToLevel])

  const handleSelect = useCallback((keys: React.Key[]) => {
    if (keys.length > 0) {
      onSelect(keys[0] as string)
    }
  }, [onSelect])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-color, #30363d)',
        flexShrink: 0
      }}>
        <Space size="small" wrap>
          <Button size="small" icon={<ExpandAltOutlined />} onClick={expandAll} disabled={!hasContent}>
            全部展开
          </Button>
          <Button size="small" icon={<CompressOutlined />} onClick={collapseAll} disabled={!hasContent}>
            全部折叠
          </Button>
          <Button size="small" icon={<VerticalAlignBottomOutlined />} onClick={() => expandToLevel(1)} disabled={!hasContent}>
            层级 1
          </Button>
          <Button size="small" icon={<VerticalAlignBottomOutlined />} onClick={() => expandToLevel(2)} disabled={!hasContent}>
            层级 2
          </Button>
          <Button size="small" icon={<VerticalAlignBottomOutlined />} onClick={() => expandToLevel(3)} disabled={!hasContent}>
            层级 3
          </Button>
        </Space>
      </div>
      <div
        ref={treeRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px 4px'
        }}
      >
        {hasContent && isValid && treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            showLine={{ showLeafIcon: false }}
            showIcon={false}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            onSelect={handleSelect}
            defaultExpandAll={false}
            blockNode
            style={{ background: 'transparent', color: 'inherit' }}
          />
        ) : (
          <Empty
            description={hasContent ? '不是有效的 JSON' : '粘贴 JSON 后此处显示树形结构'}
            style={{ marginTop: 40 }}
          />
        )}
      </div>
    </div>
  )
}
```

---

### 任务 11：状态栏 StatusBar

**文件：**
- 创建：`src/renderer/components/StatusBar.tsx`

- [ ] **步骤 1：实现底部状态栏**

```tsx
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons'

interface StatusBarProps {
  isValid: boolean
  error: string | null
  isLarge: boolean
  selectedPath: string | null
  selectedValue: string | null
  contentLength: number
}

export default function StatusBar({ isValid, error, isLarge, selectedPath, selectedValue, contentLength }: StatusBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderTop: '1px solid var(--border-color, #30363d)',
      background: 'var(--statusbar-bg, #007acc)',
      color: 'var(--statusbar-color, #fff)',
      fontSize: 12,
      gap: 16,
      flexShrink: 0,
      minHeight: 26
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isValid ? (
          <span style={{ color: '#4ec9b0' }}>
            <CheckCircleOutlined style={{ marginRight: 4 }} />
            JSON 有效
          </span>
        ) : error ? (
          <span style={{ color: '#f14c4c' }}>
            <CloseCircleOutlined style={{ marginRight: 4 }} />
            {error}
          </span>
        ) : isLarge ? (
          <span style={{ color: '#cca700' }}>
            <WarningOutlined style={{ marginRight: 4 }} />
            {error}
          </span>
        ) : contentLength > 0 ? (
          <span style={{ color: '#f14c4c' }}>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            无效 JSON
          </span>
        ) : (
          <span>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            就绪
          </span>
        )}
      </div>
      {contentLength > 0 && (
        <span>{formatSize(contentLength)}</span>
      )}
      <div style={{ flex: 1 }} />
      {selectedPath && (
        <span style={{ opacity: 0.8 }}>
          {selectedPath}
          {selectedValue !== null && ` = ${selectedValue}`}
        </span>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
```

---

### 任务 12：导出工具函数

**文件：**
- 创建：`src/renderer/utils/export.ts`

- [ ] **步骤 1：实现导出 PNG/PDF 函数**

```typescript
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

export async function exportToPng(element: HTMLElement, filename: string = 'json-tree.png'): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#1e1e1e',
    pixelRatio: 2
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function exportToPdf(element: HTMLElement, filename: string = 'json-tree.pdf'): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#1e1e1e',
    pixelRatio: 2
  })
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4'
  })
  const imgProps = pdf.getImageProperties(dataUrl)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(filename)
}
```

---

### 任务 13：App 根组件（集成所有组件）

**文件：**
- 创建：`src/renderer/App.tsx`

- [ ] **步骤 1：实现 App 根组件，整合所有子组件和功能**

```tsx
import { useRef, useCallback, useEffect, useState } from 'react'
import { ConfigProvider, theme as antTheme, App as AntApp, message } from 'antd'
import TitleBar from '@/components/TitleBar'
import Toolbar from '@/components/Toolbar'
import MainLayout from '@/components/MainLayout'
import EditorPanel from '@/components/EditorPanel'
import TreePanel from '@/components/TreePanel'
import StatusBar from '@/components/StatusBar'
import { useJsonState } from '@/hooks/useJsonState'
import { useTheme } from '@/hooks/useTheme'
import { getValueByPath } from '@/utils/jsonToTree'
import { exportToPng, exportToPdf } from '@/utils/export'

export default function App() {
  const { state, setRaw, forceFormat, formatContent } = useJsonState()
  const { mode, toggleTheme } = useTheme()
  const treeRef = useRef<HTMLDivElement | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  const isDark = mode === 'dark'

  // Keyboard shortcut for format via menu (handled in Monaco directly)
  // File drop handler
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
        messageApi.warning('请拖放 .json 或 .txt 文件')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setRaw(reader.result as string)
      }
      reader.readAsText(file)
    }
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [setRaw, messageApi])

  const handleCopy = useCallback(async () => {
    if (!state.formatted) return
    await navigator.clipboard.writeText(state.formatted)
    messageApi.success('已复制格式化 JSON')
  }, [state.formatted, messageApi])

  const handleOpenFile = useCallback(async () => {
    const result = await window.electronAPI.openFile()
    if (result) {
      setRaw(result.content)
    }
  }, [setRaw])

  const handleSaveFile = useCallback(async () => {
    const content = state.formatted || state.raw
    if (!content) return
    const success = await window.electronAPI.saveFile(content)
    if (success) {
      messageApi.success('文件已保存')
    }
  }, [state.formatted, state.raw, messageApi])

  const handleExportPng = useCallback(async () => {
    if (!treeRef.current) return
    try {
      await exportToPng(treeRef.current)
      messageApi.success('PNG 已导出')
    } catch {
      messageApi.error('导出 PNG 失败')
    }
  }, [messageApi])

  const handleExportPdf = useCallback(async () => {
    if (!treeRef.current) return
    try {
      await exportToPdf(treeRef.current)
      messageApi.success('PDF 已导出')
    } catch {
      messageApi.error('导出 PDF 失败')
    }
  }, [messageApi])

  const handleTreeSelect = useCallback((path: string) => {
    setSelectedPath(path)
    if (state.parsed) {
      setSelectedValue(getValueByPath(state.parsed, path))
    }
  }, [state.parsed])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 6 }
      }}
    >
      <AntApp>
        {contextHolder}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: isDark ? '#1e1e1e' : '#ffffff',
          color: isDark ? '#cccccc' : '#333333',
          ['--border-color' as string]: isDark ? '#30363d' : '#e0e0e0',
          ['--titlebar-bg' as string]: isDark ? '#1e1e1e' : '#f5f5f5',
          ['--titlebar-color' as string]: isDark ? '#cccccc' : '#333333',
          ['--toolbar-bg' as string]: isDark ? '#252526' : '#fafafa',
          ['--statusbar-bg' as string]: isDark ? '#007acc' : '#007acc',
          ['--statusbar-color' as string]: '#ffffff'
        }}>
          <TitleBar />
          <Toolbar
            onFormat={forceFormat}
            onCopy={handleCopy}
            onOpenFile={handleOpenFile}
            onSaveFile={handleSaveFile}
            onExportPng={handleExportPng}
            onExportPdf={handleExportPdf}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            canFormat={state.raw.length > 0}
            hasContent={state.raw.length > 0}
          />
          <MainLayout
            left={
              <EditorPanel
                value={state.raw}
                onChange={setRaw}
                isDark={isDark}
                onFormat={formatContent}
              />
            }
            right={
              <TreePanel
                treeData={state.treeData}
                onSelect={handleTreeSelect}
                isValid={state.isValid}
                hasContent={state.raw.length > 0}
                treeRef={treeRef}
              />
            }
          />
          <StatusBar
            isValid={state.isValid}
            error={state.error}
            isLarge={state.isLarge}
            selectedPath={selectedPath}
            selectedValue={selectedValue}
            contentLength={state.raw.length}
          />
        </div>
      </AntApp>
    </ConfigProvider>
  )
}
```

---

### 任务 14：构建与打包验证

- [ ] **步骤 1：构建生产版本**

运行：`npm run build`
预期：构建成功，`out/` 目录生成所有编译产物

- [ ] **步骤 2：打包为 Windows EXE**

运行：`npm run dist`
预期：`release/` 目录生成 `JSON Viewer-1.0.0-setup.exe`

- [ ] **步骤 3：安装并运行验证**

安装生成的 EXE，验证：
- 粘贴 JSON 字符串，自动格式化显示
- 语法高亮正常（字符串/数字/布尔/null 不同颜色）
- 错误 JSON 显示红色波浪线和错误信息
- 树形视图正常渲染，可折叠展开
- Ctrl+Shift+F 格式化快捷键工作
- 搜索 Ctrl+F / 替换 Ctrl+H 工作
- 拖放 .json 文件到窗口可打开
- 深色/浅色主题切换正常
- 复制按钮复制格式化 JSON
- 导出 PNG/PDF 正常
- 另存为文件正常
```

---

### 任务 15：最终样式美化与修边

**文件：**
- 修改：`src/renderer/styles/app.css`

- [ ] **步骤 1：添加微调样式**

```css
/* Ant Design Tree 在深色模式下的样式微调 */
.ant-tree {
  background: transparent !important;
  color: inherit !important;
}

.ant-tree .ant-tree-node-content-wrapper {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace !important;
  font-size: 13px;
}

.ant-tree .ant-tree-node-content-wrapper:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
```
