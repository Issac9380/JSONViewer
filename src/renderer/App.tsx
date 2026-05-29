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
import { getValueByPath } from '@/utils/jsonToTree.tsx'
import { exportToPng, exportToPdf } from '@/utils/export'

export default function App() {
  const { state, setRaw, forceFormat, formatContent } = useJsonState()
  const { mode, toggleTheme } = useTheme()
  const treeRef = useRef<HTMLDivElement | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  const isDark = mode === 'dark'

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
    if (!treeRef.current) {
      messageApi.error('树形视图未找到')
      return
    }
    try {
      await exportToPng(treeRef.current, 'json-tree.png', isDark)
      messageApi.success('PNG 已导出')
    } catch (e) {
      console.error('PNG export error:', e)
      messageApi.error(`导出 PNG 失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }, [messageApi, isDark])

  const handleExportPdf = useCallback(async () => {
    if (!treeRef.current) {
      messageApi.error('树形视图未找到')
      return
    }
    try {
      await exportToPdf(treeRef.current, 'json-tree.pdf', isDark)
      messageApi.success('PDF 已导出')
    } catch (e) {
      console.error('PDF export error:', e)
      messageApi.error(`导出 PDF 失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }, [messageApi, isDark])

  const handleTreeSelect = useCallback((path: string) => {
    setSelectedPath(path)
    if (state.parsed !== null && state.parsed !== undefined) {
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
      <AntApp style={{ height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {contextHolder}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '100%',
          overflow: 'hidden',
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
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
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
                searchTerm={searchTerm}
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
