export type CardMode = 'preview' | 'print';

export const cardDimensions: Record<CardMode, {
  width: number;
  height: number;
  unit: 'px' | 'mm';
}> = {
  preview: { width: 150, height: 180, unit: 'px' }, // 网页展示
  print: { width: 75, height: 90, unit: 'mm' },     // 打印/导出
};

export const getCardStyle = (mode: CardMode): React.CSSProperties => {
  const { width, height, unit } = cardDimensions[mode];
  return {
    width: `${width}${unit}`,
    height: `${height}${unit}`,
  };
};