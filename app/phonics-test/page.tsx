"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generatePhonicsSplit, testPhonicsSplit } from "@/lib/phonics"

export default function PhonicsTestPage() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState("")
  const [testResults, setTestResults] = useState<string[]>([])

  const handleTest = () => {
    if (word.trim()) {
      const split = generatePhonicsSplit(word.trim())
      setResult(split)
    }
  }

  const handleRunTests = () => {
    const testWords = [
      'rabbit', 'apple', 'watermelon', 'disappear', 'tiger', 
      'celebrate', 'banana', 'nation', 'football', 'little',
      'happy', 'market', 'paint', 'cake', 'ago', 'computer',
      'elephant', 'beautiful', 'important', 'different'
    ]

    const results = testWords.map(word => {
      const split = generatePhonicsSplit(word)
      return `${word} → ${split}`
    })

    setTestResults(results)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">音节拆分测试工具</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 单个单词测试 */}
        <Card>
          <CardHeader>
            <CardTitle>单个单词测试</CardTitle>
            <CardDescription>
              输入单词，查看音节拆分结果
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">输入单词</Label>
              <Input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="例如：apple, computer, elephant"
                onKeyPress={(e) => e.key === 'Enter' && handleTest()}
              />
            </div>
            
            <Button onClick={handleTest} className="w-full">
              测试拆分
            </Button>

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-800">拆分结果：</div>
                <div className="text-lg text-green-700 mt-2">{result}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 批量测试 */}
        <Card>
          <CardHeader>
            <CardTitle>批量测试</CardTitle>
            <CardDescription>
              运行预设的测试单词列表
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRunTests} className="w-full">
              运行批量测试
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold text-gray-800">测试结果：</div>
                <div className="max-h-96 overflow-y-auto space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 规则说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>拆分规则说明</CardTitle>
          <CardDescription>
            基于 phonics_split_rules_v4.0_syllable.md 规则实现
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div><strong>1. 复合词优先：</strong> football → foot-ball</div>
            <div><strong>2. Final Stable Syllable：</strong> apple → ap-ple</div>
            <div><strong>3. 前后缀：</strong> disappear → dis-a-ppear</div>
            <div><strong>4. VC/CV 拆分：</strong> rabbit → rab-bit</div>
            <div><strong>5. 元音组合不拆：</strong> paint → paint</div>
            <div><strong>6. Magic-e 不拆：</strong> cake → cake</div>
            <div><strong>7. R控制元音：</strong> market → mar-ket</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 