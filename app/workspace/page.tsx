"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Upload, Plus, Download, Printer, Eye, Trash2, FileUp, Wand2, X } from "lucide-react"
import { ChangeEvent } from "react"
import Papa from 'papaparse'

import CardPreview, { WordCardData } from "@/components/CardPreview";
import type { Word } from "@/types/word";
import { pageConfig } from "@/config/cardConfig";
import { CompletionButton } from "@/components/completion-button";
import { BulkCompletionButton } from "@/components/bulk-completion-button";
import { DataReviewDialog } from "@/components/data-review-dialog";
import { generatePhonicsSplit } from "@/lib/phonics";
import { searchImage } from "@/lib/api";
import { transformCsvData } from "@/lib/csv";

// 统一从 types 引入 Word 类型

// 示例数据用于展示UI结构
const sampleWords: Word[] = [
  {
    id: 1,
    word: "apple",
    phonetic: "/ˈæpəl/",
    phonics: "ap-ple",
    chinese: "苹果",
    pos: "n.",
    example: "I eat an apple every day.",
    translation: "我每天吃一个苹果。",
    imageUrl: "/red-apple.png",
  },
  {
    id: 2,
    word: "book",
    phonetic: "/bʊk/",
    phonics: "b-ook",
    chinese: "书",
    pos: "n.",
    example: "She is reading a book.",
    translation: "她正在读一本书。",
    imageUrl: "/open-book.png",
  },
  {
    id: 3,
    word: "cat",
    phonetic: "/kæt/",
    phonics: "c-at",
    chinese: "猫",
    pos: "n.",
    example: "The cat is sleeping on the sofa.",
    translation: "猫正在沙发上睡觉。",
    imageUrl: "",
  },
  {
    id: 4,
    word: "dog",
    phonetic: "/dɔːɡ/",
    phonics: "d-og",
    chinese: "狗",
    pos: "n.",
    example: "My dog likes to play in the park.",
    translation: "我的狗喜欢在公园里玩耍。",
    imageUrl: "",
  },
]

export default function WorkspacePage() {
  // 1. 阶段控制状态
  const [currentStage, setCurrentStage] = useState<'input' | 'review' | 'preview'>('input')
  
  // 2. 数据状态管理（三阶段数据）
  const [inputs, setInputs] = useState<Word[]>([]) // 原始输入
  const [drafts, setDrafts] = useState<Word[]>([]) // 待审核
  const [confirmed, setConfirmed] = useState<Word[]>([]) // 已确认
  
  // 3. 向后兼容：保持现有的words状态用于打印功能
  const [words, setWords] = useState<Word[]>([])
  
  // 4. 示例单词显示控制
  const [showSampleWords, setShowSampleWords] = useState(false)
  const [previewMode, setPreviewMode] = useState<"front" | "back">("front")
  
  // 5. 弹窗状态
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  
  // 打印相关
  const printRef = useRef<HTMLDivElement>(null)
  
  // 全部打印功能 - 打印所有页面（正面和反面）
  const handlePrintAll = () => {
    // 不动任何 class，让 print 媒体查询接管显示
    // 等待一帧，保证 DOM & 布局都稳定
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  }
  
  // 新增：文件上传相关状态
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)


  // 打印增强：背面微调（mm）
  const [backOffsetXmm, setBackOffsetXmm] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('print_back_offset_x_mm')
      return v ? Number(v) : 0
    }
    return 0
  })
  const [backOffsetYmm, setBackOffsetYmm] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('print_back_offset_y_mm')
      return v ? Number(v) : 0
    }
    return 0
  })
  
  // 打印分页相关状态
  const cardsPerPage = 6 // 每页6张卡片
  const [previewPage, setPreviewPage] = useState(1)

  // 调试功能：显示当前数据状态
  const handleDebugData = () => {
    console.log('当前words数据:', words)
    console.log('示例数据:', sampleWords)
    console.log('pagedWords:', pagedWords)
    console.log('totalCards:', totalCards)
    
    // 检查localStorage数据
    const saved = localStorage.getItem("words")
    console.log('localStorage中的数据:', saved)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        console.log('localStorage解析后的数据:', parsed)
        console.log('localStorage数据长度:', parsed.length)
        if (parsed.length > 0) {
          console.log('localStorage第一个单词:', parsed[0])
        }
      } catch (e) {
        console.log('localStorage数据解析失败:', e)
      }
    }
    
    alert(`当前有 ${words.length} 个单词，其中 ${totalCards} 个有word字段\nlocalStorage中有数据: ${saved ? '是' : '否'}`)
  }

  // 清除localStorage数据，恢复示例数据
  const handleClearData = () => {
    if (confirm('确定要清除所有数据并恢复示例数据吗？这将删除localStorage中的所有单词数据。')) {
      // 清除所有阶段的数据
      localStorage.removeItem("words")
      localStorage.removeItem("inputs")
      localStorage.removeItem("drafts")
      localStorage.removeItem("confirmed")
      localStorage.removeItem("currentStage")
      
      // 重置所有状态
      setInputs(sampleWords)
      setDrafts([])
      setConfirmed([])
      setCurrentStage('input')
      setWords(sampleWords) // 保持向后兼容
      
      alert('数据已清除，已恢复示例数据！')
    }
  }



  // 计算分页数据
  const wordsFiltered = words.filter(w => !!w.word?.trim());
  const totalCards = wordsFiltered.length
  const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerPage))
  const pagedWords = wordsFiltered.slice(
    (previewPage - 1) * cardsPerPage, 
    previewPage * cardsPerPage
  )

  // 2. 组件挂载后（只在客户端），用useEffect加载localStorage数据
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 加载新的三阶段数据
      const savedInputs = localStorage.getItem("inputs")
      const savedDrafts = localStorage.getItem("drafts")
      const savedConfirmed = localStorage.getItem("confirmed")
      const savedStage = localStorage.getItem("currentStage")
      
      // 向后兼容：如果存在旧的words数据，迁移到inputs
      const savedWords = localStorage.getItem("words")
      
      if (savedInputs) {
        try {
          setInputs(JSON.parse(savedInputs) as Word[])
        } catch {
          // 解析失败则不处理
        }
      }
      
      if (savedDrafts) {
        try {
          setDrafts(JSON.parse(savedDrafts) as Word[])
        } catch {
          // 解析失败则不处理
        }
      }
      
      if (savedConfirmed) {
        try {
          setConfirmed(JSON.parse(savedConfirmed) as Word[])
        } catch {
          // 解析失败则不处理
        }
      }
      
      if (savedStage) {
        try {
          setCurrentStage(JSON.parse(savedStage) as 'input' | 'review' | 'preview')
        } catch {
          // 解析失败则默认为input
          setCurrentStage('input')
        }
      }
      
      // 向后兼容：迁移旧数据
      if (savedWords && !savedInputs) {
        try {
          const oldWords = JSON.parse(savedWords) as Word[]
          setInputs(oldWords)
          setWords(oldWords) // 保持向后兼容
        } catch {
          // 解析失败则不处理
        }
      }
    }
  }, [])

  // 3. 示例单词显示控制
  useEffect(() => {
    if (showSampleWords && inputs.length === 0) {
      setInputs(sampleWords)
      setWords(sampleWords) // 保持向后兼容
    } else if (!showSampleWords && inputs.length > 0 && inputs.every(word => sampleWords.some(sample => sample.id === word.id))) {
      // 如果当前显示的是示例单词且用户关闭了示例显示，则清空
      setInputs([])
      setWords([]) // 保持向后兼容
    }
  }, [showSampleWords, inputs.length])

  // 4. 保存三阶段数据到localStorage
  useEffect(() => {
    localStorage.setItem("inputs", JSON.stringify(inputs))
  }, [inputs])
  
  useEffect(() => {
    localStorage.setItem("drafts", JSON.stringify(drafts))
  }, [drafts])
  
  useEffect(() => {
    localStorage.setItem("confirmed", JSON.stringify(confirmed))
  }, [confirmed])
  
  useEffect(() => {
    localStorage.setItem("currentStage", JSON.stringify(currentStage))
  }, [currentStage])
  
  // 5. 向后兼容：保持words状态同步（用于打印功能）
  useEffect(() => {
    // 根据当前阶段，同步words状态
    if (currentStage === 'input') {
      setWords(inputs)
    } else if (currentStage === 'review') {
      setWords(drafts)
    } else if (currentStage === 'preview') {
      setWords(confirmed)
    }
  }, [currentStage, inputs, drafts, confirmed])

  // 5. 状态转换函数
  const handleStageTransition = (newStage: 'input' | 'review' | 'preview') => {
    setCurrentStage(newStage)
  }
  
  const handleGenerateAllFields = async () => {
    // 从inputs生成drafts，调用API补全所有字段
    const wordsToProcess = inputs.filter(word => word.word.trim())
    if (wordsToProcess.length === 0) {
      alert('请先添加一些单词数据')
      return
    }

    setDrafts(wordsToProcess)
    setCurrentStage('review')
    
    // TODO: 这里可以添加API调用来补全字段
    // 目前先直接使用inputs作为drafts
  }
  
  const handleConfirmDrafts = () => {
    // 从drafts确认到confirmed
    setConfirmed(drafts)
    setCurrentStage('preview')
  }
  
  const handleBackToReview = () => {
    // 从preview回到review
    setCurrentStage('review')
  }
  
  const handleBackToInput = () => {
    // 从review回到input
    setCurrentStage('input')
  }

  // 弹窗相关处理函数
  const handleOpenReviewDialog = () => {
    // 优先使用已确认的数据，如果没有则使用inputs
    const wordsToReview = (confirmed.length > 0 ? confirmed : inputs).filter(word => word.word.trim())
    if (wordsToReview.length === 0) {
      alert('请先添加一些单词数据')
      return
    }
    setShowReviewDialog(true)
  }

  const handleConfirmReview = (confirmedWords: Word[]) => {
    setConfirmed(confirmedWords)
    setWords(confirmedWords) // 更新words状态用于打印
    setShowReviewDialog(false)
    // 直接关闭弹窗，回到首页卡片预览区域
  }

  // 处理弹窗中的数据更新（字段生成完成后）
  const handleDataUpdate = (updatedWords: Word[]) => {
    // 更新inputs状态，确保下次打开弹窗时能看到生成的数据
    setInputs(prevInputs => {
      const newInputs = [...prevInputs]
      updatedWords.forEach(updatedWord => {
        const index = newInputs.findIndex(word => word.id === updatedWord.id)
        if (index !== -1) {
          newInputs[index] = { ...newInputs[index], ...updatedWord }
        }
      })
      return newInputs
    })
    
    // 如果confirmed状态中有对应的单词，也更新它
    if (confirmed.length > 0) {
      setConfirmed(prevConfirmed => {
        const newConfirmed = [...prevConfirmed]
        updatedWords.forEach(updatedWord => {
          const index = newConfirmed.findIndex(word => word.id === updatedWord.id)
          if (index !== -1) {
            newConfirmed[index] = { ...newConfirmed[index], ...updatedWord }
          }
        })
        return newConfirmed
      })
    }
  }

  const handleRegenerateImage = async (wordId: number): Promise<string | null> => {
    try {
      // 找到要重新生成图片的单词
      const wordToUpdate = inputs.find(word => word.id === wordId) || 
                           confirmed.find(word => word.id === wordId)
      
      if (!wordToUpdate || !wordToUpdate.word.trim()) {
        console.error('找不到单词或单词为空')
        return null
      }

      // 调用图片搜索API（每次都请求随机结果）
      const result = await searchImage(wordToUpdate.word.trim())
      
      if (result.success && result.data?.imageUrl) {
        // 更新图片URL
        const updatedWord = { ...wordToUpdate, imageUrl: result.data.imageUrl }
        
        // 更新inputs状态
        setInputs(prevInputs => prevInputs.map(word => 
          word.id === wordId ? updatedWord : word
        ))
        
        // 如果confirmed状态中也有这个单词，也更新它
        if (confirmed.length > 0) {
          setConfirmed(prevConfirmed => prevConfirmed.map(word => 
            word.id === wordId ? updatedWord : word
          ))
        }
        
        console.log('图片重新生成成功:', wordToUpdate.word, '→', result.data.imageUrl)
        return result.data.imageUrl // 返回新生成的图片URL
      } else {
        console.error('图片搜索失败:', result.error)
        return null
      }
    } catch (error) {
      console.error('重新生成图片失败:', error)
      return null
    }
  }

  // 添加新的ref用于滚动到新添加的单词
  const newWordRef = useRef<HTMLDivElement>(null)
  const [lastAddedWordId, setLastAddedWordId] = useState<number | null>(null)

  // 6. 手动添加单词的处理函数
  const handleAddWord = () => {
    // 生成唯一ID：用当前时间+随机数，保证只在客户端事件中生成
    const newId = Date.now() + Math.floor(Math.random() * 1000000)
    
    // 创建新的空白单词条目
    const newWord: Word = {
      id: newId,
      word: "",
      phonetic: "",
      phonics: "",
      chinese: "",
      pos: "",
      example: "",
      translation: "",
      imageUrl: "",
    }
    
    // 将新单词添加到inputs状态中（添加到列表末尾）
    setInputs(prevInputs => [...prevInputs, newWord])
    setLastAddedWordId(newId)
    
    // 自动滚动到新添加的单词
    setTimeout(() => {
      if (newWordRef.current) {
        newWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // 聚焦到新添加的输入框
        const inputElement = newWordRef.current.querySelector('input')
        if (inputElement) {
          inputElement.focus()
        }
      }
    }, 100)
  }

  // 6. 表格编辑：输入框双向绑定
  const handleInputChange = (id: number, field: keyof Word, value: string) => {
    // 清除lastAddedWordId，因为用户已经开始编辑
    if (lastAddedWordId === id) {
      setLastAddedWordId(null)
    }
    
    // 根据当前阶段更新对应的状态
    if (currentStage === 'input') {
      setInputs(prevInputs => prevInputs.map(word => {
        if (word.id === id) {
          const updatedWord = { ...word, [field]: value };
          
          // 当单词字段更新时，自动生成自然拼读拆分
          if (field === 'word' && value.trim() && !updatedWord.phonics) {
            updatedWord.phonics = generatePhonicsSplit(value.trim());
          }
          
          return updatedWord;
        }
        return word;
      }))
    } else if (currentStage === 'review') {
      setDrafts(prevDrafts => prevDrafts.map(word => {
        if (word.id === id) {
          const updatedWord = { ...word, [field]: value };
          
          // 当单词字段更新时，自动生成自然拼读拆分
          if (field === 'word' && value.trim() && !updatedWord.phonics) {
            updatedWord.phonics = generatePhonicsSplit(value.trim());
          }
          
          return updatedWord;
        }
        return word;
      }))
    }
  }

  // 7. 删除单词功能
  const handleDeleteWord = (id: number) => {
    // 根据当前阶段删除对应的状态
    if (currentStage === 'input') {
      setInputs(prevInputs => prevInputs.filter(word => word.id !== id))
    } else if (currentStage === 'review') {
      setDrafts(prevDrafts => prevDrafts.filter(word => word.id !== id))
    }
  }

  // 8. 补全单词功能
  const handleCompleteWord = (updatedWord: Word) => {
    // 根据当前阶段更新对应的状态
    if (currentStage === 'input') {
      setInputs(prevInputs => prevInputs.map(word =>
        word.id === updatedWord.id ? updatedWord : word
      ))
    } else if (currentStage === 'review') {
      setDrafts(prevDrafts => prevDrafts.map(word =>
        word.id === updatedWord.id ? updatedWord : word
      ))
    }
  }

  // 9. 批量补全功能
  const handleBulkComplete = (updatedWords: Word[]) => {
    // 根据当前阶段更新对应的状态
    if (currentStage === 'input') {
      setInputs(updatedWords)
    } else if (currentStage === 'review') {
      setDrafts(updatedWords)
    }
  }

  // 新增：文件上传处理函数
  const handleFileUpload = (file: File) => {
    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus("error")
      setUploadMessage("请上传CSV格式的文件")
      return
    }

    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("error")
      setUploadMessage("文件大小不能超过5MB")
      return
    }

    setUploadStatus("uploading")
    setUploadMessage("正在解析CSV文件...")

    // 读取文件内容
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        // 使用papaparse解析CSV内容
        Papa.parse(csvContent, {
          header: true, // 第一行作为表头
          skipEmptyLines: true,
          complete: (result: any) => {
            console.log("CSV解析结果:", result)
            // 放宽错误处理：如果存在可用数据则继续，仅提示
            if (result.errors && result.errors.length > 0) {
              console.warn("Papa.parse errors:", result.errors)
            }
            // 宽松映射 + 标准化转换（带分隔符回退尝试）
            let parseResult: any = result
            if (!Array.isArray(parseResult.data) || parseResult.data.length === 0) {
              const tryOptions = [ { delimiter: ';' }, { delimiter: '\t' } ]
              for (const opt of tryOptions) {
                const res2 = Papa.parse(csvContent, { header: true, skipEmptyLines: true, ...opt })
                if (Array.isArray(res2.data) && res2.data.length > 0) {
                  parseResult = res2
                  break
                }
              }
            }

            const headers = (parseResult.meta?.fields as string[]) || []
            const rows = (parseResult.data as any[]) || []
            const { words: parsedWords, stats } = transformCsvData(rows, headers)
            if (parsedWords.length === 0) {
              setUploadStatus("error")
              setUploadMessage("CSV解析完成，但未找到有效的单词行（请确保存在 'word' 列且至少一行不为空）")
              return
            }
            const newWords: Word[] = parsedWords
            // 根据当前阶段添加到对应的状态
            if (currentStage === 'input') {
              setInputs(prevInputs => [...prevInputs, ...newWords])
            } else if (currentStage === 'review') {
              setDrafts(prevDrafts => [...prevDrafts, ...newWords])
            }
            setUploadStatus("success")
            const missingSummary = [
              stats.missingCounts.phonetic ? `音标缺失${stats.missingCounts.phonetic}` : '',
              stats.missingCounts.chinese ? `中文缺失${stats.missingCounts.chinese}` : '',
              stats.missingCounts.pos ? `词性缺失${stats.missingCounts.pos}` : '',
              stats.missingCounts.example ? `例句缺失${stats.missingCounts.example}` : '',
              stats.missingCounts.translation ? `翻译缺失${stats.missingCounts.translation}` : '',
              stats.missingCounts.imageUrl ? `图片缺失${stats.missingCounts.imageUrl}` : '',
            ].filter(Boolean).join('，')

            const normalizedTip = stats.posNormalizedCount > 0 ? `；规范化词性${stats.posNormalizedCount}条` : ''
            const discardedTip = stats.discardedRows > 0 ? `；丢弃无单词行${stats.discardedRows}条` : ''
            const errorTip = result.errors && result.errors.length > 0 ? `；解析报告${result.errors.length}处问题（已尽量导入）` : ''
            setUploadMessage(
              `成功导入${newWords.length}条。${missingSummary || '各字段基本齐全'}${normalizedTip}${discardedTip}${errorTip}`
            )
            // 3秒后重置状态
            setTimeout(() => {
              setUploadStatus("idle")
              setUploadMessage("")
            }, 3000)
          },
          error: (error: any) => {
            setUploadStatus("error")
            setUploadMessage("CSV解析失败：" + error.message)
          }
        })
      } catch (error) {
        setUploadStatus("error")
        setUploadMessage("文件解析失败，请检查CSV格式")
      }
    }
    
    reader.onerror = () => {
      setUploadStatus("error")
      setUploadMessage("文件读取失败")
    }
    
    reader.readAsText(file, 'UTF-8')
  }

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
    // 关键：重置input的value，保证可以连续上传同一个文件
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUploadClick = (e?: React.MouseEvent) => {
    // 阻止事件冒泡，避免多次弹窗
    if (e) e.stopPropagation()
    fileInputRef.current?.click()
  }

  // 新增：下载CSV模板功能
  const handleDownloadTemplate = () => {
    const header = [
      'word',
      'phonetic',
      'phonics',
      'chinese',
      'pos',
      'example',
      'translation',
      'imageUrl',
    ]
    const csv = header.join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 新增：导出设置更新函数


  // 打印正面
  const handlePrintFront = () => {
    // 设置打印模式为正面
    document.body.setAttribute('data-print', 'front')
    
    // 等待一帧，保证 DOM & 布局都稳定
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print()
        // 打印完成后清除属性
        setTimeout(() => {
          document.body.removeAttribute('data-print')
        }, 100)
      })
    })
  }

  // 打印反面
  const handlePrintBack = () => {
    document.body.setAttribute('data-print', 'back')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print()
        setTimeout(() => {
          document.body.removeAttribute('data-print')
        }, 100)
      })
    })
  }

  // 不提供校准页

  // 已移除一键 PDF 导出（改用浏览器打印 / 保存为 PDF）

  // 纸张参数
  const PAGE_WIDTH_MM = pageConfig.a4.width;
  const PAGE_HEIGHT_MM = pageConfig.a4.height;
  const desiredCardWidth = pageConfig.card.width;
  const CARD_HEIGHT = pageConfig.card.height;
  const COLS = pageConfig.cols;
  const ROWS = pageConfig.rows;
  let PADDING_MM = pageConfig.paddingSide;
  let PADDING_TOP_MM = pageConfig.paddingTop;
  let PADDING_BOTTOM_MM = pageConfig.paddingBottom;
  let COL_GAP_MM = pageConfig.colGap;
  let ROW_GAP_MM = pageConfig.rowGap;

  // 背面微调偏移应用（仅打印容器使用）
  const backOffsetStyle: React.CSSProperties = {
    transform: `translate(${backOffsetXmm}mm, ${backOffsetYmm}mm)`
  }

  // 计算最大可用宽度
  let maxGridWidth = PAGE_WIDTH_MM - 2 * PADDING_MM;
  let totalCardWidth = COLS * desiredCardWidth + (COLS - 1) * COL_GAP_MM;
  if (totalCardWidth > maxGridWidth) {
    // 优先缩小padding到5mm
    PADDING_MM = 5;
    maxGridWidth = PAGE_WIDTH_MM - 2 * PADDING_MM;
    totalCardWidth = COLS * desiredCardWidth + (COLS - 1) * COL_GAP_MM;
    if (totalCardWidth > maxGridWidth) {
      // 再缩小colGap到5mm
      COL_GAP_MM = 5;
      totalCardWidth = COLS * desiredCardWidth + (COLS - 1) * COL_GAP_MM;
      if (totalCardWidth > maxGridWidth) {
        // 最后宽度不能超过最大可用宽度
        // 但此处直接固定为75mm，不再缩小
      }
    }
  }

  const cardStyle = {
    width: `${desiredCardWidth}mm`,
    height: `${CARD_HEIGHT}mm`,
  };
  const gridWidth = COLS * desiredCardWidth + (COLS - 1) * COL_GAP_MM + 2 * PADDING_MM;
  const availableHeight = PAGE_HEIGHT_MM - 2 * PADDING_MM - (ROWS - 1) * ROW_GAP_MM;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl p-6 space-y-8 no-print">
        {/* 页面标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">单词卡片制作工具</h1>
          <p className="text-muted-foreground">上传单词 → 编辑内容 → 预览卡片 → 导出打印</p>
        </div>

        {/* 调试按钮 */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleDebugData}>
            调试数据
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearData} className="ml-2">
            清除数据
          </Button>
        </div>

                {/* ① 导入区（左右两栏） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左栏：手动添加单词 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                手动添加单词
              </CardTitle>
              <CardDescription>逐个添加单词数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 单词列表 */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {words.map((word, index) => (
                  <div 
                    key={word.id} 
                    className="flex items-center gap-2 p-3 border rounded-lg"
                    ref={word.id === lastAddedWordId ? newWordRef : null}
                  >
                    {/* 编号 */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    
                    {/* 单词输入框 */}
                    <div className="flex-1">
                      <Input
                        placeholder="请输入单词"
                        value={word.word || ''}
                        onChange={(e) => handleInputChange(word.id, 'word', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    {/* 删除按钮 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWord(word.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* 添加单词按钮 */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddWord}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加新单词
                </Button>
              </div>

              {/* 示例单词控制 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  显示示例单词
                </div>
                <Button
                  variant={showSampleWords ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSampleWords(!showSampleWords)}
                >
                  {showSampleWords ? "隐藏示例" : "显示示例"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 右栏：CSV 上传模块 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                CSV 文件上传
              </CardTitle>
              <CardDescription>批量导入单词数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 隐藏的文件输入框 */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* 拖拽上传区域 */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : uploadStatus === 'success'
                    ? 'border-green-500 bg-green-50'
                    : uploadStatus === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <Upload className={`h-10 w-10 mx-auto mb-3 ${
                  uploadStatus === 'success' ? 'text-green-500' :
                  uploadStatus === 'error' ? 'text-red-500' :
                  isDragOver ? 'text-blue-500' : 'text-gray-400'
                }`} />
                
                {/* 状态消息 */}
                {uploadStatus !== 'idle' && (
                  <div className={`mb-3 p-2 rounded text-sm font-medium ${
                    uploadStatus === 'success' ? 'text-green-700 bg-green-100' :
                    uploadStatus === 'error' ? 'text-red-700 bg-red-100' :
                    'text-blue-700 bg-blue-100'
                  }`}>
                    {uploadStatus === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        正在上传...
                      </div>
                    )}
                    {uploadStatus === 'success' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        上传成功！已导入 {words.length} 个单词
                      </div>
                    )}
                    {uploadStatus === 'error' && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        上传失败，请检查文件格式
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-gray-600">
                  <p className="font-medium mb-2">拖拽CSV文件到此处，或点击选择文件</p>
                  <p className="text-sm text-gray-500">支持的文件格式：.csv</p>
                </div>
              </div>
              
              {/* 下载模板按钮 */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                下载CSV模板
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 数据审核按钮 */}
        {words.length > 0 && (
          <div className="flex justify-center">
            <Button 
              onClick={handleOpenReviewDialog}
              size="lg"
              className="px-8 py-3"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              审核并生成字段
            </Button>
          </div>
        )}

        {/* ② 卡片预览区 */}
        <Card id="card-preview-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              卡片预览
            </CardTitle>
            <CardDescription>预览单词卡片的最终效果</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as "front" | "back")}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="front">正面预览</TabsTrigger>
                  <TabsTrigger value="back">反面预览</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="front" className="mt-6">
                <div>
                  {/* 调试信息 */}
                  {words.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">暂无单词数据</p>
                      <p className="text-sm">请先添加单词或显示示例单词</p>
                      <Button 
                        onClick={() => setShowSampleWords(true)}
                        className="mt-3"
                        variant="outline"
                      >
                        显示示例单词
                      </Button>
                    </div>
                  )}
                  
                  {words.length > 0 && wordsFiltered.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">单词数据不完整</p>
                      <p className="text-sm">请确保单词有完整的word字段</p>
                      <Button 
                        onClick={handleDebugData}
                        className="mt-3"
                        variant="outline"
                      >
                        调试数据
                      </Button>
                    </div>
                  )}
                  
                  {wordsFiltered.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-5 justify-items-center bg-gray-100 max-w-[1200px] mx-auto py-5 px-5">
                        {pagedWords.map((word) => (
                          <CardPreview
                            key={`front-${word.id}`}
                            data={word as WordCardData}
                            mode="preview"
                            showImage={true}
                            showPhonetic={true}
                            showPhonics={true}
                            showPos={true}
                            showChinese={false}
                            showExample={false}
                            showTranslation={false}
                          />
                        ))}
                      </div>
                      {/* 分页控件 */}
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                          onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                          disabled={previewPage === 1}
                        >上一页</button>
                        <span className="text-sm">第 {previewPage} / {totalPages} 页</span>
                        <button
                          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                          onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                          disabled={previewPage === totalPages}
                        >下一页</button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="back" className="mt-6">
                <div>
                  {/* 调试信息 */}
                  {words.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">暂无单词数据</p>
                      <p className="text-sm">请先添加单词或显示示例单词</p>
                      <Button 
                        onClick={() => setShowSampleWords(true)}
                        className="mt-3"
                        variant="outline"
                      >
                        显示示例单词
                      </Button>
                    </div>
                  )}
                  
                  {words.length > 0 && wordsFiltered.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">单词数据不完整</p>
                      <p className="text-sm">请确保单词有完整的word字段</p>
                      <Button 
                        onClick={handleDebugData}
                        className="mt-3"
                        variant="outline"
                      >
                        调试数据
                      </Button>
                    </div>
                  )}
                  
                  {wordsFiltered.length > 0 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-5 justify-items-center bg-gray-100 max-w-[1200px] mx-auto py-5 px-5">
                        {pagedWords.map((word) => (
                          <CardPreview
                            key={`back-${word.id}`}
                            data={word as WordCardData}
                            mode="print"
                            showImage={false}
                            showPhonetic={false}
                            showPhonics={false}
                            showPos={true}
                            showChinese={true}
                            showExample={true}
                            showTranslation={true}
                          />
                        ))}
                      </div>
                      {/* 分页控件 */}
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                          onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                          disabled={previewPage === 1}
                        >上一页</button>
                        <span className="text-sm">第 {previewPage} / {totalPages} 页</span>
                        <button
                          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                          onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                          disabled={previewPage === totalPages}
                        >下一页</button>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ④ 导出按钮区 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              导出与打印
            </CardTitle>
            <CardDescription>打印设置（浏览器打印或保存为 PDF）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 打印与校准 */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handlePrintAll}
                >
                  <Printer className="h-4 w-4" />
                  全部打印
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePrintFront}
                >
                  <Printer className="h-4 w-4" />
                  打印正面
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePrintBack}
                >
                  <Printer className="h-4 w-4" />
                  打印反面
                </Button>

                {/* 偏移设置 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <Label className="text-sm">背面X偏移（mm，左负右正）</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={backOffsetXmm}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setBackOffsetXmm(v)
                        localStorage.setItem('print_back_offset_x_mm', String(v))
                      }}
                      placeholder="如 0 或 1.0"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm">背面Y偏移（mm，上负下正）</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={backOffsetYmm}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setBackOffsetYmm(v)
                        localStorage.setItem('print_back_offset_y_mm', String(v))
                      }}
                      placeholder="如 0 或 -0.5"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  打印建议：纸张A4、边距无、比例100%、启用背景图形、双面短边翻转。
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
      
      {/* 打印专用容器 - 正面 */}
      <div ref={printRef} className="print-container hidden print:block" id="print-front">
        {/* 正面卡片 */}
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <div 
            key={`front-page-${pageIndex}`}
            className="print-page"
          >
            <div 
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                columnGap: `${COL_GAP_MM}mm`,
                rowGap: `${ROW_GAP_MM}mm`,
                padding: `${PADDING_TOP_MM}mm ${PADDING_MM}mm ${PADDING_BOTTOM_MM}mm ${PADDING_MM}mm`,
                boxSizing: 'border-box',
                width: `${gridWidth}mm`,
                height: '100%',
                margin: '0 auto', // 确保水平居中
              }}
            >
              {wordsFiltered
                .slice(pageIndex * COLS * ROWS, (pageIndex + 1) * COLS * ROWS)
                .map((word, idx) => (
                  <CardPreview
                    key={`front-${pageIndex}-${idx}`}
                    data={word as WordCardData}
                    mode="print"
                    showImage={true}
                    showPhonetic={true}
                    showPhonics={true}
                    showPos={true}
                    showChinese={false}
                    showExample={false}
                    showTranslation={false}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 打印专用容器 - 反面（应用背面偏移） */}
      <div className="print-container hidden print:block" id="print-back" style={backOffsetStyle}>
        {/* 反面卡片 */}
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <div 
            key={`back-page-${pageIndex}`}
            className="print-page"
          >
            <div 
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                columnGap: `${COL_GAP_MM}mm`,
                rowGap: `${ROW_GAP_MM}mm`,
                padding: `${PADDING_TOP_MM}mm ${PADDING_MM}mm ${PADDING_BOTTOM_MM}mm ${PADDING_MM}mm`,
                boxSizing: 'border-box',
                width: `${gridWidth}mm`,
                height: '100%',
                margin: '0 auto', // 确保水平居中
              }}
            >
              {(() => {
                const pageSlice = wordsFiltered.slice(
                  pageIndex * COLS * ROWS,
                  (pageIndex + 1) * COLS * ROWS
                )
                const reordered: typeof pageSlice = []
                for (let r = 0; r < ROWS; r++) {
                  const start = r * COLS
                  const rowItems = pageSlice.slice(start, start + COLS)
                  if (rowItems.length === 0) break
                  // 反面每行列顺序反转（确保与正面短边翻转对齐）
                  reordered.push(...rowItems.reverse())
                }
                return reordered
              })().map((word, idx) => (
                  <CardPreview
                    key={`back-${pageIndex}-${idx}`}
                    data={word as WordCardData}
                    mode="print"
                    showImage={false}
                    showPhonetic={false}
                    showPhonics={false}
                    showPos={true}
                    showChinese={true}
                    showExample={true}
                    showTranslation={true}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 不提供校准页容器 */}

      {/* 数据审核弹窗 */}
      <DataReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        words={(confirmed.length > 0 ? confirmed : inputs).filter(word => word.word.trim())}
        onConfirm={handleConfirmReview}
        onRegenerateImage={handleRegenerateImage}
        onDataUpdate={handleDataUpdate}
      />
    </div>
  )
}
