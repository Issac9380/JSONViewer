import React from 'react'
import type { DataNode } from 'antd/es/tree'

// 颜色配置
const colors = {
  key: '#61dafb',         // 键名：蓝色
  string: '#a5d6a7',      // 字符串：绿色
  number: '#ffcc80',      // 数字：橙色
  boolean: '#81c784',     // 布尔：青色
  booleanFalse: '#e57373',// false：红色
  null: '#999999',        // null：灰色
  object: '#90caf9',      // 对象：浅蓝色
  array: '#ce93d8'        // 数组：紫色
}

export function jsonToTree(key: string, value: unknown, parentPath: string = '$'): DataNode {
  const isNumericKey = /^\d+$/.test(key)
  const displayKey = isNumericKey ? `[${key}]` : key
  const pathKey = isNumericKey ? `[${key}]` : key
  const currentPath = parentPath === '$' ? `$.${pathKey}` : `${parentPath}.${pathKey}`

  // 创建带颜色的标题
  const createTitle = (keyDisplay: string, valueDisplay: React.ReactNode) => (
    <span>
      <span style={{ color: colors.key }}>{keyDisplay}</span>
      <span style={{ color: 'inherit' }}>: </span>
      {valueDisplay}
    </span>
  )

  if (value === null) {
    return {
      title: createTitle(displayKey, <span style={{ color: colors.null }}>null</span>),
      key: currentPath,
      isLeaf: true
    }
  }

  if (typeof value === 'boolean') {
    const boolColor = value ? colors.boolean : colors.booleanFalse
    return {
      title: createTitle(displayKey, <span style={{ color: boolColor }}>{String(value)}</span>),
      key: currentPath,
      isLeaf: true
    }
  }

  if (typeof value === 'number') {
    return {
      title: createTitle(displayKey, <span style={{ color: colors.number }}>{value}</span>),
      key: currentPath,
      isLeaf: true
    }
  }

  if (typeof value === 'string') {
    const display = value.length > 80 ? `${value.slice(0, 80)}…` : value
    return {
      title: createTitle(displayKey, <span style={{ color: colors.string }}>"{display}"</span>),
      key: currentPath,
      isLeaf: true
    }
  }

  if (Array.isArray(value)) {
    const children = value.map((item, index) =>
      jsonToTree(String(index), item, currentPath)
    )
    return {
      title: createTitle(displayKey, (
        <span style={{ color: colors.array }}>
          [{value.length} item{value.length !== 1 ? 's' : ''}]
        </span>
      )),
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
      title: createTitle(displayKey, (
        <span style={{ color: colors.object }}>
          {count} key{count !== 1 ? 's' : ''}
        </span>
      )),
      key: currentPath,
      children
    }
  }

  return {
    title: createTitle(displayKey, <span>{String(value)}</span>),
    key: currentPath,
    isLeaf: true
  }
}

function parsePath(path: string): (string | number)[] {
  if (path === '$') return []
  const parts = path.substring(2).match(/[^.\[\]]+|\[\d+\]/g) || []
  return parts.map(part => {
    if (part.startsWith('[')) {
      return Number.parseInt(part.slice(1, -1), 10)
    }
    return part
  })
}

export function getValueByPath(parsed: unknown, path: string): string {
  if (path === '$') {
    if (typeof parsed === 'string') return `"${parsed}"`
    return JSON.stringify(parsed)
  }
  const parts = parsePath(path)
  let current: unknown = parsed
  for (const part of parts) {
    if (current === null || current === undefined) return 'undefined'
    if (Array.isArray(current)) {
      current = current[Number(part)]
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[String(part)]
    }
  }
  if (current === null) return 'null'
  if (current === undefined) return 'undefined'
  if (typeof current === 'string') return `"${current}"`
  return JSON.stringify(current)
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