"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wand2, Trash2, Eye, Check, X, Loader2 } from "lucide-react"
import { completeAllFields } from "@/lib/api"
import { ImageSelectionDialog } from "./image-selection-dialog"

interface Word {
  id: number
  word: string
  phonetic: string
  phonics: string
  chinese: string
  pos: string
  example: string
  translation: string
  imageUrl: string
}

interface DataReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  words: Word[]
  onConfirm: (confirmedWords: Word[]) => void
  onRegenerateImage?: (wordId: number) => Promise<string | null> // 修改返回类型
  onDataUpdate?: (updatedWords: Word[]) => void // 新增：数据更新回调
}

export function DataReviewDialog({
  open,
  onOpenChange,
  words,
  onConfirm,
  onRegenerateImage,
  onDataUpdate
}: DataReviewDialogProps) {
  const [reviewWords, setReviewWords] = useState<Word[]>(words)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [generationMessage, setGenerationMessage] = useState('')
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)

  // 当弹窗打开时，更新reviewWords，避免弹窗关闭后数据丢失
  useEffect(() => {
    if (open) {
      setReviewWords(words)
      // 重置生成状态
      setGenerationStatus('idle')
      setGenerationMessage('')
      setGenerationProgress(0)
      setCurrentWord('')
    }
  }, [open, words])

  // 阻止背景滚动
  useEffect(() => {
    if (open) {
      // 保存原始样式
      const originalStyle = window.getComputedStyle(document.body).overflow
      // 禁止背景滚动
      document.body.style.overflow = 'hidden'
      
      // 清理函数
      return () => {
        document.body.style.overflow = originalStyle
        // 弹窗关闭时重置状态
        setGenerationStatus('idle')
        setGenerationMessage('')
        setGenerationProgress(0)
        setCurrentWord('')
        setIsGenerating(false)
        
        // 弹窗关闭时滚动到卡片预览区域
        setTimeout(() => {
          const previewSection = document.getElementById('card-preview-section')
          if (previewSection) {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            // 如果找不到预览区域，则滚动到页面顶部
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 100) // 延迟100ms确保弹窗完全关闭
      }
    }
  }, [open])

  const handleWordChange = (id: number, field: keyof Word, value: string) => {
    setReviewWords(prev => prev.map(word => 
      word.id === id ? { ...word, [field]: value } : word
    ))
  }

  const handleDeleteWord = (id: number) => {
    setReviewWords(prev => prev.filter(word => word.id !== id))
  }

  // 统一的弹窗关闭处理，确保滚动到卡片预览区域
  const handleCloseDialog = () => {
    // 重置所有状态
    setGenerationStatus('idle')
    setGenerationMessage('')
    setGenerationProgress(0)
    setCurrentWord('')
    setIsGenerating(false)
    
    onOpenChange(false)
    // 弹窗关闭后滚动到卡片预览区域
    setTimeout(() => {
      const previewSection = document.getElementById('card-preview-section')
      if (previewSection) {
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // 如果找不到预览区域，则滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 100) // 延迟100ms确保弹窗完全关闭
  }

  const handleConfirm = () => {
    onConfirm(reviewWords)
    handleCloseDialog()
  }

  const handleRegenerateImage = async (wordId: number) => {
    if (onRegenerateImage) {
      setIsLoading(true)
      try {
        await onRegenerateImage(wordId)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOpenImageDialog = (word: Word) => {
    setSelectedWord(word)
    setShowImageDialog(true)
  }

  const handleImageRegenerate = async (wordId: number): Promise<string | null> => {
    if (onRegenerateImage) {
      try {
        const newImageUrl = await onRegenerateImage(wordId)
        // 重新生成完成后，更新本地状态
        setReviewWords(prev => prev.map(word => 
          word.id === wordId ? { ...word } : word // Trigger re-render if needed, or rely on parent prop update
        ))
        return newImageUrl
      } catch (error) {
        console.error('重新生成图片失败:', error)
        return null
      }
    }
    return null
  }

  // 生成所有字段
  const handleGenerateAllFields = async () => {
    const wordsToGenerate = reviewWords.filter(word => word.word.trim())
    if (wordsToGenerate.length === 0) {
      alert('请先添加一些单词')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentWord('')
    
    try {
      const updatedWords = [...reviewWords]
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < wordsToGenerate.length; i++) {
        const word = wordsToGenerate[i]
        const progress = ((i + 1) / wordsToGenerate.length) * 100
        
        setCurrentWord(word.word)
        setGenerationProgress(progress)
        console.log(`正在处理单词: ${word.word} (${i + 1}/${wordsToGenerate.length})`)
        
        const result = await completeAllFields(word)
        
        if (result.success && result.data) {
          const index = updatedWords.findIndex(w => w.id === word.id)
          if (index !== -1) {
            updatedWords[index] = {
              ...updatedWords[index],
              ...result.data
            }
            successCount++
          }
        } else {
          errorCount++
          console.error(`单词 "${word.word}" 补全失败:`, result.error)
        }
        
        // 添加延迟避免API限制
        if (i < wordsToGenerate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      setReviewWords(updatedWords)
      
      // 同步数据到主页面
      if (onDataUpdate) {
        onDataUpdate(updatedWords)
      }
      
      // 验证生成的数据质量
      const validWords = updatedWords.filter(word => 
        word.word.trim() && 
        (word.phonetic?.trim() || word.pos?.trim() || word.chinese?.trim() || 
         word.example?.trim() || word.translation?.trim())
      )
      
      // 设置状态信息
      if (errorCount === 0 && validWords.length > 0) {
        setGenerationStatus('success')
        setGenerationMessage(`成功生成 ${validWords.length} 个单词的所有字段！`)
      } else if (errorCount > 0) {
        setGenerationStatus('error')
        setGenerationMessage(`成功生成 ${successCount} 个单词的字段，${errorCount} 个单词生成失败`)
      } else {
        setGenerationStatus('error')
        setGenerationMessage('字段生成完成，但数据质量较低，请检查生成结果')
      }
    } catch (error) {
      console.error('生成字段失败:', error)
      setGenerationStatus('error')
      setGenerationMessage('生成字段失败，请重试')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      setCurrentWord('')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCloseDialog}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <h2 className="text-lg font-semibold">数据审核与确认</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseDialog}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Description */}
        <div className="px-6 py-2 bg-gray-50">
          <p className="text-sm text-gray-600">
            请先点击"生成所有字段"按钮补全缺失的字段，然后检查并修改内容，确认无误后点击"确认生成卡片"
          </p>
        </div>

        {/* 生成所有字段按钮 */}
        <div className="px-6 py-4 border-b">
          <Button 
            onClick={handleGenerateAllFields}
            disabled={isGenerating || reviewWords.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                正在生成所有字段...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                生成所有字段
              </>
            )}
          </Button>
          
          {/* 进度条和状态信息 */}
          {(isGenerating || generationStatus !== 'idle') && (
            <div className="mt-4 space-y-3">
              {/* 当前处理的单词 */}
              {isGenerating && currentWord && (
                <div className="text-sm text-gray-600 text-center">
                  正在处理: <span className="font-medium text-blue-600">{currentWord}</span>
                </div>
              )}
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ease-out ${
                    generationStatus === 'success' ? 'bg-green-600' : 
                    generationStatus === 'error' ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${generationStatus !== 'idle' ? 100 : generationProgress}%` }}
                />
              </div>
              
              {/* 进度百分比或状态信息 */}
              {isGenerating ? (
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(generationProgress)}% 完成
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-medium ${
                    generationStatus === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {generationMessage}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGenerationStatus('idle')
                      setGenerationMessage('')
                    }}
                    className="text-xs h-6 px-2"
                  >
                    清除
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">编号</TableHead>
                  <TableHead className="w-24">单词</TableHead>
                  <TableHead className="w-24">音标</TableHead>
                  <TableHead className="w-20">词性</TableHead>
                  <TableHead className="w-24">自然拼读</TableHead>
                  <TableHead className="w-32">中文释义</TableHead>
                  <TableHead className="w-40">英文例句</TableHead>
                  <TableHead className="w-40">中文翻译</TableHead>
                  <TableHead className="w-24">图片</TableHead>
                  <TableHead className="w-16">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewWords.map((word, index) => (
                  <TableRow key={word.id}>
                    {/* 编号 */}
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    
                    {/* 单词 */}
                    <TableCell>
                      <Input
                        value={word.word || ''}
                        onChange={(e) => handleWordChange(word.id, 'word', e.target.value)}
                        placeholder="单词"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 音标 */}
                    <TableCell>
                      <Input
                        value={word.phonetic || ''}
                        onChange={(e) => handleWordChange(word.id, 'phonetic', e.target.value)}
                        placeholder="音标"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 词性 */}
                    <TableCell>
                      <Input
                        value={word.pos || ''}
                        onChange={(e) => handleWordChange(word.id, 'pos', e.target.value)}
                        placeholder="词性"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 自然拼读 */}
                    <TableCell>
                      <Input
                        value={word.phonics || ''}
                        onChange={(e) => handleWordChange(word.id, 'phonics', e.target.value)}
                        placeholder="自然拼读"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 中文释义 */}
                    <TableCell>
                      <Input
                        value={word.chinese || ''}
                        onChange={(e) => handleWordChange(word.id, 'chinese', e.target.value)}
                        placeholder="中文释义"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 英文例句 */}
                    <TableCell>
                      <Input
                        value={word.example || ''}
                        onChange={(e) => handleWordChange(word.id, 'example', e.target.value)}
                        placeholder="英文例句"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 中文翻译 */}
                    <TableCell>
                      <Input
                        value={word.translation || ''}
                        onChange={(e) => handleWordChange(word.id, 'translation', e.target.value)}
                        placeholder="中文翻译"
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    
                    {/* 图片 */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {word.imageUrl && (
                          <img 
                            src={word.imageUrl} 
                            alt={word.word}
                            className="w-8 h-8 object-cover rounded border"
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenImageDialog(word)}
                          className="h-6 px-2 text-xs"
                        >
                          <Wand2 className="h-3 w-3 mr-1" />
                          重新生成
                        </Button>
                      </div>
                    </TableCell>
                    
                    {/* 操作 */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWord(word.id)}
                        className="text-red-500 hover:text-red-700 h-6 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={reviewWords.length === 0}>
            <Check className="h-4 w-4 mr-2" />
            确认生成卡片 ({reviewWords.length} 个单词)
          </Button>
        </div>
      </div>

      {/* 图片选择弹窗 */}
      <ImageSelectionDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        word={selectedWord}
        onRegenerateImage={handleImageRegenerate}
        onImageSelected={(wordId, imageUrl) => {
          // 当用户选择使用新图片时，更新本地状态
          setReviewWords(prev => prev.map(word => 
            word.id === wordId ? { ...word, imageUrl } : word
          ))
        }}
      />
    </div>
  )
} 