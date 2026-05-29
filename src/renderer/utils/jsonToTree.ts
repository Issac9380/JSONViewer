import type { DataNode } from 'antd/es/tree'

export function jsonToTree(key: string, value: unknown, parentPath: string = '$'): DataNode {
  const isNumericKey = /^\d+$/.test(key)
  const displayKey = isNumericKey ? `[${key}]` : key
  const pathKey = isNumericKey ? `[${key}]` : key
  const currentPath = parentPath === '$' ? `$.${pathKey}` : `${parentPath}.${pathKey}`

  if (value === null) {
    return { title: `${displayKey}: null`, key: currentPath, isLeaf: true }
  }

  if (typeof value === 'boolean') {
    return { title: `${displayKey}: ${value}`, key: currentPath, isLeaf: true }
  }

  if (typeof value === 'number') {
    return { title: `${displayKey}: ${value}`, key: currentPath, isLeaf: true }
  }

  if (typeof value === 'string') {
    const display = value.length > 80 ? `${value.slice(0, 80)}…` : value
    return { title: `${displayKey}: "${display}"`, key: currentPath, isLeaf: true }
  }

  if (Array.isArray(value)) {
    const children = value.map((item, index) =>
      jsonToTree(String(index), item, currentPath)
    )
    return {
      title: `${displayKey}: [${value.length} item${value.length !== 1 ? 's' : ''}]`,
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
      title: `${displayKey}: {${count} key${count !== 1 ? 's' : ''}}`,
      key: currentPath,
      children
    }
  }

  return { title: `${displayKey}: ${String(value)}`, key: currentPath, isLeaf: true }
}

function parsePath(path: string): (string | number)[] {
  if (path === '$') return []
  // Remove leading $. and split by . or [index]
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