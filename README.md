# 单词卡片制作工具

一个为孩子学习英语设计的单词卡片制作工具，支持批量导入、编辑、预览和导出打印功能。

## ✨ 功能特性

- 📁 **CSV 批量导入** - 支持上传 CSV 文件批量导入单词数据
- ➕ **手动添加** - 点击按钮添加新的单词条目
- ✏️ **表格编辑** - 直观的表格界面编辑所有单词字段
- 👀 **实时预览** - 实时预览卡片的正反面效果
- 🖨️ **导出打印** - 支持导出为 PDF/JPG 格式，优化打印布局

## 🛠️ 技术栈

- **框架**: Next.js 15.2.4 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.1.9
- **UI 组件**: shadcn/ui
- **状态管理**: React Hooks
- **数据存储**: localStorage

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用说明

### 单词字段说明

每个单词卡片包含以下字段：

| 字段名 | 用途 | 展示面 |
|--------|------|--------|
| word | 单词本身 | 正面 |
| phonetic | 音标 | 正面 |
| phonics | 拼读拆分 | 正面 |
| imageUrl | 相关图片 | 正面 |
| chinese | 中文释义 | 反面 |
| example | 英文例句 | 反面 |
| translation | 例句翻译 | 反面 |

### CSV 导入格式

支持的 CSV 格式：
```csv
word,phonetic,phonics,chinese,example,translation,imageUrl
apple,/ˈæpəl/,ap-ple,苹果,I eat an apple every day.,我每天吃一个苹果。,
```

## 📁 项目结构

```
word-cards-workspace/
├── app/                    # Next.js App Router 页面
│   ├── workspace/         # 主要工作页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # UI 组件
│   ├── ui/               # shadcn/ui 基础组件（精简版）
│   ├── completion-button.tsx      # 单个补全按钮
│   └── bulk-completion-button.tsx # 批量补全按钮
├── hooks/                 # React Hooks
│   └── use-completion.ts  # 补全功能 Hook
├── lib/                   # 工具函数
│   └── api.ts            # API 调用工具
├── docs/                  # 项目文档
│   ├── MVP_TASKS.md      # MVP 任务清单
│   └── API_SETUP.md      # API 配置说明
├── public/                # 静态资源
└── styles/                # 样式文件
```

## 🔑 API 配置

为了使用字段自动补全功能，需要配置以下 API 密钥：

1. **OpenRouter API** - 用于补全文本字段（音标、释义、例句、翻译）
2. **Pexels API** - 用于搜索相关图片

详细配置说明请查看 [API 配置文档](./docs/API_SETUP.md)

## 📋 开发计划

### 🎯 MVP 版本（当前开发中）

专注于五个核心功能环节：
- 📁 **上传** - CSV文件批量导入
- ✏️ **编辑** - 表格编辑单词数据  
- 👀 **预览** - 实时预览卡片效果
- 🖨️ **导出** - PDF/JPG导出功能
- 🤖 **补全** - AI自动补全缺失字段

详细的MVP任务清单请查看 [docs/MVP_TASKS.md](./docs/MVP_TASKS.md)



### 当前状态

- ✅ 项目基础架构搭建完成
- ✅ 页面界面结构完成
- ✅ 基础组件集成完成
- 🔄 MVP功能逻辑开发中...

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [v0](https://v0.dev/) - AI 驱动的 UI 生成工具

---

**注意**: 这是一个前端项目，所有数据保存在浏览器本地存储中，无需后端服务器。 