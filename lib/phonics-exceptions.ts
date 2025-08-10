// 组合分拆例外与强制合并配置
// 目的：当常见元音组合在特定词中实际跨音节（或必须保留为整体）时，
// 通过词表进行微调，优先于通用规则。

export type WordPattern = string | RegExp;

// 在这些单词中，指定的组合应“分拆”处理（不合并成一个音节）
export const TEAM_SPLIT_EXCEPTIONS_MAP: Record<string, WordPattern[]> = {
  // oo 分拆：cooperate / co‑operate
  oo: [/^cooperate$/i, /^co-?operate$/i],
  // ee 分拆：reenter / re‑enter
  ee: [/^reenter$/i, /^re-?enter$/i],
  // ea 分拆：create（示例，可按需要扩展）
  ea: [/^create$/i],
};

// 在这些单词中，指定的组合应“强制合并”为整体（即便启发可能拆开）
export const FORCE_MERGE_TEAMS: Record<string, WordPattern[]> = {
  // 示例：默认留空，按需添加
};

export function matchesException(word: string, patterns: WordPattern[] | undefined): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((p) => (typeof p === 'string' ? p.toLowerCase() === word.toLowerCase() : p.test(word)));
}


