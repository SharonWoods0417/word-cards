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
  const [cardSpacing, setCardSpacing] = useState([16])
  const [cardMargin, setCardMargin] = useState([8])
  
  // 新增：文件上传相关状态
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 新增：导出相关状态
  const [exportSettings, setExportSettings] = useState({
    cardsPerPage: 6, // 每页卡片数量
    alignment: "double" as "double" | "single", // 对齐方式
    paperSize: "a4" as "a4" | "letter" | "a3", // 纸张尺寸
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  
  // 预览相关状态
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [previewScale, setPreviewScale] = useState(0.5) // 动态缩放比例

  // 预览分页相关状态
  const [previewPage, setPreviewPage] = useState(1)
  const cardsPerPage = 6 // 每页6张卡片

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

  // 动态计算预览缩放比例 - 使用固定像素值
  const calculatePreviewScale = useCallback(() => {
    if (typeof window === 'undefined') return 0.5
    
    // A4纸张固定像素尺寸（794 × 1123 px）
    const a4Width = 794
    const a4Height = 1123
    
    // 获取可用空间（减去modal边距和header）
    const modalPadding = 16 // 减少padding，最大化可用空间
    const headerHeight = 60 // header高度
    const availableWidth = window.innerWidth - (modalPadding * 2) - 16
    const availableHeight = window.innerHeight - headerHeight - (modalPadding * 2) - 16
    
    // 使用用户建议的公式计算缩放比例
    const scaleRatio = Math.min(
      availableWidth / (2 * a4Width), // 两张A4页面
      availableHeight / a4Height
    ) * 0.97 // 预留 3% 安全边距，确保完全落入容器内
    
    // 确保缩放比例在合理范围内
    return Math.max(0.15, Math.min(0.9, scaleRatio))
  }, [])

  // 监听窗口大小变化，重新计算缩放比例
  useEffect(() => {
    const updateScale = () => {
      setPreviewScale(calculatePreviewScale())
    }
    
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [calculatePreviewScale])

  // 监听words和previewMode变化，自动回到第一页
  useEffect(() => {
    setPreviewPage(1)
  }, [words.length, previewMode])

  // 计算分页数据
  const totalCards = words.filter((word) => word.word).length
  const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerPage))
  const pagedWords = words.filter((word) => word.word).slice((previewPage - 1) * cardsPerPage, previewPage * cardsPerPage)

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
  const handleExportSettingChange = (setting: keyof typeof exportSettings, value: any) => {
    setExportSettings(prev => ({ ...prev, [setting]: value }))
  }

  // 预览打印效果
  const handlePreviewPrint = () => {
    setShowPrintPreview(true)
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
        
        // 如果是双面对齐，创建反面页面
        if (exportSettings.alignment === "double") {
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
      <div className="container mx-auto max-w-7xl p-6 space-y-8">
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
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        {uploadMessage}
                      </div>
                    )}
                    {uploadStatus !== 'uploading' && uploadMessage}
                  </div>
                )}
                
                {/* 默认提示 */}
                {uploadStatus === 'idle' && (
                  <>
                    <p className="font-medium text-gray-700 mb-2">点击上传或拖拽CSV文件</p>
                    <p className="text-sm text-muted-foreground mb-2">支持的字段格式：</p>
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      <p>word, phonetic, phonics, chinese,</p>
                      <p>example, translation, imageUrl</p>
                    </div>
                  </>
                )}
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={e => handleUploadClick(e)}
                    disabled={uploadStatus === 'uploading'}
                  >
                    {uploadStatus === 'uploading' ? '处理中...' : '选择文件'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-muted-foreground"
                    onClick={e => { e.stopPropagation(); handleDownloadTemplate(); }}
                  >
                    <FileDown className="h-4 w-4" />
                    下载模板
                  </Button>
                </div>
              </div>

              {/* CSV上传提示 */}
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 上传后将自动添加到下方表格，不会覆盖已有的手动添加项
              </div>
            </CardContent>
          </Card>

          {/* 右栏：手动添加单词模块 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                手动添加单词
              </CardTitle>
              <CardDescription>逐个添加新的单词条目</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <p className="text-muted-foreground text-sm">点击按钮添加新的空白单词行</p>
                <div className="flex gap-2">
                  <Button className="flex items-center gap-2" onClick={handleAddWord}>
                    <Plus className="h-4 w-4" />
                    添加单词
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Copy className="h-4 w-4" />
                    批量添加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ② 编辑区（表格形式） */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  单词编辑表格
                </CardTitle>
                <CardDescription>编辑每个单词的详细信息，空白字段将由系统自动补全</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Copy className="h-4 w-4" />
                粘贴多行
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">单词</TableHead>
                    <TableHead className="w-[120px]">音标</TableHead>
                    <TableHead className="w-[120px]">拼读拆分</TableHead>
                    <TableHead className="w-[100px]">中文释义</TableHead>
                    <TableHead className="w-[200px]">英文例句</TableHead>
                    <TableHead className="w-[200px]">例句翻译</TableHead>
                    <TableHead className="w-[150px]">图片URL</TableHead>
                    <TableHead className="w-[60px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {words.map((word, index) => (
                    <TableRow key={word.id}>
                      <TableCell>
                        <Input
                          value={word.word}
                          onChange={e => handleInputChange(word.id, "word", e.target.value)}
                          placeholder="输入单词"
                          className={"min-w-0 " + (!word.word ? "border-red-500" : "")}
                        />
                        {!word.word && (
                          <p className="text-xs text-red-500 mt-1">单词不能为空</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            value={word.phonetic}
                            onChange={e => handleInputChange(word.id, "phonetic", e.target.value)}
                            placeholder="/ˈwɜːrd/"
                            className="min-w-0"
                          />
                          {!word.phonetic && (
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-muted-foreground">
                              <Wand2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {!word.phonetic && <p className="text-xs text-muted-foreground mt-1">系统补全</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            value={word.phonics}
                            onChange={e => handleInputChange(word.id, "phonics", e.target.value)}
                            placeholder="w-or-d"
                            className="min-w-0"
                          />
                          {!word.phonics && (
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-muted-foreground">
                              <Wand2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {!word.phonics && <p className="text-xs text-muted-foreground mt-1">系统补全</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            value={word.chinese}
                            onChange={e => handleInputChange(word.id, "chinese", e.target.value)}
                            placeholder="中文意思"
                            className="min-w-0"
                          />
                          {!word.chinese && (
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-muted-foreground">
                              <Wand2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {!word.chinese && <p className="text-xs text-muted-foreground mt-1">系统补全</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Textarea
                            value={word.example}
                            onChange={e => handleInputChange(word.id, "example", e.target.value)}
                            placeholder="英文例句"
                            className="min-w-0 resize-none min-h-[60px]"
                          />
                          {!word.example && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 self-start mt-1 text-muted-foreground"
                            >
                              <Wand2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {!word.example && <p className="text-xs text-muted-foreground mt-1">系统补全</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Textarea
                            value={word.translation}
                            onChange={e => handleInputChange(word.id, "translation", e.target.value)}
                            placeholder="例句翻译"
                            className="min-w-0 resize-none min-h-[60px]"
                          />
                          {!word.translation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 self-start mt-1 text-muted-foreground"
                            >
                              <Wand2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {!word.translation && <p className="text-xs text-muted-foreground mt-1">系统补全</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            value={word.imageUrl}
                            onChange={e => handleInputChange(word.id, "imageUrl", e.target.value)}
                            placeholder="图片链接"
                            className="min-w-0"
                          />
                          {!word.imageUrl && (
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-muted-foreground">
                              <Wand2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {!word.imageUrl && <p className="text-xs text-muted-foreground mt-1">系统生成</p>}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteWord(word.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* ③ 卡片预览区（严格按比例设计） */}
        <Card id="card-preview">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              卡片预览
            </CardTitle>
            <CardDescription>预览打印效果，选择查看正面或反面</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as "front" | "back")}>
              <div className="flex justify-center mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 导出选项 */}
              <div className="space-y-4">
                <h3 className="font-semibold">导出选项</h3>
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
                    variant="outline" 
                    size="lg" 
                    className="w-full flex items-center gap-2 bg-transparent"
                    onClick={handlePreviewPrint}
                  >
                    <Eye className="h-4 w-4" />
                    预览打印效果
                  </Button>
                </div>
              </div>

              {/* 基础打印设置 */}
              <div className="space-y-4">
                <h3 className="font-semibold">基础设置</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>每页卡片数量</Label>
                    <Select 
                      value={exportSettings.cardsPerPage.toString()} 
                      onValueChange={(value) => handleExportSettingChange('cardsPerPage', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4张/页</SelectItem>
                        <SelectItem value="6">6张/页</SelectItem>
                        <SelectItem value="8">8张/页</SelectItem>
                        <SelectItem value="9">9张/页</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>对齐方式</Label>
                    <Select 
                      value={exportSettings.alignment}
                      onValueChange={(value) => handleExportSettingChange('alignment', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="double">双面对齐</SelectItem>
                        <SelectItem value="single">单面打印</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 高级打印设置 */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  高级设置
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>卡片间距: {cardSpacing[0]}px</Label>
                    <Slider
                      value={cardSpacing}
                      onValueChange={setCardSpacing}
                      max={32}
                      min={4}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>页面边距: {cardMargin[0]}px</Label>
                    <Slider
                      value={cardMargin}
                      onValueChange={setCardMargin}
                      max={24}
                      min={4}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>纸张尺寸</Label>
                    <Select 
                      value={exportSettings.paperSize}
                      onValueChange={(value) => handleExportSettingChange('paperSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (210×297mm)</SelectItem>
                        <SelectItem value="letter">Letter (216×279mm)</SelectItem>
                        <SelectItem value="a3">A3 (297×420mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 打印预览弹窗 */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-screen-2xl w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">打印预览 - 第1页</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowPrintPreview(false)}
                >
                  关闭
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                >
                  {isExporting ? `导出中 ${Math.round(exportProgress)}%` : '开始导出'}
                </Button>
              </div>
            </div>
            
            {/* 打印预览A4纸区域上方，显示当前卡片宽高 */}
            {/* 删除顶部中央的全局尺寸提示div */}

            <div className="flex-grow flex items-center justify-center">
              {/* 缩放比例显示 - 右上角 */}
              <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border z-10">
                {Math.round(previewScale * 100)}%
              </div>
              
              {/* 预览区域容器 - 使用固定像素尺寸 */}
              <div className="flex items-center justify-center" style={{ 
                gap: '16px',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center'
              }}>
                {/* 第一页正面预览 - A4纸竖向 */}
                <div className="flex flex-col items-center">
                  {/* A4纸标题及尺寸提示 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
                    <h4 className="text-sm font-medium text-gray-700 mr-3">
                      第{previewPage}页 - 正面
                    </h4>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                      卡片宽度：{desiredCardWidth}mm，高度：{CARD_HEIGHT}mm
                    </span>
                  </div>
                  <div
                    className="bg-white shadow-xl"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      border: '2px dashed #ccc',
                      position: 'relative',
                      boxSizing: 'border-box',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: `${gridWidth}mm`,
                        margin: '0 auto',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
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
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        {words.slice(0, COLS * ROWS).map((word, idx) => (
                          <CardPreview
                            key={`preview-print-front-${idx}`}
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
                  </div>
                </div>

                {/* 第一页反面预览 - A4纸竖向 */}
                <div className="flex flex-col items-center">
                  {/* A4纸标题及尺寸提示 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
                    <h4 className="text-sm font-medium text-gray-700 mr-3">
                      第{previewPage}页 - 反面
                    </h4>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                      卡片宽度：{desiredCardWidth}mm，高度：{CARD_HEIGHT}mm
                    </span>
                  </div>
                  <div
                    className="bg-white shadow-xl"
                    style={{
                      width: '210mm',
                      height: '297mm',
                      border: '2px dashed #ccc',
                      position: 'relative',
                      boxSizing: 'border-box',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: `${gridWidth}mm`,
                        margin: '0 auto',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
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
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        {words.slice(0, COLS * ROWS).map((word, idx) => (
                          <CardPreview
                            key={`preview-print-back-${idx}`}
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
                  </div>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      )}
    </div>
  )
}
