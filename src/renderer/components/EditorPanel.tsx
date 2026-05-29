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
    <div style={{ flex: 1, minHeight: 0 }}>
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
