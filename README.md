# 单词卡片制作工具

一个为孩子学习英语设计的单词卡片制作工具，支持批量导入、AI智能补全、数据审核、预览和导出打印功能。

## ✨ 功能特性

- 📁 **CSV 批量导入** - 支持上传 CSV 文件批量导入单词数据
- ➕ **手动添加** - 点击按钮添加新的单词条目
- ✏️ **表格编辑** - 直观的表格界面编辑所有单词字段
- 🤖 **AI智能补全** - 使用GPT-4o-mini自动生成音标、释义、例句、词性
- 🖼️ **智能图片搜索** - 基于Pexels API自动获取相关图片
- 🔄 **数据审核流程** - 三阶段工作流：输入→审核→确认生成
- 👀 **实时预览** - 实时预览卡片的正反面效果
- 🖨️ **打印预览** - 专业的A4纸打印预览，支持正反面布局
- 📄 **PDF导出** - 支持导出为PDF格式，优化打印布局
- 🎴 **统一组件** - 使用 CardPreview 组件确保预览和打印效果一致
- ⚙️ **统一配置** - 一次配置，处处生效的卡片尺寸管理

## 🎯 统一卡片尺寸配置

### 核心特性
- **一次配置，处处生效** - 所有场景使用统一的卡片尺寸配置
- **等比缩放** - 网页预览和打印预览保持完全一致的视觉效果
- **物理尺寸** - 使用毫米(mm)单位确保打印精度

### 配置中心
所有卡片尺寸和布局参数集中在 `config/cardConfig.ts`：

```typescript
export const cardDimensions = {
  preview: { width: 75, height: 90, unit: 'mm' }, // 网页展示
  print: { width: 75, height: 90, unit: 'mm' },   // 打印/导出
};

export const pageConfig = {
  a4: { width: 210, height: 297, unit: 'mm' },    // A4纸
  cols: 2, rows: 3,                               // 2×3网格
  card: { width: 75, height: 90, unit: 'mm' },    // 卡片尺寸
  colGap: 10, rowGap: 6,                          // 间距
  paddingTop: 6, paddingBottom: 9, paddingSide: 10, // 边距
};
```

## 🔄 三阶段工作流程

### 阶段一：数据输入（Input）
- **手动添加单词** - 点击"添加新单词"按钮逐个添加
- **CSV批量导入** - 支持标准CSV格式文件上传
- **示例单词控制** - 可选择显示/隐藏示例单词
- **数据状态** - 原始输入数据存储在 `inputs` 状态中

### 阶段二：数据审核（Review）
- **AI字段补全** - 点击"生成全部字段"自动补全所有字段
- **进度跟踪** - 实时显示生成进度和状态
- **字段编辑** - 可修改所有自动生成的字段内容
- **图片管理** - 支持重新生成图片，提供新旧图片对比选择
- **数据验证** - 确保所有必要字段完整
- **数据状态** - 审核数据存储在 `reviewWords` 状态中

### 阶段三：确认生成（Preview/Print）
- **数据确认** - 点击"确认生成卡片"进入预览阶段
- **卡片预览** - 实时预览所有卡片的正反面效果
- **打印布局** - A4纸张优化，2×3网格排列
- **PDF导出** - 高质量PDF文件，支持双面打印
- **数据状态** - 确认数据存储在 `confirmed` 状态中

## 🖨️ 打印预览功能

### 布局特性
- **A4 纸张布局** - 210mm × 297mm 标准A4尺寸
- **2×3 网格排列** - 每页6张卡片，2列3行布局
- **卡片尺寸** - 75mm × 90mm，适合裁剪使用
- **间距优化** - 左右间距10mm，上下间距6mm
- **居中显示** - 卡片区域在A4纸上自动居中
- **等比缩放** - 网页预览和打印预览完全一致

### 预览模式
- **正面预览** - 显示单词、音标、拼读、图片
- **反面预览** - 显示词性、中文释义、例句、翻译
- **实时缩放** - 支持动态缩放比例，适配不同屏幕
- **尺寸提示** - 在页面标题旁显示当前卡片尺寸
- **调试模式** - 可切换显示详细的布局参数

## 📄 PDF导出功能

### 统一布局
- **与打印预览一致** - PDF导出使用相同的布局参数
- **毫米转点转换** - 自动将mm单位转换为pt单位
- **精确排版** - 确保PDF中的卡片位置和打印预览完全一致

### 导出设置
- **A4纸张** - 标准A4尺寸 (210mm × 297mm)
- **卡片尺寸** - 75mm × 90mm
- **网格布局** - 2列3行，每页6张卡片
- **间距控制** - 左右10mm，上下6mm间距

## 🤖 AI智能补全功能

### OpenRouter API集成
- **补全字段**：音标(phonetic)、中文释义(chinese)、例句(example)、翻译(translation)、词性(pos)
- **模型**：GPT-4o-mini，专业英语教学助手
- **提示词优化**：针对儿童学习场景的专业提示词
- **批量处理**：支持单个和批量补全，提升效率

### Pexels API集成
- **图片搜索**：基于单词语义搜索相关图片
- **图片质量**：优先选择高质量、相关度高的图片
- **重新生成**：支持不满意时重新生成新图片
- **图片选择**：提供新旧图片对比，用户可自由选择

### 用户体验优化
- **进度显示** - 实时显示补全进度和状态
- **错误处理** - 完善的错误提示和重试机制
- **状态管理** - 智能状态管理，避免重复请求
- **数据持久化** - 补全结果自动保存到本地存储

## 🛠️ 技术栈

- **框架**: Next.js 15.2.4 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4.1.9
- **UI 组件**: shadcn/ui (基于Radix UI)
- **状态管理**: React Hooks (useState, useEffect, useCallback, useRef)
- **数据存储**: localStorage
- **PDF生成**: pdf-lib
- **CSV解析**: papaparse
- **AI服务**: OpenRouter API (GPT-4o-mini), Pexels API

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

### 环境配置

创建 `.env.local` 文件并配置API密钥（命名与代码一致，使用 NEXT_PUBLIC_*）：

```bash
# OpenRouter API密钥（用于文本字段补全）
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key

# Pexels API密钥（用于图片搜索）
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key
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

| 字段名 | 用途 | 展示面 | 补全来源 |
|--------|------|--------|----------|
| word | 单词本身 | 正面 | 用户输入 |
| phonetic | 音标 | 正面 | OpenRouter API |
| phonics | 拼读拆分 | 正面 | 用户输入 |
| pos | 词性 | 正面 | OpenRouter API |
| imageUrl | 相关图片 | 正面 | Pexels API |
| chinese | 中文释义 | 反面 | OpenRouter API |
| example | 英文例句 | 反面 | OpenRouter API |
| translation | 例句翻译 | 反面 | OpenRouter API |

### 工作流程使用

1. **添加单词** - 手动输入或上传CSV文件
2. **生成字段** - 点击"生成全部字段"自动补全所有字段
3. **审核修改** - 在审核界面检查和修改所有字段内容
4. **图片管理** - 不满意时可重新生成图片并选择
5. **确认生成** - 点击"确认生成卡片"进入预览阶段
6. **预览打印** - 查看最终效果并导出PDF

### CSV 导入格式

支持的 CSV 格式：
```csv
word,phonetic,phonics,chinese,pos,example,translation,imageUrl
apple,/ˈæpəl/,ap-ple,苹果,n.,I eat an apple every day.,我每天吃一个苹果。,
book,/bʊk/,b-ook,书,n.,She is reading a book.,她正在读一本书。,
```

## 📁 项目结构

```
word-cards-workspace/
├── app/                    # Next.js App Router 页面
│   ├── workspace/         # 主要工作页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # UI 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── CardPreview.tsx   # 统一卡片预览组件
│   ├── completion-button.tsx      # 单个补全按钮
│   ├── bulk-completion-button.tsx # 批量补全按钮
│   ├── data-review-dialog.tsx     # 数据审核对话框
│   └── image-selection-dialog.tsx # 图片选择对话框
├── config/               # 配置文件
│   └── cardConfig.ts     # 卡片尺寸和布局配置
├── hooks/                 # React Hooks
│   └── use-completion.ts  # 补全功能 Hook
├── lib/                   # 工具函数
│   ├── api.ts            # API 调用工具
│   ├── utils.ts          # 通用工具函数
│   └── phonics.ts        # 自然拼读拆分工具
├── docs/                  # 项目文档
│   ├── README.md         # 详细项目文档
│   ├── API_SETUP.md      # API 配置说明
│   ├── CHANGELOG.md      # 更新日志
│   └── EXPORT_GUIDE.md   # 导出功能指南
├── public/                # 静态资源
└── styles/                # 样式文件
```

## 🎴 CardPreview 组件

### 功能特性
- **多模式支持** - preview/print 两种渲染模式
- **统一尺寸** - 使用 config/cardConfig.ts 统一配置
- **内容控制** - 可选择性显示图片、音标、例句等
- **打印优化** - 针对A4打印优化的样式和布局
- **词性显示** - 在中文释义前显示词性字段

### 使用示例
```tsx
<CardPreview
  data={wordData}
  mode="print"
  showImage={true}
  showPhonetic={true}
  showChinese={true}
  showPos={true}
/>
```

## ⚙️ 配置管理

### 卡片尺寸配置
修改 `config/cardConfig.ts` 来调整所有场景的卡片尺寸：

```typescript
// 调整卡片尺寸
export const cardDimensions = {
  preview: { width: 75, height: 90, unit: 'mm' },
  print: { width: 75, height: 90, unit: 'mm' },
};

// 调整页面布局
export const pageConfig = {
  cols: 2,        // 列数
  rows: 3,        // 行数
  colGap: 10,     // 列间距(mm)
  rowGap: 6,      // 行间距(mm)
  // ... 其他配置
};
```

### 配置生效范围
- ✅ 网页预览卡片尺寸
- ✅ 打印预览卡片尺寸
- ✅ PDF导出卡片尺寸
- ✅ 所有场景的布局参数

## 🔑 API 配置

为了使用字段自动补全功能，需要配置以下 API 密钥：

1. **OpenRouter API** - 用于补全文本字段（音标、释义、例句、翻译、词性）
2. **Pexels API** - 用于搜索相关图片

详细配置说明请查看 [API 配置文档](./docs/API_SETUP.md)

## 📋 开发计划

### 🎯 MVP 版本（已完成）

专注于五个核心功能环节：
- ✅ **上传** - CSV文件批量导入
- ✅ **编辑** - 表格编辑单词数据  
- ✅ **预览** - 实时预览卡片效果
- ✅ **导出** - PDF导出功能
- ✅ **补全** - AI自动补全缺失字段
- ✅ **审核流程** - 三阶段数据审核工作流
- ✅ **图片管理** - 智能图片搜索和重新生成

### 当前状态

- ✅ 项目基础架构搭建完成
- ✅ 页面界面结构完成
- ✅ 基础组件集成完成
- ✅ 打印预览功能完成
- ✅ 统一卡片尺寸配置完成
- ✅ PDF导出功能完成
- ✅ MVP功能逻辑完成
- ✅ AI智能补全功能完成
- ✅ 数据审核流程完成
- ✅ 图片管理功能完成

### 下一步计划

- 🔄 性能优化和用户体验改进
- 🔄 更多导出格式支持
- 🔄 高级编辑功能
- 🔄 数据导入导出增强

## 🎯 贡献指南

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
- [pdf-lib](https://pdf-lib.js.org/) - PDF 生成库
- [OpenRouter](https://openrouter.ai/) - AI API 服务
- [Pexels](https://www.pexels.com/) - 高质量图片资源

---

**注意**: 这是一个前端项目，所有数据保存在浏览器本地存储中，无需后端服务器。AI功能需要配置相应的API密钥。 