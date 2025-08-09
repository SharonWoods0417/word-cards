// API 工具函数 - 字段自动补全功能
import { generatePhonicsSplit } from './phonics';

// 环境变量类型定义
interface ApiConfig {
  openRouterApiKey?: string;
  pexelsApiKey?: string;
}

// 补全字段类型
export type CompletionField = 'phonetic' | 'chinese' | 'example' | 'translation' | 'pos' | 'imageUrl';

// 补全请求参数
export interface CompletionRequest {
  word: string;
  fields: CompletionField[];
}

// 补全响应类型
export interface CompletionResponse {
  success: boolean;
  data?: {
    phonetic?: string;
    chinese?: string;
    example?: string;
    translation?: string;
    pos?: string;
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
  fields: ('phonetic' | 'chinese' | 'example' | 'translation' | 'pos')[]
): Promise<CompletionResponse> {
  try {
    const config = getApiConfig();
    if (!config.openRouterApiKey) {
      return { success: false, error: 'OpenRouter API key not configured' };
    }

    // 构建统一的提示词
    const systemPrompt = `你是一个专业的英语教学助手，专门为儿童制作单词卡片。请根据要求提供准确、简洁的内容。`;
    
    const userPrompt = `请为英文单词 "${word}" 补全以下字段，只返回JSON格式的结果，不要包含任何其他文字：

${fields.map(field => {
  switch (field) {
    case 'phonetic':
      return '- phonetic: 音标，格式为 /音标/，例如 /ˈæpəl/';
    case 'chinese':
      return '- chinese: 中文释义，简洁明了';
    case 'example':
      return '- example: 英文例句，简单易懂，适合儿童';
    case 'translation':
      return '- translation: 例句的中文翻译';
    case 'pos':
      return '- pos: 词性，使用标准缩写（n.名词, v.动词, adj.形容词, adv.副词, prep.介词, conj.连词, pron.代词, int.感叹词）';
    default:
      return '';
  }
}).join('\n')}

请返回格式：
{
  "phonetic": "音标",
  "chinese": "中文释义", 
  "example": "英文例句",
  "translation": "中文翻译",
  "pos": "词性"
}`;

    // 调用 OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openRouterApiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Word Cards Generator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API 请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenRouter API 返回内容为空');
    }

    // 解析返回的JSON内容
    let parsedData: Record<string, string>;
    try {
      // 尝试直接解析JSON
      parsedData = JSON.parse(content);
    } catch {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析API返回的内容');
      }
    }

    // 构建返回数据
    const data: Record<string, string> = {};
    fields.forEach(field => {
      if (parsedData[field]) {
        data[field] = parsedData[field];
      }
    });

    // 自动生成自然拼读拆分
    if (word && !data.phonics) {
      data.phonics = generatePhonicsSplit(word);
    }

    return {
      success: true,
      data,
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

    // 调用 Pexels API 搜索图片
    const searchUrl = `${PEXELS_API_URL}?query=${encodeURIComponent(word)}&per_page=1&orientation=landscape`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': config.pexelsApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API 请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const photos = result.photos;
    
    if (!photos || photos.length === 0) {
      throw new Error(`未找到与单词 "${word}" 相关的图片`);
    }

    // 获取第一张图片的URL
    const photo = photos[0];
    const imageUrl = photo.src?.medium || photo.src?.large || photo.src?.original;
    
    if (!imageUrl) {
      throw new Error('图片URL无效');
    }

    return {
      success: true,
      data: {
        imageUrl,
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
    if (!word.pos) missingFields.push('pos');
    
    // 检查缺失的图片字段
    const needsImage = !word.imageUrl;
    
    // 补全文本字段
    const textFields = missingFields.filter(field => 
      ['phonetic', 'chinese', 'example', 'translation', 'pos'].includes(field)
    ) as ('phonetic' | 'chinese' | 'example' | 'translation' | 'pos')[];
    
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