"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, X, Check, RefreshCw } from "lucide-react"

interface Word {
  id: number
  word: string
  imageUrl: string
}

interface ImageSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  word: Word | null
  onRegenerateImage: (wordId: number) => Promise<string | null> // 返回新图片URL
  onImageSelected?: (wordId: number, imageUrl: string) => void // 新增：用户选择图片的回调
}

export function ImageSelectionDialog({
  open,
  onOpenChange,
  word,
  onRegenerateImage,
  onImageSelected
}: ImageSelectionDialogProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [newImageUrl, setNewImageUrl] = useState<string>("")
  const [hasNewImage, setHasNewImage] = useState(false)

  // 当弹窗打开时，初始化当前图片
  useEffect(() => {
    if (open && word) {
      setCurrentImageUrl(word.imageUrl)
      setNewImageUrl("")
      setHasNewImage(false)
    }
  }, [open, word])

  if (!open || !word) return null

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      // 调用父组件的重新生成图片函数，获取新图片URL（多试几次避免API偶尔返回重复）
      let newImage = await onRegenerateImage(word.id)
      // 如果新旧一致或为空，最多重试2次
      let retries = 0
      while (retries < 2 && (!newImage || newImage === currentImageUrl)) {
        newImage = await onRegenerateImage(word.id)
        retries += 1
      }
      
      if (newImage) {
        setNewImageUrl(newImage)
        setHasNewImage(true)
      }
      
    } catch (error) {
      console.error('重新生成图片失败:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleUseNewImage = () => {
    // 使用新图片，通知父组件
    if (onImageSelected && newImageUrl) {
      onImageSelected(word.id, newImageUrl)
    }
    // 关闭弹窗
    onOpenChange(false)
  }

  const handleKeepCurrentImage = () => {
    // 保持当前图片，关闭弹窗
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">图片选择 - {word.word}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* 当前图片 */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">当前图片</h4>
            <div className="flex justify-center">
              {currentImageUrl ? (
                <div className="relative">
                  <img
                    src={currentImageUrl}
                    alt={`${word.word} 当前图片`}
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">暂无图片</p>
                </div>
              )}
            </div>
          </div>

          {/* 新生成的图片 */}
          {hasNewImage && newImageUrl && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                新生成的图片
              </h4>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={newImageUrl}
                    alt={`${word.word} 新图片`}
                    className="w-48 h-48 object-cover rounded-lg border-2 border-green-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="w-full"
            >
              {isRegenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  正在生成新图片...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  重新生成图片
                </>
              )}
            </Button>
            
            {hasNewImage && (
              <div className="flex gap-3">
                <Button
                  onClick={handleUseNewImage}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  使用新图片
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleKeepCurrentImage}
                  className="flex-1"
                >
                  保持当前图片
                </Button>
              </div>
            )}
            
            {!hasNewImage && (
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                关闭
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 