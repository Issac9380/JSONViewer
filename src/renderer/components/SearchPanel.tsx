import { useState, useCallback, useEffect } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface SearchPanelProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  isDark: boolean
}

export default function SearchPanel({ value, onChange, onSearch, isDark }: SearchPanelProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }, [onSearch])

  return (
    <Input
      prefix={<SearchOutlined />}
      placeholder="搜索..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onPressEnter={onSearch}
      style={{
        width: 200,
        background: isDark ? '#252526' : '#fafafa',
        borderColor: isDark ? '#30363d' : '#e0e0e0'
      }}
      allowClear
    />
  )
}