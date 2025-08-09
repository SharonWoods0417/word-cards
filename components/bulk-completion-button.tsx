import { Button } from "@/components/ui/button"
import { Wand2, Loader2 } from "lucide-react"
import { useCompletion } from "@/hooks/use-completion"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface BulkCompletionButtonProps {
  words: any[];
  onComplete?: (results: any[]) => void;
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "default";
  className?: string;
}

export function BulkCompletionButton({
  words,
  onComplete,
  size = "default",
  variant = "outline",
  className = ""
}: BulkCompletionButtonProps) {
  const { completeAllWords, completionState } = useCompletion();
  const [showProgress, setShowProgress] = useState(false);

  const handleBulkComplete = async () => {
    if (words.length === 0) return;
    
    setShowProgress(true);
    try {
      const result = await completeAllWords(words);
      if (result.success && result.results) {
        // 更新所有单词数据
        const updatedWords = words.map((word, index) => {
          const completionResult = result.results[index];
          if (completionResult?.success && completionResult.data) {
            return {
              ...word,
              ...completionResult.data,
            };
          }
          return word;
        });
        onComplete?.(updatedWords);
      }
    } catch (error) {
      console.error('批量补全失败:', error);
    } finally {
      setShowProgress(false);
    }
  };

  const isLoading = completionState.isCompleting;
  const progress = completionState.progress;
  const errors = completionState.errors;

  // 检查是否有需要补全的单词
  const needsCompletion = words.some(word => 
    !word.phonetic || !word.chinese || !word.example || !word.translation || !word.pos || !word.imageUrl
  );

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleBulkComplete}
        disabled={isLoading || !needsCompletion}
        className={`flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        补全全部
      </Button>

      {/* 进度显示 */}
      {showProgress && progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>正在补全...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <Progress 
            value={(progress.current / progress.total) * 100} 
            className="h-2"
          />
        </div>
      )}

      {/* 错误显示 */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.length === 1 ? (
              errors[0]
            ) : (
              <div>
                <p>补全过程中遇到 {errors.length} 个错误：</p>
                <ul className="list-disc list-inside mt-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 