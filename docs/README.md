# 儿童单词卡片生成工具

## 📌 项目背景

我正在为我的孩子开发一个网页应用，用于生成"单词卡片"。这些卡片将被导出为 PDF 或图片，用于打印、剪裁和正反面对齐使用。用户可以通过上传 CSV 或手动输入单词的方式添加内容。

每张卡片正面包括：单词、图片、音标、自然拼读、词性  
每张卡片背面包括：词性、中文释义、英文例句及对应的中文解释

### 🚀 核心特性
- **AI智能补全**：使用GPT-4o-mini模型自动生成音标、释义、例句、词性
- **自然拼读拆分**：基于专业规则自动生成音节拆分，符合教学标准
- **图片自动搜索**：基于Pexels API自动获取高质量相关图片
- **批量处理**：支持单个和批量补全，提升制作效率
- **实时预览**：所见即所得的卡片预览效果
- **精确打印**：A4纸张优化，支持双面打印
- **数据审核流程**：三阶段工作流确保数据质量
- **图片管理**：支持重新生成图片，提供新旧图片对比选择

### 🎯 目标用户
- 主要用户：家长和英语教师
- 使用场景：为儿童制作英语学习卡片
- 核心需求：快速生成高质量、可打印的单词卡片

## ⚙️ 技术栈

### 前端框架
- **Next.js 15.2.4** (App Router) - React 框架
- **TypeScript 5** - 类型安全
- **React 19** - 用户界面库

### 样式与UI
- **Tailwind CSS 4.1.9** - 实用优先的CSS框架
- **shadcn/ui** - 基于Radix UI的组件库
- **Geist** - 字体系统

### 核心功能库
- **pdf-lib** - 精准A4布局PDF导出
- **papaparse** - CSV文件解析
- **html2canvas** - 网页截图功能

### AI服务集成
- **OpenRouter API** - 文本字段智能补全（GPT-4o-mini模型）
- **Pexels API** - 单词配图自动获取（高质量免费图片）

### 开发工具
- **pnpm/npm** - 包管理器
- **ESLint** - 代码质量检查

## 📂 数据结构

### 单词卡片字段说明

每个单词数据对象包含以下字段：

| 字段名 | 类型 | 用途 | 展示面 | 补全来源 |
|--------|------|------|--------|----------|
| `word` | string | 单词本身 | 正面 | 用户输入 |
| `phonetic` | string | 音标 | 正面 | OpenRouter API |
| `phonics` | string | 自然拼读拆解 | 正面 | 用户输入 |
| `pos` | string | 词性 | 正面 | OpenRouter API |
| `imageUrl` | string | 单词对应图片地址 | 正面 | Pexels API |
| `chinese` | string | 中文释义 | 反面 | OpenRouter API |
| `example` | string | 英文例句 | 反面 | OpenRouter API |
| `translation` | string | 中文例句翻译 | 反面 | OpenRouter API |

### 数据存储
- 使用 React `useState` 管理应用状态
- 使用 `localStorage` 进行客户端数据持久化
- 无需后端服务器，纯前端应用

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

## ✅ 功能流程（MVP阶段）

### 1. 数据输入阶段
- **手动添加**：用户可选择显示示例单词，逐个添加单词数据
- **CSV上传**：支持批量导入单词词条
- **格式支持**：标准CSV格式，包含所有字段（包括词性）

### 2. 数据审核阶段
- **AI智能补全**：自动补全所有缺失字段
- **进度跟踪**：实时显示补全进度和状态信息
- **表格编辑**：在紧凑的表格中编辑所有字段内容
- **图片管理**：支持重新生成图片，提供新旧图片对比选择
- **数据验证**：确保所有必要字段完整和准确

### 3. 数据确认阶段
- **数据确认**：确认所有字段内容无误
- **实时预览**：卡片正反面样式实时展示
- **布局预览**：展示最终打印效果
- **响应式设计**：适配不同屏幕尺寸

### 4. 导出打印阶段
- **PDF导出**：精准对齐，正反面对称
- **打印优化**：针对A4纸张优化，2×3网格布局

## 🖨️ 导出要求

### PDF导出规格
- **页面尺寸**：A4（210mm × 297mm）
- **卡片尺寸**：75mm × 90mm
- **布局方式**：2列3行，每页6张卡片
- **间距控制**：左右间距10mm，上下间距6mm
- **打印优化**：支持双面打印，正反面精确对齐

### 卡片布局
- **正面内容**：单词、音标、拼读拆分、词性、图片
- **反面内容**：词性、中文释义、英文例句、中文翻译
- **词性显示**：在中文释义前显示词性字段，保持适当间距

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

## 🎴 核心组件架构

### CardPreview 组件
- **统一卡片渲染**：所有场景使用相同的卡片组件
- **多模式支持**：preview/print 两种渲染模式
- **尺寸配置**：使用 config/cardConfig.ts 统一配置
- **内容控制**：可选择性显示图片、音标、例句等
- **词性显示**：在中文释义前显示词性字段

### DataReviewDialog 组件
- **数据审核界面**：紧凑的表格格式显示所有单词
- **字段编辑**：支持编辑所有字段内容
- **AI补全**：一键生成所有缺失字段
- **进度跟踪**：实时显示补全进度和状态
- **图片管理**：集成图片重新生成功能

### ImageSelectionDialog 组件
- **图片选择界面**：显示当前图片和新生成的图片
- **重新生成**：调用API生成新的图片
- **对比选择**：用户可对比新旧图片并选择
- **状态管理**：智能管理图片生成和选择状态

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

## ⚙️ 配置管理

### 卡片尺寸配置
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
  paddingTop: 6, paddingBottom: 10, paddingSide: 10, // 边距
};
```

### 配置生效范围
- ✅ 网页预览卡片尺寸
- ✅ 打印预览卡片尺寸
- ✅ PDF导出卡片尺寸
- ✅ 所有场景的布局参数

## 🔑 API 配置

为了使用字段自动补全功能，需要配置以下 API 密钥：

### 环境变量配置
创建 `.env.local` 文件：

```bash
# OpenRouter API密钥（用于文本字段补全）
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key

# Pexels API密钥（用于图片搜索）
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key
```

### API 服务说明
1. **OpenRouter API** - 用于补全文本字段（音标、释义、例句、翻译、词性）
2. **Pexels API** - 用于搜索相关图片

详细配置说明请查看 [API 配置文档](./API_SETUP.md)

## 📋 开发计划

### 🎯 MVP 版本（已完成）

专注于核心功能环节：
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

创建 `.env.local` 文件并配置API密钥：

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