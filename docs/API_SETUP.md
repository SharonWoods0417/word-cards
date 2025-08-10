# API 配置说明

## 概述

单词卡片制作工具需要配置以下 API 密钥来启用自动补全功能：

1. **OpenRouter API** - 用于补全文本字段（音标、释义、例句、翻译）
2. **Pexels API** - 用于搜索相关图片

## 环境变量配置

在项目根目录创建 `.env.local` 文件（与代码一致，使用 NEXT_PUBLIC_* 命名）：

```bash
# OpenRouter API 配置（文本补全）
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
# 可选：如需自定义接口域名
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Pexels API 配置（图片搜索）
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
```

提示：修改 `.env.local` 后需重启开发服务器；可访问 `/api-test` 页面查看加载状态。

## API 服务配置

### 1. OpenRouter API

**用途**: 自动补全单词的音标、中文释义、英文例句和翻译

**获取方式**:
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并获取 API 密钥
3. 将密钥添加到环境变量

**支持的模型**:
- GPT-4
- Claude-3
- 其他 OpenRouter 支持的模型

### 2. Pexels API

**用途**: 根据单词搜索相关的高质量图片

**获取方式**:
1. 访问 [Pexels](https://www.pexels.com/api/)
2. 注册开发者账号
3. 获取 API 密钥

**图片特性**:
- 免费商用授权
- 高质量图片
- 支持多种尺寸

## 功能特性

### 自动补全功能

- **音标生成** - 自动生成标准音标
- **中文释义** - 提供准确的中文翻译
- **例句生成** - 创建适合儿童的英文例句
- **翻译补全** - 自动翻译例句为中文

### 图片搜索功能

- **智能匹配** - 根据单词自动搜索相关图片
- **质量筛选** - 优先显示高质量图片
- **尺寸适配** - 自动调整图片尺寸适配卡片

### 打印预览功能

- **A4 布局优化** - 210mm × 297mm 标准纸张
- **2×3 网格排列** - 每页6张卡片
- **卡片尺寸** - 75mm × 90mm
- **间距控制** - 左右10mm，上下6mm
- **居中显示** - 自动居中布局
- **等比缩放** - 网页预览和打印预览完全一致

### 统一卡片尺寸配置

- **一次配置，处处生效** - 所有场景使用统一的卡片尺寸配置
- **物理尺寸** - 使用毫米(mm)单位确保打印精度
- **配置中心** - 所有参数集中在 `config/cardConfig.ts`

#### 配置示例
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

### PDF导出功能

- **与打印预览一致** - PDF导出使用相同的布局参数
- **毫米转点转换** - 自动将mm单位转换为pt单位
- **精确排版** - 确保PDF中的卡片位置和打印预览完全一致
- **A4纸张** - 标准A4尺寸 (210mm × 297mm)
- **网格布局** - 2列3行，每页6张卡片

## 故障排除

### 常见问题

1. **API 密钥无效**
   - 检查密钥是否正确复制
   - 确认 API 服务是否正常

2. **补全功能不工作**
   - 检查网络连接
   - 验证 API 配额是否充足

3. **图片加载失败**
   - 检查 Pexels API 密钥
   - 确认图片 URL 是否有效

4. **卡片尺寸不一致**
   - 检查 `config/cardConfig.ts` 配置
   - 确认所有场景使用相同的配置参数

### 调试模式

启用调试模式查看详细错误信息：

```bash
# 在 .env.local 中添加
DEBUG=true
```

## 更新日志

### v1.4.0 (最新)
- ✅ 统一卡片尺寸配置，实现"一次配置，处处生效"
- ✅ 网页预览和打印预览等比缩放，视觉效果完全一致
- ✅ PDF导出功能与打印预览布局完全一致
- ✅ 新增 config/cardConfig.ts 配置中心
- ✅ 优化A4纸布局和卡片尺寸管理

### v1.3.0
- ✅ 新增打印预览功能
- ✅ 实现 CardPreview 统一组件
- ✅ 优化A4纸布局和卡片尺寸
- ✅ 添加实时缩放和尺寸提示

### v1.2.0
- ✅ 实现自动补全功能
- ✅ 集成图片搜索
- ✅ 支持 CSV 批量导入

### v1.1.0
- ✅ 基础单词卡片制作功能
- ✅ 表格编辑界面
- ✅ 实时预览功能

### v1.0.0
- ✅ 项目基础架构搭建
- ✅ 页面界面结构完成
- ✅ 基础组件集成完成 