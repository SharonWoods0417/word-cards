import { Button } from "@/components/ui/button"
import { Wand2, Loader2 } from "lucide-react"
import { useCompletion } from "@/hooks/use-completion"
import { useState } from "react"

interface CompletionButtonProps {
  word: any;
  onComplete?: (result: any) => void;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function CompletionButton({
  word,
  onComplete,
  size = "sm",
  variant = "ghost",
  className = ""
}: CompletionButtonProps) {
  const { completeWord, completionState } = useCompletion();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (!word.word) return;
    
    setIsCompleting(true);
    try {
      const result = await completeWord(word);
      if (result.success && result.data) {
        // 更新单词数据
        const updatedWord = {
          ...word,
          ...result.data,
        };
        onComplete?.(updatedWord);
      }
    } catch (error) {
      console.error('补全失败:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isLoading = isCompleting || completionState.isCompleting;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleComplete}
      disabled={isLoading || !word.word}
      className={`p-1 h-6 w-6 text-muted-foreground ${className}`}
      title="自动补全缺失字段"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Wand2 className="h-3 w-3" />
      )}
    </Button>
  );
} 