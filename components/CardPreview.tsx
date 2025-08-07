import React from "react";

// 工具函数：根据 size 返回卡片宽高（3:4 比例）
export function getCardDimensions(size: "sm" | "md" | "lg" = "md") {
  // 单位：px，可根据需要改为 mm
  switch (size) {
    case "sm":
      return { width: 120, height: 160 };
    case "lg":
      return { width: 240, height: 320 };
    case "md":
    default:
      return { width: 180, height: 240 };
  }
}

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
  mode: "preview" | "print" | "export";
  size?: "sm" | "md" | "lg";
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
  size = "md",
  showImage = true,
  showPhonetic = true,
  showPhonics = true,
  showChinese = true,
  showExample = true,
  showTranslation = true,
  className = "",
  style = {},
}) => {
  const { width, height } = getCardDimensions(size);

  // mode 控制样式
  const isPreview = mode === "preview";
  const isPrint = mode === "print";
  const isExport = mode === "export";

  // 统一字体大小（可被外部覆盖）
  const fontBase = size === "lg" ? 22 : size === "sm" ? 14 : 18;
  const fontTitle = fontBase + 6;
  const fontPhonetic = fontBase;
  const fontPhonics = fontBase - 2;
  const fontChinese = fontBase;
  const fontExample = fontBase - 2;
  const fontTranslation = fontBase - 4;

  // 卡片基础样式
  const cardStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: isPreview ? 12 : 4,
    boxShadow: isPreview ? "0 4px 16px 0 rgba(0,0,0,0.10)" : undefined,
    border: isPrint || isExport ? "1.5px solid #bbb" : "2px solid #888",
    background: "#fff",
    overflow: "hidden",
    ...style,
  };

  // 兼容打印和导出，避免 web-only 效果
  const cardClass = [
    "flex flex-col",
    isPreview ? "transition-all duration-200" : "",
    isPrint || isExport ? "" : "hover:shadow-lg",
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
          padding: isPreview ? 16 : 10,
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