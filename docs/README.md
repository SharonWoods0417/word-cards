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
- **Tailwind CSS 4.1.11** - 实用优先的CSS框架（使用@tailwindcss/postcss插件）
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

## 🔧 当前环境配置

### 系统环境
- **操作系统**: macOS (darwin 24.6.0)
- **Node.js**: v22.16.0
- **npm**: v10.9.2
- **包管理器**: npm (主要使用)

### 依赖包版本详情

#### 核心依赖
```json
{
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "typescript": "^5"
}
```

#### Tailwind CSS 相关
```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.11",
    "postcss": "^8.5.6",
    "tw-animate-css": "1.3.3",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

#### UI组件库
```json
{
  "dependencies": {
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-tabs": "1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "geist": "^1.3.1",
    "lucide-react": "^0.454.0"
  }
}
```

#### 功能库
```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "papaparse": "^5.5.3",
    "pdf-lib": "^1.17.1",
    "react-to-print": "^3.1.1"
  }
}
```

### 配置文件详情

#### Tailwind CSS 配置 (tailwind.config.js)
```javascript
/** @type {import('@tailwindcss/postcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
```

#### PostCSS 配置 (postcss.config.mjs)
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

#### 全局样式 (app/globals.css)
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* CSS变量定义 */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* 其他颜色变量... */
}

/* 主题内联配置 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* 其他主题变量... */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 环境变量配置
项目使用 `.env.local` 文件存储环境变量（命名与代码一致，使用 NEXT_PUBLIC_*）：
- **NEXT_PUBLIC_OPENROUTER_API_KEY** - 用于AI文本字段补全（OpenRouter）
- **NEXT_PUBLIC_PEXELS_API_KEY** - 用于图片搜索（Pexels）

### 开发服务器配置
- **默认端口**: 3000
- **备用端口**: 3001 (当3000被占用时自动切换)
- **网络访问**: 支持局域网访问 (http://192.168.180.200:3000)
- **热重载**: 支持Fast Refresh和文件变更自动重载

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

### 4. 打印阶段
- **浏览器打印**：所见即所得（Chrome 推荐），可在打印对话框选择“保存为 PDF”
- **打印优化**：针对A4纸张优化，2×3网格布局

## 🖨️ 打印要求

### PDF导出规格
- **页面尺寸**：A4（210mm × 297mm）
- **卡片尺寸**：75mm × 90mm
- **布局方式**：2列3行，每页6张卡片
- **间距控制**：左右间距10mm，上下间距6mm
- **打印优化**：支持双面打印，正反面精确对齐（短边翻转）
  - 反面每行列顺序已反转，确保与正面对应
  - 可通过“背面 X/Y 偏移（mm）”微调走纸误差

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
  paddingTop: 6, paddingBottom: 9, paddingSide: 10, // 边距
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

## 🚨 故障排除

### Tailwind CSS 排版突然消失问题

#### 问题描述
在开发过程中，可能会遇到网页正常显示但突然失去所有排版样式的情况。这通常表现为：
- 页面内容正常显示，但没有任何样式
- 所有 Tailwind CSS 类都不生效
- 页面看起来像是纯HTML，没有CSS样式

#### 问题原因分析
经过实际测试和调试，排版突然消失的主要原因是：

1. **依赖包版本不一致**
   - `package.json` 中的依赖包版本与配置文件不匹配
   - Tailwind CSS v4 的包与 v3 的配置文件混用
   - PostCSS 插件配置与 Tailwind CSS 版本不匹配

2. **配置文件语法错误**
   - CSS 文件中使用了错误的 Tailwind 指令
   - 配置文件格式与当前版本不兼容
   - 缓存文件与新的配置不一致

3. **环境变化导致的兼容性问题**
   - 依赖包自动更新
   - 缓存不一致
   - 配置文件被意外修改

#### 解决方案

##### 立即修复
```bash
# 1. 停止开发服务器
pkill -f "next dev"

# 2. 清除构建缓存
rm -rf .next

# 3. 重新安装正确的依赖包
npm uninstall tailwindcss autoprefixer
npm install -D @tailwindcss/postcss

# 4. 重新启动服务器
npm run dev
```

##### 配置文件修复
确保以下文件使用正确的 v4 语法：

**`app/globals.css`**：
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* 其他样式... */

@theme inline {
  --color-background: var(--background);
  /* 其他颜色变量... */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**`tailwind.config.js`**：
```javascript
/** @type {import('@tailwindcss/postcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // 其他配置...
}
```

**`postcss.config.mjs`**：
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

#### 预防措施

##### 1. 锁定依赖包版本
```json
// 在 package.json 中使用精确版本
"@tailwindcss/postcss": "4.1.9"  // 而不是 "^4.1.9"
```

##### 2. 创建配置验证脚本
```bash
# 在 package.json 的 scripts 中添加
"scripts": {
  "verify-config": "node scripts/verify-config.js",
  "predev": "npm run verify-config"
}
```

##### 3. 定期清理缓存
```bash
# 添加到 package.json scripts
"scripts": {
  "clean": "rm -rf .next node_modules/.cache",
  "fresh-start": "npm run clean && npm install && npm run dev"
}
```

##### 4. 使用版本锁定文件
- 确保 `package-lock.json` 不被忽略
- 定期运行 `npm audit` 和 `npm outdated` 检查

##### 5. 环境隔离
- 使用 Docker 或容器化开发环境
- 使用 nvm 管理 Node.js 版本
- 避免全局安装可能冲突的包

#### 环境检查

在开始故障排除之前，请先检查基本环境：

```bash
# 检查Node.js版本
node --version  # 应该是 v22.16.0 或更高

# 检查npm版本
npm --version   # 应该是 v10.9.2 或更高

# 检查当前工作目录
pwd             # 应该显示项目根目录

# 检查依赖包是否正确安装
npm list --depth=0

# 检查关键配置文件是否存在
ls -la tailwind.config.js postcss.config.mjs app/globals.css
```

#### 故障排除检查清单
- [ ] 检查 `package.json` 中的依赖包版本
- [ ] 验证 `tailwind.config.js` 配置格式
- [ ] 确认 `postcss.config.mjs` 插件配置
- [ ] 检查 `app/globals.css` 语法
- [ ] 清除 `.next` 构建缓存
- [ ] 重启开发服务器
- [ ] 检查终端错误信息

#### 常见错误信息及解决方案

**错误**：`The 'border-border' class does not exist`
**原因**：CSS 文件中使用了 v4 语法但环境是 v3
**解决**：确保使用正确的 Tailwind CSS v4 配置

**错误**：`@tailwind base is no longer available in v4`
**原因**：CSS 文件使用了 v3 语法但环境是 v4
**解决**：将 `@tailwind base` 改为 `@import "tailwindcss"`

通过以上措施，可以有效预防和快速解决 Tailwind CSS 排版突然消失的问题。

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

- **Node.js**: v22.16.0 或更高版本
- **npm**: v10.9.2 或更高版本
- **操作系统**: 支持 macOS、Windows、Linux
- **内存**: 建议 8GB 或更多
- **磁盘空间**: 至少 2GB 可用空间

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 环境配置

创建 `.env.local` 文件并配置API密钥（与代码一致的命名）：

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

**注意**: 如果端口3000被占用，服务器会自动切换到端口3001，终端会显示实际使用的端口号。

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