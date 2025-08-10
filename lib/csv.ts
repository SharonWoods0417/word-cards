import type { Word } from "@/types/word";
import { generatePhonicsSplit } from "./phonics";

export type CanonicalKey =
  | "word"
  | "phonetic"
  | "phonics"
  | "chinese"
  | "pos"
  | "example"
  | "translation"
  | "imageUrl";

export interface HeaderMap {
  [key: string]: string | null;
}

export interface CsvTransformStats {
  totalRows: number;
  importedRows: number;
  discardedRows: number;
  missingCounts: Record<CanonicalKey, number>; // 基于导入后的结果统计
  headerMap: HeaderMap; // 映射结果预览
  posNormalizedCount: number; // 词性被规范化的条数
}

export interface CsvTransformResult {
  words: Word[];
  stats: CsvTransformStats;
}

// 规范化键名（用于匹配表头）
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/\uFEFF/g, "") // 移除 BOM
    .replace(/[\s_\-\.]/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")");
}

// 字段别名映射（英文/中文/常见写法）
const FIELD_ALIASES: Record<CanonicalKey, string[]> = {
  word: ["word", "单词", "lemma", "headword"],
  phonetic: ["phonetic", "音标", "ipa", "pronunciation"],
  phonics: [
    "phonics",
    "自然拼读",
    "syllables",
    "syllable",
    "split",
    "音节",
    "phonics_split",
  ],
  chinese: [
    "chinese",
    "中文",
    "中文释义",
    "释义",
    "meaning",
    "definition_cn",
    "definitioncn",
    "cn",
    "cn_meaning",
    "cn_definition",
  ],
  pos: [
    "pos",
    "词性",
    "partofspeech",
    "part_of_speech",
    "speechpart",
    "wordclass",
  ],
  example: ["example", "例句", "英文例句", "sentence", "sample", "en_example"],
  translation: [
    "translation",
    "中文翻译",
    "例句翻译",
    "sentence_cn",
    "cn_example",
    "cn_translation",
    "example_cn",
    "examplecn",
  ],
  imageUrl: [
    "imageurl",
    "image_url",
    "image",
    "img",
    "picture",
    "图片",
    "图片地址",
    "imagehref",
    "imageuri",
  ],
};

function buildNormalizedHeaderIndex(headers: string[]): Record<string, string> {
  const index: Record<string, string> = {};
  headers.forEach((h) => {
    if (!h && h !== 0) return;
    const original = String(h);
    index[normalizeKey(original)] = original;
  });
  return index;
}

// --- 语义特征与启发式识别 ---
const CHINESE_RE = /[\u4e00-\u9fff]/;
const IPA_CHAR_RE = /[ˈˌæɪʊʌɔɑəɜθðʃʒŋː]/;

function isProbablyWordValue(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v.length === 0 || v.length > 24) return false;
  if (CHINESE_RE.test(v)) return false;
  if (/[\s\/]/.test(v)) return false;
  return /^[a-zA-Z][a-zA-Z'\-]*$/.test(v);
}

function isPhoneticValue(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return /\/[^\/]+\//.test(v) || IPA_CHAR_RE.test(v);
}

function isPhonicsValue(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return /^[a-zA-Z]+(?:-[a-zA-Z]+)+$/.test(v);
}

function isPosValue(value: string): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return /^(n|v|adj|adv|prep|conj|pron|int)\.?$/.test(v) || /名词|动词|形容词|副词|介词|连词|代词|感叹词/.test(v);
}

function isImageUrlValue(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return /\.(png|jpe?g|gif|webp)$/i.test(v) || /^https?:\/\//i.test(v);
}

function isEnglishSentence(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  if (CHINESE_RE.test(v)) return false;
  return /[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(v) && v.length >= 10;
}

function isChineseSentence(value: string): boolean {
  if (!value) return false;
  const v = value.trim();
  return CHINESE_RE.test(v) && v.length >= 4;
}

type ScoreMap = Record<CanonicalKey, number>;

function scoreValueForField(value: string): ScoreMap {
  const score: ScoreMap = {
    word: 0,
    phonetic: 0,
    phonics: 0,
    chinese: 0,
    pos: 0,
    example: 0,
    translation: 0,
    imageUrl: 0,
  };
  if (!value) return score;
  const v = String(value);

  if (isProbablyWordValue(v)) score.word += 3;
  if (isPhoneticValue(v)) score.phonetic += 4;
  if (isPhonicsValue(v)) score.phonics += 3;
  if (isPosValue(v)) score.pos += 3;
  if (isImageUrlValue(v)) score.imageUrl += 4;
  if (isEnglishSentence(v)) score.example += 3;
  if (isChineseSentence(v)) score.translation += 2; // 更偏向长句做翻译
  if (CHINESE_RE.test(v) && v.length <= 16) score.chinese += 2; // 短中文更可能是释义

  return score;
}

function detectHeuristicHeaderMap(headers: string[], rows: any[]): HeaderMap {
  const map: HeaderMap = {} as HeaderMap;
  const headerScores: Record<string, ScoreMap> = {};

  const sampleCount = Math.min(rows.length, 100);
  headers.forEach((h) => {
    const original = String(h);
    const acc: ScoreMap = {
      word: 0, phonetic: 0, phonics: 0, chinese: 0, pos: 0, example: 0, translation: 0, imageUrl: 0,
    };
    for (let i = 0; i < sampleCount; i++) {
      const row = rows[i];
      const val = row?.[original];
      const s = scoreValueForField(val ?? "");
      (Object.keys(acc) as CanonicalKey[]).forEach((k) => acc[k] += s[k]);
    }
    headerScores[original] = acc;
  });

  const usedHeaders = new Set<string>();
  const order: CanonicalKey[] = [
    'word', 'phonetic', 'phonics', 'chinese', 'pos', 'example', 'translation', 'imageUrl'
  ];

  order.forEach((field) => {
    let bestHeader: string | null = null;
    let bestScore = 0;
    for (const h of headers) {
      if (usedHeaders.has(h)) continue;
      const s = headerScores[h]?.[field] ?? 0;
      if (s > bestScore) {
        bestScore = s;
        bestHeader = h;
      }
    }
    // 设置一个最低阈值，避免误判
    const threshold: Record<CanonicalKey, number> = {
      word: 6, phonetic: 6, phonics: 5, chinese: 4, pos: 5, example: 5, translation: 5, imageUrl: 5
    };
    if (bestHeader && bestScore >= threshold[field]) {
      map[field] = bestHeader;
      usedHeaders.add(bestHeader);
    } else {
      map[field] = null;
    }
  });

  return map;
}

export function buildHeaderMap(headers: string[], rows: any[] = []): HeaderMap {
  const normalizedIndex = buildNormalizedHeaderIndex(headers);
  const map: HeaderMap = {} as HeaderMap;

  (Object.keys(FIELD_ALIASES) as CanonicalKey[]).forEach((canonical) => {
    const aliasList = FIELD_ALIASES[canonical];
    const matched = aliasList.find((alias) => normalizedIndex[normalizeKey(alias)]);
    map[canonical] = matched ? normalizedIndex[normalizeKey(matched)] : null;
  });

  // 对于未匹配到的字段，使用启发式从数据中自动检测
  const missing = (Object.keys(map) as CanonicalKey[]).filter((k) => !map[k]);
  if (missing.length > 0 && headers.length > 0 && rows.length > 0) {
    const heuristic = detectHeuristicHeaderMap(headers, rows);
    missing.forEach((k) => {
      if (!map[k] && heuristic[k]) {
        // 避免冲突：如果该header已被其它字段占用，跳过
        const occupied = (Object.values(map).filter(Boolean) as string[]);
        if (!occupied.includes(heuristic[k] as string)) {
          map[k] = heuristic[k];
        }
      }
    });
  }

  return map;
}

// 词性规范化
function standardizePos(posRaw: string): string {
  const value = (posRaw || "").trim();
  if (!value) return "";

  const v = value.toLowerCase().replace(/\.$/, "");
  const candidates: Record<string, string> = {
    // 英文/缩写
    n: "n.",
    noun: "n.",
    v: "v.",
    vb: "v.",
    verb: "v.",
    adj: "adj.",
    adjective: "adj.",
    adv: "adv.",
    adverb: "adv.",
    prep: "prep.",
    preposition: "prep.",
    conj: "conj.",
    conjunction: "conj.",
    pron: "pron.",
    pronoun: "pron.",
    int: "int.",
    interjection: "int.",
    // 中文
    名词: "n.",
    动词: "v.",
    形容词: "adj.",
    副词: "adv.",
    介词: "prep.",
    连词: "conj.",
    代词: "pron.",
    感叹词: "int.",
  };

  return candidates[v] || candidates[value] || (value.endsWith(".") ? value : `${value}.`);
}

// 从中文释义中尝试提取词性前缀，如 "n. 苹果（指水果）" → n.
function derivePosFromChinese(chineseRaw: string): { pos: string; chinese: string } {
  if (!chineseRaw) return { pos: "", chinese: "" };
  const trimmed = chineseRaw.trim();
  const match = trimmed.match(/^\s*(n|v|adj|adv|prep|conj|pron|int)\.?\s*[、．。:]?\s*(.*)$/i);
  if (match) {
    const posStd = standardizePos(match[1]);
    const rest = match[2]?.trim() || "";
    return { pos: posStd, chinese: rest || trimmed };
  }
  return { pos: "", chinese: trimmed };
}

// 从源行根据 HeaderMap 读取字段
function getCell(row: any, key: string | null): string {
  if (!key) return "";
  const raw = row?.[key];
  if (raw === undefined || raw === null) return "";
  return String(raw).trim();
}

export function normalizeRowToWord(row: any, map: HeaderMap): Word | null {
  const wordValue = getCell(row, map.word ?? null);
  if (!wordValue) return null; // 丢弃无 word 的行

  const phonetic = getCell(row, map.phonetic ?? null);
  const rawPhonics = getCell(row, map.phonics ?? null);
  let chinese = getCell(row, map.chinese ?? null);
  let posRaw = getCell(row, map.pos ?? null);
  const example = getCell(row, map.example ?? null);
  const translation = getCell(row, map.translation ?? null);
  const imageUrl = getCell(row, map.imageUrl ?? null);

  const phonics = rawPhonics || generatePhonicsSplit(wordValue);
  if (!posRaw && chinese) {
    const derived = derivePosFromChinese(chinese);
    if (derived.pos) {
      posRaw = derived.pos;
      chinese = derived.chinese;
    }
  }
  const pos = posRaw ? standardizePos(posRaw) : "";

  const newWord: Word = {
    id: Date.now() + Math.floor(Math.random() * 1_000_000),
    word: wordValue,
    phonetic,
    phonics,
    chinese,
    pos,
    example,
    translation,
    imageUrl,
  };

  return newWord;
}

export function transformCsvData(rows: any[], headers: string[]): CsvTransformResult {
  const map = buildHeaderMap(headers, rows);

  const words: Word[] = [];
  let discarded = 0;
  let posNormalizedCount = 0;

  rows.forEach((row) => {
    const beforePos = getCell(row, map.pos ?? null);
    const normalized = normalizeRowToWord(row, map);
    if (!normalized) {
      discarded += 1;
      return;
    }
    if (normalized.pos && normalized.pos !== beforePos) {
      posNormalizedCount += 1;
    }
    words.push(normalized);
  });

  const missingCounts: Record<CanonicalKey, number> = {
    word: 0, // 导入后不会为空（否则被丢弃）
    phonetic: 0,
    phonics: 0,
    chinese: 0,
    pos: 0,
    example: 0,
    translation: 0,
    imageUrl: 0,
  };

  for (const w of words) {
    if (!w.phonetic) missingCounts.phonetic += 1;
    if (!w.phonics) missingCounts.phonics += 1; // 理论上为 0，因为已自动生成
    if (!w.chinese) missingCounts.chinese += 1;
    if (!w.pos) missingCounts.pos += 1;
    if (!w.example) missingCounts.example += 1;
    if (!w.translation) missingCounts.translation += 1;
    if (!w.imageUrl) missingCounts.imageUrl += 1;
  }

  const stats: CsvTransformStats = {
    totalRows: rows.length,
    importedRows: words.length,
    discardedRows: discarded,
    missingCounts,
    headerMap: map,
    posNormalizedCount,
  };

  return { words, stats };
}


