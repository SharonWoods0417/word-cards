import { useState, useCallback } from 'react';
import { 
  completeAllFields, 
  completeMultipleWords, 
  CompletionResponse,
  checkApiConfig 
} from '@/lib/api';

// 补全状态类型
export interface CompletionState {
  isCompleting: boolean;
  progress: { current: number; total: number } | null;
  errors: string[];
}

// 补全Hook返回值
export interface UseCompletionReturn {
  // 状态
  completionState: CompletionState;
  
  // 检查API配置
  checkApiConfig: () => { openRouter: boolean; pexels: boolean };
  
  // 补全单个单词
  completeWord: (word: any) => Promise<CompletionResponse>;
  
  // 批量补全
  completeAllWords: (words: any[]) => Promise<{
    success: boolean;
    results: CompletionResponse[];
    errors: string[];
  }>;
  
  // 重置状态
  resetState: () => void;
}

/**
 * 字段补全功能 Hook
 */
export function useCompletion(): UseCompletionReturn {
  const [completionState, setCompletionState] = useState<CompletionState>({
    isCompleting: false,
    progress: null,
    errors: [],
  });

  // 检查API配置
  const checkApiConfigStatus = useCallback(() => {
    return checkApiConfig();
  }, []);

  // 补全单个单词
  const completeWord = useCallback(async (word: any): Promise<CompletionResponse> => {
    setCompletionState(prev => ({
      ...prev,
      isCompleting: true,
      errors: [],
    }));

    try {
      const result = await completeAllFields(word);
      
      setCompletionState(prev => ({
        ...prev,
        isCompleting: false,
        errors: result.success ? [] : [result.error || '补全失败'],
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      setCompletionState(prev => ({
        ...prev,
        isCompleting: false,
        errors: [errorMessage],
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  // 批量补全
  const completeAllWords = useCallback(async (words: any[]) => {
    setCompletionState({
      isCompleting: true,
      progress: { current: 0, total: words.length },
      errors: [],
    });

    try {
      const result = await completeMultipleWords(words, (current, total) => {
        setCompletionState(prev => ({
          ...prev,
          progress: { current, total },
        }));
      });

      setCompletionState({
        isCompleting: false,
        progress: null,
        errors: result.errors,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量补全失败';
      
      setCompletionState({
        isCompleting: false,
        progress: null,
        errors: [errorMessage],
      });

      return {
        success: false,
        results: [],
        errors: [errorMessage],
      };
    }
  }, []);

  // 重置状态
  const resetState = useCallback(() => {
    setCompletionState({
      isCompleting: false,
      progress: null,
      errors: [],
    });
  }, []);

  return {
    completionState,
    checkApiConfig: checkApiConfigStatus,
    completeWord,
    completeAllWords,
    resetState,
  };
} 