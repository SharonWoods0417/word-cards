export type CardMode = 'preview' | 'print';

export const cardDimensions: Record<CardMode, {
  width: number;
  height: number;
  unit: 'px' | 'mm';
}> = {
  preview: { width: 75, height: 90, unit: 'mm' }, // 改为和打印预览一致
  print: { width: 75, height: 90, unit: 'mm' },   // 保持不变
};

export const getCardStyle = (mode: CardMode): React.CSSProperties => {
  const { width, height, unit } = cardDimensions[mode];
  return {
    width: `${width}${unit}`,
    height: `${height}${unit}`,
  };
};

// ====== 统一排版参数 ======
export const MM_TO_PT = 2.83464567;

export const pageConfig = {
  a4: { width: 210, height: 297, unit: 'mm' }, // A4纸
  cols: 2,
  rows: 3,
  card: { width: 75, height: 90, unit: 'mm' },
  colGap: 10, // mm
  rowGap: 6,  // mm
  paddingTop: 6, // mm
  paddingBottom: 9, // mm - 调整为9mm，确保总高度≤297mm
  paddingSide: 10, // mm
};

export function mmToPt(mm: number) {
  return mm * MM_TO_PT;
}