// API 工具函数 - 字段自动补全功能

// 环境变量类型定义
interface ApiConfig {
  openRouterApiKey?: string;
  pexelsApiKey?: string;
}

// 补全字段类型
export type CompletionField = 'phonetic' | 'chinese' | 'example' | 'translation' | 'imageUrl';

// 补全请求参数
export interface CompletionRequest {
  word: string;
  fields: CompletionField[];
}

// 补全响应结果
export interface CompletionResponse {
  success: boolean;
  data?: {
    phonetic?: string;
    chinese?: string;
    example?: string;
    translation?: string;
    imageUrl?: string;
  };
  error?: string;
}

// OpenRouter API 配置
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Pexels API 配置
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

/**
 * 获取 API 配置
 */
export function getApiConfig(): ApiConfig {
  return {
    openRouterApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    pexelsApiKey: process.env.NEXT_PUBLIC_PEXELS_API_KEY,
  };
}

/**
 * 检查 API 配置是否完整
 */
export function checkApiConfig(): { openRouter: boolean; pexels: boolean } {
  const config = getApiConfig();
  return {
    openRouter: !!config.openRouterApiKey,
    pexels: !!config.pexelsApiKey,
  };
}

/**
 * 使用 OpenRouter API 补全文本字段
 * @param word 单词
 * @param fields 需要补全的字段
 */
export async function completeTextFields(
  word: string,
  fields: ('phonetic' | 'chinese' | 'example' | 'translation')[]
): Promise<CompletionResponse> {
  try {
    const config = getApiConfig();
    if (!config.openRouterApiKey) {
      return { success: false, error: 'OpenRouter API key not configured' };
    }

    // TODO: 实现 OpenRouter API 调用
    // 这里将根据字段类型生成不同的提示词
    const prompts = fields.map(field => {
      switch (field) {
        case 'phonetic':
          return `请为英文单词 "${word}" 提供准确的音标，格式为 /音标/`;
        case 'chinese':
          return `请为英文单词 "${word}" 提供准确的中文释义`;
        case 'example':
          return `请为英文单词 "${word}" 提供一个简单易懂的英文例句`;
        case 'translation':
          return `请为英文单词 "${word}" 的例句提供准确的中文翻译`;
        default:
          return '';
      }
    });

    // 模拟 API 调用（实际实现时替换）
    console.log('OpenRouter API 调用:', { word, fields, prompts });
    
    return {
      success: true,
      data: {
        phonetic: fields.includes('phonetic') ? `/${word}/` : undefined,
        chinese: fields.includes('chinese') ? `${word}的中文意思` : undefined,
        example: fields.includes('example') ? `This is an example sentence for ${word}.` : undefined,
        translation: fields.includes('translation') ? `这是${word}的例句翻译。` : undefined,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 使用 Pexels API 搜索图片
 * @param word 单词
 */
export async function searchImage(word: string): Promise<CompletionResponse> {
  try {
    const config = getApiConfig();
    if (!config.pexelsApiKey) {
      return { success: false, error: 'Pexels API key not configured' };
    }

    // TODO: 实现 Pexels API 调用
    console.log('Pexels API 调用:', { word });
    
    // 模拟 API 调用（实际实现时替换）
    return {
      success: true,
      data: {
        imageUrl: `https://example.com/images/${word}.jpg`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 批量补全单词的所有缺失字段
 * @param word 单词对象
 */
export async function completeAllFields(word: any): Promise<CompletionResponse> {
  try {
    const missingFields: CompletionField[] = [];
    
    // 检查缺失的文本字段
    if (!word.phonetic) missingFields.push('phonetic');
    if (!word.chinese) missingFields.push('chinese');
    if (!word.example) missingFields.push('example');
    if (!word.translation) missingFields.push('translation');
    
    // 检查缺失的图片字段
    const needsImage = !word.imageUrl;
    
    // 补全文本字段
    const textFields = missingFields.filter(field => 
      ['phonetic', 'chinese', 'example', 'translation'].includes(field)
    ) as ('phonetic' | 'chinese' | 'example' | 'translation')[];
    
    const textResult = textFields.length > 0 
      ? await completeTextFields(word.word, textFields)
      : { success: true, data: {} };
    
    // 补全图片字段
    const imageResult = needsImage 
      ? await searchImage(word.word)
      : { success: true, data: {} };
    
    // 合并结果
    return {
      success: textResult.success && imageResult.success,
      data: {
        ...textResult.data,
        ...imageResult.data,
      },
      error: textResult.error || imageResult.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 批量补全多个单词
 * @param words 单词数组
 * @param onProgress 进度回调
 */
export async function completeMultipleWords(
  words: any[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; results: CompletionResponse[]; errors: string[] }> {
  const results: CompletionResponse[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    onProgress?.(i + 1, words.length);
    
    const result = await completeAllFields(word);
    results.push(result);
    
    if (!result.success) {
      errors.push(`单词 "${word.word}" 补全失败: ${result.error}`);
    }
    
    // 添加延迟避免 API 限制
    if (i < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return {
    success: errors.length === 0,
    results,
    errors,
  };
} 