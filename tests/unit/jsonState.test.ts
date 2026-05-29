import { describe, it, expect } from 'vitest'
import { buildTreeData, getValueByPath } from '../../src/renderer/utils/jsonToTree.tsx'

describe('JSON Processing', () => {
  it('should parse simple object', () => {
    const json = { name: 'test', value: 123 }
    const treeData = buildTreeData(json)
    expect(treeData).toHaveLength(2)
    expect(treeData[0].title).toBe('name: "test"')
    expect(treeData[1].title).toBe('value: 123')
  })

  it('should parse nested objects', () => {
    const json = { user: { name: 'Alice', age: 30 } }
    const treeData = buildTreeData(json)
    expect(treeData).toHaveLength(1)
    expect(treeData[0].key).toBe('$.user')
    expect(treeData[0].children).toBeDefined()
    expect(treeData[0].children).toHaveLength(2)
  })

  it('should handle empty JSON', () => {
    const treeData = buildTreeData({})
    expect(treeData).toHaveLength(0)
  })

  it('should handle arrays', () => {
    const json = [1, 2, 3]
    const treeData = buildTreeData(json)
    expect(treeData).toHaveLength(3)
    expect(treeData[0].title).toBe('[0]: 1')
    expect(treeData[0].key).toBe('$.[0]')
  })

  it('should get value by path', () => {
    const json = { user: { name: 'Alice', age: 30, hobbies: ['reading', 'coding'] } }
    expect(getValueByPath(json, '$.user.name')).toBe('"Alice"')
    expect(getValueByPath(json, '$.user.age')).toBe('30')
    expect(getValueByPath(json, '$.user.hobbies.[0]')).toBe('"reading"')
  })

  it('should handle null values', () => {
    const json = { value: null }
    const treeData = buildTreeData(json)
    expect(treeData[0].title).toBe('value: null')
    expect(getValueByPath(json, '$.value')).toBe('null')
  })

  it('should handle boolean values', () => {
    const json = { active: true, disabled: false }
    const treeData = buildTreeData(json)
    expect(treeData[0].title).toBe('active: true')
    expect(treeData[1].title).toBe('disabled: false')
  })

  it('should handle nested arrays', () => {
    const json = { matrix: [[1, 2], [3, 4]] }
    const treeData = buildTreeData(json)
    expect(treeData).toHaveLength(1)
    expect(treeData[0].children).toHaveLength(2)
    expect(treeData[0].children![0].children).toHaveLength(2)
  })

  it('should truncate long strings in tree', () => {
    const longString = 'x'.repeat(100)
    const json = { long: longString }
    const treeData = buildTreeData(json)
    expect(treeData[0].title).toContain('…')
    expect(treeData[0].title.length).toBeLessThan(longString.length + 20)
  })

  it('should handle undefined path', () => {
    const json = { user: { name: 'Alice' } }
    expect(getValueByPath(json, '$.user.missing')).toBe('undefined')
  })

  it('should handle array index out of bounds', () => {
    const json = { items: [1, 2, 3] }
    expect(getValueByPath(json, '$.items.[5]')).toBe('undefined')
  })
})

describe('JSON Size Limits', () => {
  it('should identify JSON larger than 10MB', () => {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    const smallJson = '{"data": "x"}'
    const largeJson = '{"data": "' + 'x'.repeat(MAX_SIZE) + '"}'
    expect(smallJson.length).toBeLessThan(MAX_SIZE)
    expect(largeJson.length).toBeGreaterThan(MAX_SIZE)
  })
})