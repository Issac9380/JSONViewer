import { Button, Space, Dropdown, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  FormatPainterOutlined,
  CopyOutlined,
  ExportOutlined,
  SunOutlined,
  MoonOutlined,
  FileAddOutlined,
  SaveOutlined,
  SearchOutlined
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
  searchTerm?: string
  onSearchTermChange?: (term: string) => void
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
  hasContent,
  searchTerm = '',
  onSearchTermChange
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
      <Input
        prefix={<SearchOutlined />}
        placeholder="搜索..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange?.(e.target.value)}
        style={{
          width: 180,
          background: isDark ? '#1e1e1e' : '#ffffff',
          borderColor: isDark ? '#30363d' : '#e0e0e0',
          color: isDark ? '#cccccc' : '#333333'
        }}
        allowClear
      />
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
