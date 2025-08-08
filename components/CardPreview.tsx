import React from "react";
import { getCardStyle, CardMode } from "../config/cardConfig";

export interface WordCardData {
  id: number;
  word: string;
  phonetic: string;
  phonics: string;
  chinese: string;
  example: string;
  translation: string;
  imageUrl: string;
}

export interface CardPreviewProps {
  data: WordCardData;
  mode: CardMode;
  showImage?: boolean;
  showPhonetic?: boolean;
  showPhonics?: boolean;
  showChinese?: boolean;
  showExample?: boolean;
  showTranslation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  data,
  mode,
  showImage = true,
  showPhonetic = true,
  showPhonics = true,
  showChinese = true,
  showExample = true,
  showTranslation = true,
  className = "",
  style = {},
}) => {
  // 统一尺寸
  const cardStyle: React.CSSProperties = {
    ...getCardStyle(mode),
    borderRadius: mode === "preview" ? 12 : 4,
    boxShadow: mode === "preview" ? "0 4px 16px 0 rgba(0,0,0,0.10)" : undefined,
    border: mode === "print" ? "1.5px solid #bbb" : "2px solid #888",
    background: "#fff",
    overflow: "hidden",
    ...style,
  };

  // 字体大小可根据mode自定义
  const fontBase = mode === "preview" ? 20 : 18; // 增大基础字号
  const fontTitle = fontBase + 18; // 继续增大单词字体
  const fontPhonetic = fontBase + 2; // 增大音标字号
  const fontPhonics = fontBase; // 增大拼读字号
  const fontChinese = fontBase + 4; // 增大中文字号
  const fontExample = fontBase + 2; // 增大例句字号
  const fontTranslation = fontBase; // 增大翻译字号

  const cardClass = [
    "flex flex-col",
    mode === "preview" ? "transition-all duration-200" : "",
    mode === "print" ? "" : "hover:shadow-lg",
    className,
  ].join(" ");

  return (
    <div className={cardClass} style={cardStyle}>
      {/* 上45%区域 - 图片 */}
      <div
        style={{
          height: "45%",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* 正面：图片或占位符 */}
        {(mode === "preview" || (mode === "print" && !showChinese)) && showImage && (
          <>
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.word}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  borderRadius: 0,
                }}
                draggable={false}
              />
            ) : (
              <div
                style={{
                  width: "60%",
                  height: "60%",
                  background: "#e5e7eb",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                图片占位符
              </div>
            )}
          </>
        )}

        {/* 背面：中文含义 */}
        {mode === "print" && showChinese && data.chinese && (
          <div
            style={{
              fontSize: fontChinese,
              color: "#1a1a1a",
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.4,
              fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'SimHei', sans-serif",
            }}
          >
            {data.chinese}
          </div>
        )}
      </div>

      {/* 下55%区域 - 主内容 */}
      <div
        style={{
          height: "55%",
          padding: mode === "preview" ? 16 : 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {/* 正面内容：单词、音标、拼读 */}
        {(mode === "preview" || (mode === "print" && !showChinese)) && (
          <>
            {/* 上40%区域：单词+音标 */}
            <div style={{
              height: "72.73%", // 40% / 55% = 72.73%
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}>
              {/* 英文单词 */}
              <div style={{ 
                marginBottom: 4,
                textAlign: "center",
              }}>
                <span
                  style={{
                    fontSize: fontTitle,
                    fontWeight: 700,
                    color: "#222",
                    fontFamily: "'Comic Sans MS', 'Arial Rounded MT Bold', 'Century Gothic', 'Verdana', sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  {data.word}
                </span>
              </div>
              
              {/* 音标 */}
              {showPhonetic && data.phonetic && (
                <div style={{ 
                  marginBottom: 0,
                  textAlign: "center",
                }}>
                  <span
                    style={{
                      fontSize: fontPhonetic,
                      color: "#666",
                      fontWeight: 400,
                      fontFamily: "'Arial', 'Helvetica', sans-serif",
                    }}
                  >
                    {data.phonetic}
                  </span>
                </div>
              )}
            </div>
            
            {/* 下15%区域：拼读 */}
            <div style={{
              height: "27.27%", // 15% / 55% = 27.27%
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              marginTop: "5px", // 向下移动拼读区域，与音标保持距离
            }}>
              {showPhonics && data.phonics && (
                <div
                  style={{
                    fontSize: fontPhonics,
                    color: "#888",
                    textAlign: "center",
                    fontFamily: "'Arial', 'Helvetica', sans-serif",
                  }}
                >
                  {data.phonics}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* 反面内容：英文例句、例句中文解释 */}
        {mode === "print" && showChinese && (
          <>
            {/* 英文例句 */}
            {showExample && data.example && (
              <div
                style={{
                  fontSize: fontExample,
                  color: "#333",
                  fontStyle: "italic",
                  marginBottom: 16,
                  lineHeight: 1.4,
                  textAlign: "center",
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                }}
              >
                "{data.example}"
              </div>
            )}
            
            {/* 例句中文解释 */}
            {showTranslation && data.translation && (
              <div
                style={{
                  fontSize: fontTranslation,
                  color: "#666",
                  lineHeight: 1.3,
                  textAlign: "center",
                  fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'SimHei', sans-serif",
                }}
              >
                {data.translation}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardPreview;