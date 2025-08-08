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
import {
  Upload,
  Plus,
  FileText,
  Download,
  Printer,
  Eye,
  Trash2,
  FileUp,
  Wand2,
  Copy,
  FileDown,
  Settings,
  X,
} from "lucide-react"
import { ChangeEvent } from "react"
import Papa from 'papaparse'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

import CardPreview, { WordCardData } from "@/components/CardPreview";
import { pageConfig, mmToPt } from "@/config/cardConfig";

// 1. 定义单词卡片的数据类型（Word接口）
interface Word {
  id: number; // 每个单词的唯一编号
  word: string; // 单词本身
  phonetic: string; // 音标
  phonics: string; // 拼读拆分
  chinese: string; // 中文释义
  example: string; // 英文例句
  translation: string; // 例句翻译
  imageUrl: string; // 图片链接
}

// 示例数据用于展示UI结构
const sampleWords: Word[] = [
  {
    id: 1,
    word: "apple",
    phonetic: "/ˈæpəl/",
    phonics: "ap-ple",
    chinese: "苹果",
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
    example: "My dog likes to play in the park.",
    translation: "我的狗喜欢在公园里玩耍。",
    imageUrl: "",
  },
]

export default function WorkspacePage() {
  // 1. 只用 sampleWords 作为初始值，保证SSR和CSR一致
  const [words, setWords] = useState<Word[]>(sampleWords)
  const [previewMode, setPreviewMode] = useState<"front" | "back">("front")

  
  // 打印相关
  const printRef = useRef<HTMLDivElement>(null)
  
  // 使用浏览器打印功能
  const handlePrint = () => {
    if (printRef.current) {
      window.print()
    }
  }
  
  // 新增：文件上传相关状态
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)


  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  
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
      localStorage.removeItem("words")
      setWords(sampleWords) // 恢复示例数据
      alert('数据已清除，已恢复示例数据！')
    }
  }



  // 计算分页数据
  const totalCards = words.filter((word) => word.word).length
  const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerPage))
  const pagedWords = words.filter((word) => word.word).slice(0, cardsPerPage)

  // 2. 组件挂载后（只在客户端），用useEffect加载localStorage数据
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("words")
      if (saved) {
        try {
          setWords(JSON.parse(saved) as Word[])
        } catch {
          // 解析失败则不处理
        }
      }
    }
  }, [])

  // 3. 每当words变化时，自动保存到localStorage
  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words))
  }, [words])

  // 5. 手动添加单词的处理函数
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
      example: "",
      translation: "",
      imageUrl: "",
    }
    
    // 将新单词添加到状态中（添加到列表末尾）
    setWords(prevWords => [...prevWords, newWord])
  }

  // 6. 表格编辑：输入框双向绑定
  const handleInputChange = (id: number, field: keyof Word, value: string) => {
    setWords(prevWords => prevWords.map(word =>
      word.id === id ? { ...word, [field]: value } : word
    ))
  }

  // 7. 删除单词功能
  const handleDeleteWord = (id: number) => {
    setWords(prevWords => prevWords.filter(word => word.id !== id))
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
          complete: (result) => {
            console.log("CSV解析结果:", result)
            if (result.errors && result.errors.length > 0) {
              setUploadStatus("error")
              setUploadMessage("CSV解析出错，请检查文件格式")
              return
            }
            // 字段校验
            const requiredFields = [
              'word',
              'phonetic',
              'phonics',
              'chinese',
              'example',
              'translation',
              'imageUrl',
            ]
            const fields = result.meta.fields as string[]
            const missingFields = requiredFields.filter(f => !fields.includes(f))
            if (missingFields.length > 0) {
              setUploadStatus("error")
              setUploadMessage(`缺少字段：${missingFields.join('、')}，请下载模板并按要求填写`)
              return
            }
            // 数据转换与合并
            const newWords: Word[] = (result.data as any[]).map(row => ({
              id: Date.now() + Math.floor(Math.random() * 1000000), // 只在客户端事件中生成
              word: row.word?.trim() || "",
              phonetic: row.phonetic?.trim() || "",
              phonics: row.phonics?.trim() || "",
              chinese: row.chinese?.trim() || "",
              example: row.example?.trim() || "",
              translation: row.translation?.trim() || "",
              imageUrl: row.imageUrl?.trim() || "",
            }))
            setWords(prevWords => [...prevWords, ...newWords])
            setUploadStatus("success")
            setUploadMessage(`成功导入${newWords.length}条单词数据！`)
            // 3秒后重置状态
            setTimeout(() => {
              setUploadStatus("idle")
              setUploadMessage("")
            }, 3000)
          },
          error: (error) => {
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
    if (printRef.current) {
      // 临时设置只显示正面
      const printContainer = printRef.current
      const backPages = printContainer.querySelectorAll('.print-page-back')
      backPages.forEach(page => (page as HTMLElement).style.display = 'none')
      
      window.print()
      
      // 打印后恢复显示
      backPages.forEach(page => (page as HTMLElement).style.display = 'block')
    }
  }

  // 打印反面
  const handlePrintBack = () => {
    if (printRef.current) {
      // 临时设置只显示反面
      const printContainer = printRef.current
      const frontPages = printContainer.querySelectorAll('.print-page:not(.print-page-back)')
      frontPages.forEach(page => (page as HTMLElement).style.display = 'none')
      
      window.print()
      
      // 打印后恢复显示
      frontPages.forEach(page => (page as HTMLElement).style.display = 'block')
    }
  }

  // 新增：PDF导出功能
  const handleExportPDF = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      const validWords = words.filter(word => word.word.trim())
      if (validWords.length === 0) {
        alert('请先添加一些单词')
        return
      }

      // 创建PDF文档
      const pdfDoc = await PDFDocument.create()
      
      // 尝试使用支持Unicode的字体，如果失败则回退到标准字体
      let font: any, boldFont: any
      try {
        // 尝试嵌入支持Unicode的字体
        font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
      } catch (error) {
        console.warn('无法加载Times Roman字体，使用Helvetica:', error)
        font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      }

      // 辅助函数：安全绘制文本，处理不支持的字符
      const safeDrawText = (page: any, text: string, options: any) => {
        if (!text || text.trim() === '') return
        
        try {
          // 尝试直接绘制
          page.drawText(text, options)
        } catch (error) {
          console.warn('文本绘制失败，尝试清理:', text, error)
          
          // 如果失败，尝试清理文本中的特殊字符
          let cleanText = text
            .replace(/[ˈˌːˑ]/g, '') // 移除音标重音符号
            .replace(/[^\x00-\x7F]/g, '') // 移除所有非ASCII字符
            .trim()
          
          // 如果清理后为空，使用原始文本的ASCII部分
          if (!cleanText) {
            cleanText = text.replace(/[^\x00-\x7F]/g, '').trim()
          }
          
          if (cleanText) {
            try {
              page.drawText(cleanText, options)
            } catch (cleanError) {
              console.warn('清理后仍无法绘制文本:', cleanText, cleanError)
              // 如果还是失败，绘制一个占位符
              page.drawText('(text)', options)
            }
          }
        }
      }

      // 设置页面尺寸（A4）
      let pageWidth = mmToPt(pageConfig.a4.width);
      let pageHeight = mmToPt(pageConfig.a4.height);

      // 卡片尺寸
      const cardWidth = mmToPt(pageConfig.card.width);
      const cardHeight = mmToPt(pageConfig.card.height);

      // 行列数
      const cardsPerRow = pageConfig.cols;
      const cardsPerCol = pageConfig.rows;

      // 间距和边距
      const colGap = mmToPt(pageConfig.colGap);
      const rowGap = mmToPt(pageConfig.rowGap);
      const paddingTop = mmToPt(pageConfig.paddingTop);
      const paddingBottom = mmToPt(pageConfig.paddingBottom);
      const paddingSide = mmToPt(pageConfig.paddingSide);
      
      // 根据设置计算布局
      let totalCardsPerPage = cardsPerRow * cardsPerCol
      
      // 计算间距
      const marginX = (pageWidth - cardsPerRow * cardWidth) / (cardsPerRow + 1)
      const marginY = (pageHeight - cardsPerCol * cardHeight) / (cardsPerCol + 1)

      // 生成所有页面
      const totalPages = Math.ceil(validWords.length / totalCardsPerPage)
      
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        // 创建正面页面
        const frontPage = pdfDoc.addPage([pageWidth, pageHeight])
        
        // 获取当前页的单词
        const pageWords = validWords.slice(pageIndex * totalCardsPerPage, (pageIndex + 1) * totalCardsPerPage)
        
        // 绘制每张卡片
        pageWords.forEach((word, cardIndex) => {
          const row = Math.floor(cardIndex / cardsPerRow)
          const col = cardIndex % cardsPerRow
          
          const x = marginX + col * (cardWidth + marginX)
          const y = pageHeight - marginY - row * (cardHeight + marginY) - cardHeight
          
          // 绘制卡片边框
          frontPage.drawRectangle({
            x,
            y,
            width: cardWidth,
            height: cardHeight,
            borderWidth: 1,
            borderColor: rgb(0.8, 0.8, 0.8),
            color: rgb(1, 1, 1),
          })
          
          // 上45%区域 - 图片区域（灰色背景）
          const imageAreaHeight = cardHeight * 0.45;
          frontPage.drawRectangle({
            x: x + 2,
            y: y + cardHeight - imageAreaHeight - 2,
            width: cardWidth - 4,
            height: imageAreaHeight,
            color: rgb(0.95, 0.95, 0.95),
          })
          
          // 绘制图片占位符（如果有图片URL）
          if (word.imageUrl) {
            try {
              // 这里可以添加图片加载逻辑
              // 暂时绘制一个占位符
              safeDrawText(frontPage, '图片', {
                x: x + cardWidth / 2 - 20,
                y: y + cardHeight - imageAreaHeight / 2 - 10,
                size: 12,
                font,
                color: rgb(0.5, 0.5, 0.5),
              })
            } catch (error) {
              console.log('图片加载失败:', error)
            }
          }
          
          // 下55%区域 - 主内容区域
          const contentAreaHeight = cardHeight * 0.55;
          const contentAreaY = y + cardHeight - imageAreaHeight - contentAreaHeight;
          
          // 中40%区域 - 单词+音标
          const wordAreaHeight = contentAreaHeight * 0.727; // 40% / 55% = 72.7%
          const wordAreaY = contentAreaY + contentAreaHeight - wordAreaHeight;
          
          // 绘制单词
          safeDrawText(frontPage, word.word, {
            x: x + cardWidth / 2 - 30,
            y: wordAreaY + wordAreaHeight / 2 + 10,
            size: 20,
            font: boldFont,
            color: rgb(0, 0, 0),
          })
          
          // 绘制音标
          if (word.phonetic) {
            safeDrawText(frontPage, word.phonetic, {
              x: x + cardWidth / 2 - 20,
              y: wordAreaY + wordAreaHeight / 2 - 10,
              size: 14,
              font,
              color: rgb(0.5, 0.5, 0.5),
            })
          }
          
          // 下15%区域 - 拼读
          const phonicsAreaHeight = contentAreaHeight * 0.273; // 15% / 55% = 27.3%
          const phonicsAreaY = contentAreaY;
          
          // 绘制自然拼读
          if (word.phonics) {
            safeDrawText(frontPage, word.phonics, {
              x: x + cardWidth / 2 - 20,
              y: phonicsAreaY + phonicsAreaHeight / 2 - 5,
              size: 12,
              font,
              color: rgb(0.3, 0.3, 0.3),
            })
          }
        })
        
        // 创建反面页面
        {
          const backPage = pdfDoc.addPage([pageWidth, pageHeight])
          
          // 绘制反面卡片
          pageWords.forEach((word, cardIndex) => {
            const row = Math.floor(cardIndex / cardsPerRow)
            const col = cardIndex % cardsPerRow
            
            const x = marginX + col * (cardWidth + marginX)
            const y = pageHeight - marginY - row * (cardHeight + marginY) - cardHeight
            
            // 绘制卡片边框
            backPage.drawRectangle({
              x,
              y,
              width: cardWidth,
              height: cardHeight,
              borderWidth: 1,
              borderColor: rgb(0.8, 0.8, 0.8),
              color: rgb(1, 1, 1),
            })
            
            // 上45%区域 - 中文释义（灰色背景）
            const chineseAreaHeight = cardHeight * 0.45;
            backPage.drawRectangle({
              x: x + 2,
              y: y + cardHeight - chineseAreaHeight - 2,
              width: cardWidth - 4,
              height: chineseAreaHeight,
              color: rgb(0.95, 0.95, 0.95),
            })
            
            // 绘制中文释义
            if (word.chinese) {
              safeDrawText(backPage, word.chinese, {
                x: x + cardWidth / 2 - 20,
                y: y + cardHeight - chineseAreaHeight / 2 - 10,
                size: 16,
                font: boldFont,
                color: rgb(0, 0, 0),
              })
            }
            
            // 下55%区域 - 英文例句+中文翻译
            const contentAreaHeight = cardHeight * 0.55;
            const contentAreaY = y + cardHeight - chineseAreaHeight - contentAreaHeight;
            
            // 绘制英文例句
            if (word.example) {
              const exampleLines = word.example.split(' ').reduce((lines: string[], word: string) => {
                const lastLine = lines[lines.length - 1] || ''
                if ((lastLine + ' ' + word).length > 25) {
                  lines.push(word)
                } else {
                  lines[lines.length - 1] = lastLine ? lastLine + ' ' + word : word
                }
                return lines
              }, [])
              
              exampleLines.forEach((line, lineIndex) => {
                safeDrawText(backPage, line, {
                  x: x + cardWidth / 2 - 30,
                  y: contentAreaY + contentAreaHeight - 40 - lineIndex * 15,
                  size: 12,
                  font,
                  color: rgb(0, 0, 0),
                })
              })
            }
            
            // 绘制中文翻译
            if (word.translation) {
              safeDrawText(backPage, word.translation, {
                x: x + cardWidth / 2 - 30,
                y: contentAreaY + 20,
                size: 12,
                font,
                color: rgb(0.5, 0.5, 0.5),
              })
            }
          })
        }
        
        setExportProgress(((pageIndex + 1) / totalPages) * 100)
      }
      
      // 生成PDF并下载
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `word-cards-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert('PDF导出失败，请重试')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

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
          {/* 左栏：CSV 上传模块 */}
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

          {/* 右栏：手动添加单词 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                手动添加单词
              </CardTitle>
              <CardDescription>逐个添加单词数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 添加单词按钮 */}
              <Button 
                onClick={handleAddWord}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加新单词
              </Button>
              
              {/* 单词列表 */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {words.map((word) => (
                  <div key={word.id} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="单词"
                        value={word.word}
                        onChange={(e) => handleInputChange(word.id, 'word', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="音标"
                        value={word.phonetic}
                        onChange={(e) => handleInputChange(word.id, 'phonetic', e.target.value)}
                        className="text-sm"
                      />
                    </div>
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
            </CardContent>
          </Card>
        </div>

        {/* ② 卡片预览区 */}
        <Card>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-5 justify-items-center bg-gray-100 max-w-[1200px] mx-auto py-5 px-5">
                    {pagedWords.map((word) => (
                      <CardPreview
                        key={`front-${word.id}`}
                        data={word as WordCardData}
                        mode="preview"
                        showImage={true}
                        showPhonetic={true}
                        showPhonics={true}
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
                </div>
              </TabsContent>

              <TabsContent value="back" className="mt-6">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-5 justify-items-center bg-gray-100 max-w-[1200px] mx-auto py-5 px-5">
                    {pagedWords.map((word) => (
                      <CardPreview
                        key={`back-${word.id}`}
                        data={word as WordCardData}
                        mode="print"
                        showImage={false}
                        showPhonetic={false}
                        showPhonics={false}
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
            <CardDescription>选择导出格式和打印设置</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 导出选项 */}
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4" />
                  {isExporting ? `导出中 ${Math.round(exportProgress)}%` : '导出为 PDF'}
                </Button>

                <Button 
                  size="lg" 
                  className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  浏览器打印
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
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
      
      {/* 打印专用容器 */}
      <div ref={printRef} className="print-container hidden print:block">
        {/* 正面卡片 */}
        {Array.from({ length: Math.ceil(words.length / (COLS * ROWS)) }, (_, pageIndex) => (
          <div 
            key={`print-page-${pageIndex}`}
            className="print-page"
            style={{
              width: '210mm',
              height: '297mm',
              pageBreakAfter: pageIndex < Math.ceil(words.length / (COLS * ROWS)) - 1 ? 'always' : 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', // 改为垂直居中
              padding: '0',
              margin: '0',
            }}
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
              {words
                .slice(pageIndex * COLS * ROWS, (pageIndex + 1) * COLS * ROWS)
                .map((word, idx) => (
                  <CardPreview
                    key={`print-front-${pageIndex}-${idx}`}
                    data={word as WordCardData}
                    mode="print"
                    showImage={true}
                    showPhonetic={true}
                    showPhonics={true}
                    showChinese={false}
                    showExample={false}
                    showTranslation={false}
                  />
                ))}
            </div>
          </div>
        ))}
        
        {/* 反面卡片 */}
        {Array.from({ length: Math.ceil(words.length / (COLS * ROWS)) }, (_, pageIndex) => (
          <div 
            key={`print-page-back-${pageIndex}`}
            className="print-page"
            style={{
              width: '210mm',
              height: '297mm',
              pageBreakAfter: pageIndex < Math.ceil(words.length / (COLS * ROWS)) - 1 ? 'always' : 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', // 改为垂直居中
              padding: '0',
              margin: '0',
            }}
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
              {words
                .slice(pageIndex * COLS * ROWS, (pageIndex + 1) * COLS * ROWS)
                .map((word, idx) => (
                  <CardPreview
                    key={`print-back-${pageIndex}-${idx}`}
                    data={word as WordCardData}
                    mode="print"
                    showImage={false}
                    showPhonetic={false}
                    showPhonics={false}
                    showChinese={true}
                    showExample={true}
                    showTranslation={true}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
