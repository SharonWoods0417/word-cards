"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { checkApiConfig } from "@/lib/api"

export default function ApiTestPage() {
  const [apiStatus, setApiStatus] = useState<{
    openRouter: boolean;
    pexels: boolean;
  } | null>(null)

  const checkStatus = () => {
    const status = checkApiConfig()
    setApiStatus(status)
    console.log('API配置状态:', status)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">API 配置测试</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>API 密钥配置状态</CardTitle>
          <CardDescription>
            检查 OpenRouter 和 Pexels API 密钥是否正确配置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkStatus} className="w-full">
            重新检查配置
          </Button>

          {apiStatus && (
            <div className="space-y-3">
              {/* OpenRouter API 状态 */}
              <Alert variant={apiStatus.openRouter ? "default" : "destructive"}>
                {apiStatus.openRouter ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>OpenRouter API:</strong> {apiStatus.openRouter ? "已配置" : "未配置"}
                  {!apiStatus.openRouter && (
                    <div className="mt-2 text-sm">
                      请在 <code>.env.local</code> 文件中添加 <code>NEXT_PUBLIC_OPENROUTER_API_KEY</code>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Pexels API 状态 */}
              <Alert variant={apiStatus.pexels ? "default" : "destructive"}>
                {apiStatus.pexels ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>Pexels API:</strong> {apiStatus.pexels ? "已配置" : "未配置"}
                  {!apiStatus.pexels && (
                    <div className="mt-2 text-sm">
                      请在 <code>.env.local</code> 文件中添加 <code>NEXT_PUBLIC_PEXELS_API_KEY</code>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* 配置说明 */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>配置说明：</strong>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    <li>在项目根目录创建 <code>.env.local</code> 文件</li>
                    <li>添加 OpenRouter API 密钥：<code>NEXT_PUBLIC_OPENROUTER_API_KEY=your_key_here</code></li>
                    <li>添加 Pexels API 密钥：<code>NEXT_PUBLIC_PEXELS_API_KEY=your_key_here</code></li>
                    <li>重启开发服务器以加载新的环境变量</li>
                    <li>当前使用的AI模型：<code>openai/gpt-4o-mini</code></li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 