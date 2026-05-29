import { useState, useCallback, useRef } from 'react'
import type { DataNode } from 'antd/es/tree'
import { buildTreeData } from '@/utils/jsonToTree.tsx'

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
      parseJson(formatted, true)
    } catch {
      // can't format invalid JSON
    }
  }, [state.raw, state.isValid, parseJson])

  return { state, setRaw, forceFormat, formatContent }
}
