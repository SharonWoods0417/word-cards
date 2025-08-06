# API 配置说明

## 🔑 必需的 API 密钥

为了使用字段自动补全功能，需要配置以下 API 密钥：

### 1. OpenRouter API

**用途**: 补全文本字段（音标、中文释义、例句、翻译）

**获取步骤**:
1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册并登录账户
3. 进入 [API Keys](https://openrouter.ai/keys) 页面
4. 创建新的 API 密钥
5. 复制密钥到环境变量

**环境变量**:
```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Pexels API

**用途**: 搜索相关图片

**获取步骤**:
1. 访问 [Pexels API](https://www.pexels.com/api/)
2. 注册并登录账户
3. 创建新的 API 密钥
4. 复制密钥到环境变量

**环境变量**:
```bash
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
```

## ⚙️ 环境变量配置

### 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# .env.local
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
NEXT_PUBLIC_APP_NAME=单词卡片制作工具
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 注意事项

1. **文件位置**: `.env.local` 文件应放在项目根目录
2. **Git 忽略**: `.env.local` 已被添加到 `.gitignore`，不会被提交到版本控制
3. **重启服务**: 修改环境变量后需要重启开发服务器
4. **前缀要求**: 客户端使用的环境变量必须以 `NEXT_PUBLIC_` 开头

## 🧪 测试 API 配置

### 检查配置状态

在浏览器控制台中运行以下代码检查 API 配置：

```javascript
// 检查 API 配置
console.log('OpenRouter API:', !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);
console.log('Pexels API:', !!process.env.NEXT_PUBLIC_PEXELS_API_KEY);
```

### 功能测试

1. **文本补全测试**:
   - 添加一个只有单词的条目
   - 点击补全按钮
   - 检查是否自动填充了音标、释义、例句等

2. **图片补全测试**:
   - 添加一个没有图片的条目
   - 点击补全按钮
   - 检查是否自动填充了图片URL

## 💰 API 费用说明

### OpenRouter API
- **免费额度**: 通常有免费使用额度
- **计费方式**: 按 token 使用量计费
- **成本控制**: 建议设置使用限制

### Pexels API
- **免费额度**: 通常有免费使用额度
- **计费方式**: 按请求次数计费
- **成本控制**: 建议设置使用限制

## 🔧 故障排除

### 常见问题

1. **API 密钥无效**
   - 检查密钥是否正确复制
   - 确认密钥是否已激活
   - 检查账户余额

2. **请求被拒绝**
   - 检查 API 使用限制
   - 确认请求格式正确
   - 检查网络连接

3. **补全功能不工作**
   - 检查环境变量是否正确设置
   - 确认开发服务器已重启
   - 查看浏览器控制台错误信息

### 调试步骤

1. 打开浏览器开发者工具
2. 查看 Console 标签页的错误信息
3. 查看 Network 标签页的 API 请求
4. 检查环境变量是否正确加载

## 📚 相关文档

- [OpenRouter API 文档](https://openrouter.ai/docs)
- [Pexels API 文档](https://www.pexels.com/api/)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables) 