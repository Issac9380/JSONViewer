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
