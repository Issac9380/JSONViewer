# JSON Viewer 桌面工具 — 设计规格说明

## 概述

一个基于 Electron 的 Windows 桌面 JSON 查看与编辑工具。支持粘贴、格式化、树形浏览、语法校验、搜索替换、文件拖放打开、深色/浅色主题切换及导出。

## 技术栈

| 层 | 选型 | 版本 |
|-----|------|------|
| 框架 | React + TypeScript | React 18, TS 5.x |
| 编辑器 | @monaco-editor/react | 最新稳定版 |
| UI 组件库 | Ant Design 5 | 5.x |
| 构建 | Vite + electron-vite | 最新稳定版 |
| 打包 | electron-builder | 最新稳定版 |
| 导出 | html-to-image + jspdf | 最新稳定版 |

## 界面布局

**左右分栏（可拖拽调整宽度）：**
- 左侧（默认 60%）：Monaco Editor 编辑区
- 右侧（默认 40%）：Ant Design Tree 树形视图
- 顶部：工具栏（格式化、复制、导出、主题切换）
- 底部：状态栏（校验状态、选中节点信息）

## 核心功能

### 1. JSON 格式化与编辑
- Monaco Editor 语言模式设为 JSON
- 粘贴原始 JSON 自动解析并格式化（`JSON.stringify(parsed, null, 2)`）
- 快捷键 Ctrl+Shift+F 手动格式化
- 支持手动编辑 JSON 内容

### 2. 语法高亮与错误校验
- Monaco 原生 JSON schema 校验
- 错误行红色波浪线标注
- 状态栏显示校验结果：✅ JSON 有效 / ❌ 第 X 行: 错误描述

### 3. 树形折叠展开
- Ant Design Tree 渲染 JSON 结构（对象/数组/基本值）
- 全部展开 / 全部折叠 / 按层级折叠（默认展开到第 5 层）
- 点击节点在状态栏显示 JSON 路径和值

### 4. 搜索替换
- Monaco 原生 Ctrl+F（搜索）和 Ctrl+H（替换）
- 支持正则表达式、大小写匹配

### 5. 文件拖放打开
- 窗口监听 drag/drop 事件
- 接受 `.json`、`.txt` 文件
- 拖入后自动读入编辑器并尝试解析

### 6. 主题切换
- 深色/浅色一键切换
- Monaco 和 Ant Design 同步应用主题

### 7. 一键复制
- 工具栏"复制"按钮，复制编辑器中的格式化 JSON 到剪贴板

### 8. 导出
- 树形区域导出为 PNG / PDF 格式
- 编辑器内容可通过"另存为"保存为 `.json` 文件

## 组件架构

```
App
├── TitleBar (自定义标题栏，窗口控制：最小化/最大化/关闭)
├── Toolbar
│   ├── ThemeToggle (深色/浅色切换)
│   ├── CopyBtn (复制格式化 JSON)
│   ├── ExportMenu (PNG/PDF 导出 / 另存为文件)
│   └── FormatBtn (手动格式化)
├── MainLayout (左右分栏，可拖拽调整宽度)
│   ├── EditorPanel (左)
│   │   └── MonacoEditor
│   └── TreePanel (右)
│       ├── TreeToolbar (全部展开/折叠/按层级折叠)
│       └── JsonTree (Ant Design Tree)
└── StatusBar
    ├── ValidationStatus (✅ 有效 / ❌ 错误信息)
    └── NodeInfo (当前选中节点的 JSON 路径和值)
```

## 数据流

1. Editor 内容变更 → 尝试 JSON.parse → 成功则更新 Tree 数据和校验状态（✅）
2. 解析失败 → Tree 保持上次有效数据，校验状态显示错误信息
3. Tree 选中节点 → 回传节点路径信息到 StatusBar
4. 主题状态 → React Context（ConfigProvider）全局共享
5. 文件拖放 → IPC 读取文件 → 写入 Editor → 触发解析 → 更新 Tree
6. 窗口 resize → 自动重排编辑器布局

## 边界情况处理

| 场景 | 处理方式 |
|------|---------|
| 空输入 | 编辑器显示 placeholder "粘贴 JSON 字符串或拖放 JSON 文件…"，树形区显示空状态提示 |
| 非法 JSON | Monaco 红色波浪线标注错误位置，状态栏显示具体错误信息 |
| 超大 JSON（>10MB） | 不自动解析，状态栏提示"JSON 过大（>10MB），点击格式化按钮以解析" |
| 非 JSON 文件拖入 | 内容读入编辑器，状态栏提示"内容不是有效 JSON" |
| 数组根节点 JSON | 正常渲染，Tree 根节点显示为 `[N items]` |
| 深层嵌套（>20 层） | Tree 默认折叠到第 5 层，点击可逐层展开 |
| null 值 | 编辑器和 Tree 均显示为 `null` |
| Unicode / emoji | 编辑器和 Tree 均正常显示 |

## 非功能需求

- 应用启动时间 < 3 秒
- 格式化 1MB JSON 响应时间 < 1 秒
- 支持 Windows 10 及以上系统
- 单个便携 EXE 文件（或标准安装包）

## 不做（YAGNI）

- JSON Schema 验证
- 多标签页
- 历史记录/最近文件
- JSON Path 查询
- 云同步
- Diff 对比
- 插件系统
