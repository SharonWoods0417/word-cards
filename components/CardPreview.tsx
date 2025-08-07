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
  const fontBase = mode === "preview" ? 18 : 16;
  const fontTitle = fontBase + 6;
  const fontPhonetic = fontBase;
  const fontPhonics = fontBase - 2;
  const fontChinese = fontBase;
  const fontExample = fontBase - 2;
  const fontTranslation = fontBase - 4;

  const cardClass = [
    "flex flex-col",
    mode === "preview" ? "transition-all duration-200" : "",
    mode === "print" ? "" : "hover:shadow-lg",
    className,
  ].join(" ");

  return (
    <div className={cardClass} style={cardStyle}>
      {/* 图片区域 */}
      {showImage && data.imageUrl && (
        <div
          style={{
            height: "38%",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={data.imageUrl}
            alt={data.word}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: 6,
            }}
            draggable={false}
          />
        </div>
      )}

      {/* 主内容区 */}
      <div
        style={{
          flex: 1,
          padding: mode === "preview" ? 16 : 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* 单词 + 音标 */}
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              fontSize: fontTitle,
              fontWeight: 700,
              color: "#222",
              marginRight: showPhonetic ? 8 : 0,
            }}
          >
            {data.word}
          </span>
          {showPhonetic && data.phonetic && (
            <span
              style={{
                fontSize: fontPhonetic,
                color: "#666",
                fontWeight: 400,
              }}
            >
              {data.phonetic}
            </span>
          )}
        </div>
        {/* 拼读 */}
        {showPhonics && data.phonics && (
          <div
            style={{
              fontSize: fontPhonics,
              color: "#888",
              marginBottom: 4,
            }}
          >
            {data.phonics}
          </div>
        )}
        {/* 中文释义 */}
        {showChinese && data.chinese && (
          <div
            style={{
              fontSize: fontChinese,
              color: "#1a1a1a",
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            {data.chinese}
          </div>
        )}
        {/* 例句 & 翻译 */}
        {(showExample || showTranslation) && (data.example || data.translation) && (
          <div style={{ marginTop: 6 }}>
            {showExample && data.example && (
              <div
                style={{
                  fontSize: fontExample,
                  color: "#333",
                  fontStyle: "italic",
                  marginBottom: 2,
                  lineHeight: 1.3,
                }}
              >
                “{data.example}”
              </div>
            )}
            {showTranslation && data.translation && (
              <div
                style={{
                  fontSize: fontTranslation,
                  color: "#666",
                  lineHeight: 1.2,
                }}
              >
                {data.translation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPreview;