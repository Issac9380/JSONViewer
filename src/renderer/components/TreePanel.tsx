import { useState, useCallback, useMemo, useEffect } from 'react'
import { Tree, Button, Space, Empty } from 'antd'
import {
  ExpandAltOutlined,
  CompressOutlined,
  VerticalAlignBottomOutlined
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import { searchTree, expandKeysToMatch, highlightText } from '@/utils/search.tsx'

interface TreePanelProps {
  treeData: DataNode[]
  onSelect: (path: string) => void
  isValid: boolean
  hasContent: boolean
  treeRef: React.MutableRefObject<HTMLDivElement | null>
  searchTerm?: string
}

export default function TreePanel({ treeData, onSelect, isValid, hasContent, treeRef, searchTerm = '' }: TreePanelProps) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  // 根据搜索词自动展开包含匹配项的节点
  useEffect(() => {
    if (searchTerm) {
      const keys = expandKeysToMatch(treeData, searchTerm)
      setExpandedKeys(keys)
    }
  }, [searchTerm, treeData])

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

  // 高亮树节点的标题
  const highlightedTreeData = useMemo(() => {
    if (!searchTerm) return treeData

    const highlightNode = (node: DataNode): DataNode => {
      const title = node.title as React.ReactNode
      const highlightedTitle = searchTerm ? highlightText(title, searchTerm) : title

      return {
        ...node,
        title: highlightedTitle,
        children: node.children?.map(highlightNode)
      }
    }

    return treeData.map(highlightNode)
  }, [treeData, searchTerm])

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
          padding: '8px 4px',
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {hasContent && isValid && highlightedTreeData.length > 0 ? (
          <Tree
            treeData={highlightedTreeData}
            showLine={{ showLeafIcon: false }}
            showIcon={false}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            onSelect={handleSelect}
            defaultExpandAll={false}
            blockNode
            style={{ background: 'transparent', color: 'inherit', minHeight: '100%' }}
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
