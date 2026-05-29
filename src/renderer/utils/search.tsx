import React from 'react'
import type { DataNode } from 'antd/es/tree'

export interface SearchMatch {
  key: string
  title: string
  path: string
}

function nodeTitleToString(title: React.ReactNode): string {
  if (typeof title === 'string') return title
  if (Array.isArray(title)) return title.map(nodeTitleToString).join('')
  if (React.isValidElement(title)) {
    return nodeTitleToString(title.props.children)
  }
  return String(title)
}

export function searchTree(
  treeData: DataNode[],
  searchTerm: string,
  parentPath: string = ''
): SearchMatch[] {
  const matches: SearchMatch[] = []
  const lowerSearch = searchTerm.toLowerCase()

  const search = (nodes: DataNode[], currentPath: string) => {
    for (const node of nodes) {
      const key = node.key as string
      const title = nodeTitleToString(node.title)
      const fullPath = currentPath ? `${currentPath}.${title.split(':')[0].trim()}` : title.split(':')[0].trim()

      if (title.toLowerCase().includes(lowerSearch)) {
        matches.push({
          key,
          title,
          path: fullPath
        })
      }

      if (node.children && node.children.length > 0) {
        search(node.children, fullPath)
      }
    }
  }

  search(treeData, parentPath)
  return matches
}

export function expandKeysToMatch(treeData: DataNode[], searchTerm: string): string[] {
  const keysToExpand: Set<string> = new Set()
  const lowerSearch = searchTerm.toLowerCase()

  const findPaths = (nodes: DataNode[], currentKey: string): boolean => {
    let hasMatch = false

    for (const node of nodes) {
      const key = node.key as string
      const title = nodeTitleToString(node.title)

      if (title.toLowerCase().includes(lowerSearch)) {
        hasMatch = true
      }

      if (node.children && node.children.length > 0) {
        const childHasMatch = findPaths(node.children, key)
        if (childHasMatch) {
          keysToExpand.add(key)
          hasMatch = true
        }
      }
    }

    return hasMatch
  }

  findPaths(treeData, '')
  return Array.from(keysToExpand)
}

export function highlightText(text: React.ReactNode, searchTerm: string): React.ReactNode {
  if (!searchTerm) return text

  if (React.isValidElement(text)) {
    return React.cloneElement(text, {}, highlightText(text.props.children, searchTerm))
  }

  if (Array.isArray(text)) {
    return text.map((item, index) => (
      <React.Fragment key={index}>{highlightText(item, searchTerm)}</React.Fragment>
    ))
  }

  const strText = String(text)
  const parts = strText.split(new RegExp(`(${escapeRegex(searchTerm)})`, 'gi'))

  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={index} style={{
        backgroundColor: '#ffd700',
        color: '#000',
        padding: '0 2px',
        borderRadius: 2
      }}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}