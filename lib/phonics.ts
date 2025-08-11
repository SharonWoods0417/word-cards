/**
 * 英语单词音节拆分工具
 * 基于 phonics_split_rules_v4.0_syllable.md 规则实现
 */

// 规则版本标识（用于页面显示与缓存确认）
export const PHONICS_RULES_VERSION = 'rules-v5.0.0';
// 字母类别判定（与文档 1.0 一致）
function isVowelChar(ch: string): boolean {
  return /[aeiou]/i.test(ch);
}

function isConsonantChar(ch: string): boolean {
  return /[bcdfghjklmnpqrstvwxz]/i.test(ch);
}

function isVowelAt(word: string, i: number): boolean {
  const ch = word[i];
  if (!ch) return false;
  if (isVowelChar(ch)) return true;
  // y 作为条件性元音
  if (/y/i.test(ch)) {
    const prev = word[i - 1];
    const next = word[i + 1];
    const prevIsV = prev ? isVowelChar(prev) : false;
    const nextIsV = next ? isVowelChar(next) : false;
    const nextExists = typeof next !== 'undefined';
    // 词尾或两侧非元音时，按元音处理
    if (!nextExists || (!prevIsV && !nextIsV)) return true;
  }
  return false;
}

function isConsonantAt(word: string, i: number): boolean {
  const ch = word[i];
  if (!ch) return false;
  if (isConsonantChar(ch)) return true;
  if (/y/i.test(ch)) {
    // 非 isVowelAt 的剩余情况按辅音
    return !isVowelAt(word, i);
  }
  // w 不单独视为元音，默认按辅音（组合中另行处理）
  if (/w/i.test(ch)) return true;
  return false;
}

// 元音音素列表
const VOWEL_PHONEMES = [
  'æ', 'ɪ', 'ʌ', 'ɒ', 'ə', 'iː', 'e', 'aɪ', 'əʊ', 'eə', 'ɔː', 'ɑː', 'uː', 'ɜː',
  'ɑ', 'ʊ', 'oʊ', 'aʊ', 'ɔɪ', 'eɪ', 'ɪə', 'ʊə'
];

// 元音组合（不可拆分）——支持 2/3/4 字母，按“最长优先”匹配
const VOWEL_TEAMS_ALL = [
  // 4 字母（复杂多读整体保留）
  'ough',
  // 3 字母
  'igh',
  // 2 字母
  'ai', 'ay', 'ea', 'ee', 'ie', 'oa', 'ow', 'oo', 'oi', 'oy', 'ou',
  'au', 'aw', 'ue', 'ew', 'ei', 'ey', 'ui'
];
// 预排序：最长优先
const VOWEL_TEAMS = [...VOWEL_TEAMS_ALL].sort((a, b) => b.length - a.length);

// R控制的元音组合
const R_CONTROLLED_VOWELS = ['ar', 'er', 'ir', 'or', 'ur'];
// R控制的三字母组合（优先于两字母与元音组合）——严格按文档
const R_CONTROLLED_TRIGRAMS = ['air', 'are', 'ear', 'ere', 'eer', 'ire', 'ore', 'oar'];

// 常见前缀
const PREFIXES = [
  'un', 'in', 'im', 'dis', 're', 'pre', 'sub', 'mis', 'ex', 'tele',
  'en', 'em', 'non', 'over', 'under', 'out', 'up', 'down', 'back',
  // 文档新增常见前缀（普通优先级）
  'inter', 'super', 'trans', 'semi', 'anti', 'auto'
];

// 常见后缀
const SUFFIXES = [
  // 文档 14 列表（名词/形容词、对比、能力、副词、动词形态、专用）
  'tion', 'sion', 'ture', 'ment', 'ness', 'less', 'ful', 'ous', 'al', 'y', 'en',
  'er', 'est',
  'able', 'ible',
  'ly',
  'ing', 'ed',
  'cian', 'cial', 'tial', 'ious', 'eous', 'age', 'ure',
  // 兼容原列表
  'ive', 'ic', 'ical', 'ity'
];

// 更强优先级的常见前缀（在基础扫描前切分，不会影响 tiger 等词）
const STRONG_PREFIXES = [
  // 文档 1：前缀（最高优先）
  'un', 're', 'pre', 'dis', 'mis', 'non', 'over', 'under', 'sub',
  // 也作为强前缀处理，优先切分
  'inter', 'super', 'trans', 'semi', 'anti', 'auto',
  // 兼容原有
  'ex', 'im', 'in'
];

// Final Stable Syllables
// 最稳定的结尾：包括 C+le 族和常见整体后缀
const FINAL_STABLE_SYLLABLES = [
  // C+le 家族（确保如 ta-ble、lit-tle）
  'ble', 'cle', 'dle', 'fle', 'gle', 'kle', 'ple', 'tle', 'zle',
  // 其余整体后缀
  'le', 'tion', 'sion', 'cian', 'ture', 'sure', 'ure', 'age', 'ous', 'cial', 'tial', 'ient', 'ience'
];

// 常见辅音二合字母（按文档）
const CONSONANT_DIGRAPHS = [
  'ch', 'sh', 'th', 'wh', 'ph', 'gh'
];

// 常见辅音三合/辅音丛（整体优先）——严格按文档
const CONSONANT_TRIGRAPHS = [
  'tch', 'squ', 'spr', 'str', 'scr', 'shr'
];

// 常见起始辅音丛：S-blends、L-blends、R-blends（文档 5/6/7）
const INITIAL_BLENDS = [
  // L-blends
  'bl','cl','fl','gl','pl','sl',
  // R-blends
  'br','cr','dr','fr','gr','pr','tr',
  // S-blends
  'sc','sk','sl','sm','sn','sp','st','sw'
];

// 词首优先识别的三辅音丛（VCCCV），用于强制在丛后断开：street → str-eet（按文档）
const LEADING_TRIPLE_CLUSTERS = ['squ','spr','str','scr','shr'];

// 特殊结尾（仅位置限定）
const SPECIAL_FINALS = ['mb'];

// Word Families（整体处理，优先于单元音）
const WORD_FAMILIES = ['an', 'en', 'in', 'on', 'un'];

// 特殊首字母（仅词首有效）
const SPECIAL_INITIALS = ['kn', 'wr', 'gn', 'tw'];

function matchVowelTeamAt(word: string, index: number): string | null {
  for (const team of VOWEL_TEAMS) {
    if (word.slice(index, index + team.length).toLowerCase() === team) {
      return team;
    }
  }
  return null;
}

function matchWordFamilyAt(word: string, index: number): string | null {
  const pair = word.slice(index, index + 2).toLowerCase();
  if (WORD_FAMILIES.includes(pair)) return pair;
  return null;
}

/**
 * 检查字符串是否包含元音
 */
function hasVowel(str: string): boolean {
  return /[aeiouy]/i.test(str);
}

/**
 * 检查是否为元音字母组合
 */
function isVowelTeam(str: string): boolean {
  return VOWEL_TEAMS.includes(str.toLowerCase());
}

/**
 * 检查是否为R控制的元音
 */
function isRControlledVowel(str: string): boolean {
  return R_CONTROLLED_VOWELS.includes(str.toLowerCase());
}

/**
 * 检查是否为Magic-e结构
 */
function isMagicE(word: string): boolean {
  const pattern = /[bcdfghjklmnpqrstvwxz][aeiou][bcdfghjklmnpqrstvwxz]e$/i;
  return pattern.test(word);
}

/**
 * 查找前缀
 */
function findPrefix(word: string): string | null {
  const lowerWord = word.toLowerCase();
  for (const prefix of PREFIXES) {
    if (lowerWord.startsWith(prefix) && lowerWord.length > prefix.length) {
      return prefix;
    }
  }
  return null;
}

/**
 * 查找后缀
 */
function findSuffix(word: string): string | null {
  const lowerWord = word.toLowerCase();
  for (const suffix of SUFFIXES) {
    if (lowerWord.endsWith(suffix) && lowerWord.length > suffix.length) {
      return suffix;
    }
  }
  return null;
}

/**
 * 查找Final Stable Syllable
 */
function findFinalStableSyllable(word: string): string | null {
  const lowerWord = word.toLowerCase();
  for (const syllable of FINAL_STABLE_SYLLABLES) {
    if (lowerWord.endsWith(syllable) && lowerWord.length > syllable.length) {
      return syllable;
    }
  }
  return null;
}

// 复合词逻辑按新文档移除（遵循统一优先级流程）

/**
 * 主要的音节拆分函数
 */
// 允许未来接收 IPA/提示选项
export interface SplitOptions {}

export function splitSyllables(word: string, opts?: SplitOptions): string {
  if (!word || word.length < 2) return word;

  const lowerWord = word.toLowerCase();
  let result: string[] = [];

  // 1) Final Stable（C+le 族 和 词尾整体后缀）
  const finalStable = findFinalStableSyllable(lowerWord);
  if (finalStable) {
    const beforeStable = lowerWord.slice(0, -finalStable.length);
    // C+le 族：直接按 [前缀]-[C+le] 切分（如 little → lit-tle）
    if (/^[bcdfghjklmnpqrstvwxz]le$/.test(finalStable)) {
      return `${beforeStable}-${finalStable}`;
    }
    if (beforeStable.length > 0) {
      const beforeSplit = splitSyllables(beforeStable);
      return `${beforeSplit}-${finalStable}`;
    }
    return finalStable;
  }

  // 2) 强前缀（文档：前缀最高优先）
  for (const p of STRONG_PREFIXES) {
    if (lowerWord.startsWith(p) && lowerWord.length > p.length) {
      const rest = lowerWord.slice(p.length);
      // 避免过短或非字母情况
      if (/^[a-z]+$/.test(rest)) {
        const afterSplit = splitSyllables(rest, opts);
        return `${p}-${afterSplit}`;
      }
    }
  }

  // 3) Magic-e（V-C-e）：将末尾 -Ce 作为整体，与前面断开：c-ake
  if (isMagicE(lowerWord)) {
    // 找到最后一个 -C e 结构的位置：... V C e$
    const m = lowerWord.match(/^(.*?)([bcdfghjklmnpqrstvwxz])e$/);
    if (m) {
      const head = m[1];
      const tail = m[2] + 'e';
      if (head) {
        const beforeSplit = splitSyllables(head, opts);
        return `${beforeSplit}-${tail}`;
      }
      return tail;
    }
  }

  // 6. 基础音节拆分逻辑
  let current = '';
  let syllables: string[] = [];
  let i = 0;

  while (i < lowerWord.length) {
    const char = lowerWord[i];
    const nextChar = lowerWord[i + 1];
    const nextNextChar = lowerWord[i + 2];

    // 词首：特殊首字母（kn/wr/gn/tw）整体保留
    if (i === 0 && nextChar) {
      const special2 = (char + nextChar).toLowerCase();
      if (SPECIAL_INITIALS.includes(special2)) {
        current += special2;
        i += 2;
        continue;
      }
    }

    // 4) 三合字母（tch/squ/spr/str/scr/shr）优先
    const tri = (char || '') + (nextChar || '') + (nextNextChar || '');
    if (tri.length === 3 && CONSONANT_TRIGRAPHS.includes(tri.toLowerCase())) {
      if (current === '') {
        current += tri;
      } else {
        result.push(current);
        current = tri;
      }
      i += 3;
      continue;
    }

    // 5) R控制三字母（air/are/ear/ere/eer/ire/ore/oar）
    if (tri.length === 3 && R_CONTROLLED_TRIGRAMS.includes(tri.toLowerCase())) {
      current += tri;
      i += 3;
      continue;
    }

    // 6) 辅音二合字母（ch/sh/th/wh/ph/gh）整体
    if (nextChar && CONSONANT_DIGRAPHS.includes((char + nextChar).toLowerCase())) {
      // 若当前为空直接收集该二合字母；否则按原逻辑追加
      if (current === '') {
        current += char + nextChar;
      } else {
        // 如果二合字母后接元音，进行 VC/CV 拆分
        if (nextNextChar && /[aeiouy]/i.test(nextNextChar)) {
          result.push(current);
          current = char + nextChar;
        } else {
          current += char + nextChar;
        }
      }
      i += 2;
      continue;
    }

    // 7) 元音字母组合（最长优先，支持 2/3/4）
    const vt = matchVowelTeamAt(lowerWord, i);
    if (vt) {
      const team = vt.toLowerCase();
      current += lowerWord.slice(i, i + team.length);
      i += team.length;
      continue;
    }

    // 8) R控制两字母（ar/er/ir/or/ur）
    if (nextChar && isRControlledVowel(char + nextChar)) {
      current += char + nextChar;
      i += 2;
      continue;
    }

    // 9) Word Families（an/en/in/on/un）整体
    const wf = matchWordFamilyAt(lowerWord, i);
    if (wf) {
      current += wf;
      i += 2;
      continue;
    }

    // 10) 单个元音
    if (/[aeiouy]/i.test(char)) {
      current += char;
      i++;
      continue;
    }

    // 11) 处理辅音（含 x 特例：按两个辅音参与拆分）
    if (/[bcdfghjklmnpqrstvwxz]/i.test(char)) {
      const isX = char.toLowerCase() === 'x';
      // 如果当前音节为空，添加辅音
      if (current === '') {
        current += char;
      } else {
        // 检查是否需要拆分（VCV/VCCV）
        if (nextChar && /[aeiouy]/i.test(nextChar)) {
          // VC/CV 拆分
          syllables.push(current);
          current = char;
        } else if (nextChar && nextNextChar && /[aeiouy]/i.test(nextNextChar)) {
          // VCCV：两个辅音夹元音
          // 常规处理：在两辅音之间拆分，若后两辅音能成起始丛则 CC/
          current += char;
          const nextPair = (nextChar + nextNextChar).toLowerCase();
          if (INITIAL_BLENDS.some(b => nextPair.startsWith(b))) {
            syllables.push(current);
            current = '';
          } else {
            syllables.push(current);
            current = '';
          }
        } else {
          current += char;
        }
      }
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // 添加最后一个音节
  if (current) {
    syllables.push(current);
  }

  // 过滤空音节并连接
  const filtered = syllables.filter(s => s.length > 0);

  // 特殊词尾：mb 不再拆（如 lamb → lamb）
  if (lowerWord.endsWith('mb')) {
    // 若已产生边界，将末尾两字母并回
    const joined = filtered.join('');
    if (joined.endsWith('mb')) {
      return joined; // 保持整体
    }
  }

  // 后缀边界修正：-ly/-ness/-ing/-er，若无边界则在前面增加分割
  const JOIN = (parts: string[]) => parts.join('-');
  let baseJoined = JOIN(filtered);

  // 词首 VCCCV：若以常见三辅音丛开头，且其后为元音，则在该丛后断开（street → str-eet）
  for (const cl of LEADING_TRIPLE_CLUSTERS) {
    if (lowerWord.startsWith(cl) && isVowelAt(lowerWord, cl.length)) {
      const expected = `${cl}-${lowerWord.slice(cl.length)}`;
      if (!baseJoined.startsWith(`${cl}-`)) {
        baseJoined = expected;
      }
      break;
    }
  }
  const ensureBoundaryBefore = (suffix: string) => {
    if (lowerWord.endsWith(suffix)) {
      // 若当前没有在 suffix 之前的连字符，则补充一个
      const idx = baseJoined.toLowerCase().lastIndexOf(suffix);
      if (idx > 0) {
        const hasDash = baseJoined[idx - 1] === '-';
        if (!hasDash) {
          baseJoined = baseJoined.slice(0, idx) + '-' + baseJoined.slice(idx);
        }
      }
    }
  };
  [
    // 常见后缀边界修正，覆盖文档条目
    'ly', 'ness', 'ing', 'er', 'est', 'ment', 'less', 'ful', 'ous', 'al', 'y', 'en',
    'able', 'ible', 'tion', 'sion', 'ture', 'cian', 'cial', 'tial', 'ious', 'eous', 'age', 'ure', 'ed'
  ].forEach(ensureBoundaryBefore);

  // 若基础拆分没有产生断点（或仅一个音节），尝试应用词缀启发
  if (!baseJoined.includes('-')) {
    const prefix = findPrefix(lowerWord);
    if (prefix) {
      const afterPrefix = lowerWord.slice(prefix.length);
      if (afterPrefix.length > 0) {
        const afterSplit = splitSyllables(afterPrefix);
        return `${prefix}-${afterSplit}`;
      }
      return prefix;
    }

    const suffix = findSuffix(lowerWord);
    if (suffix) {
      const beforeSuffix = lowerWord.slice(0, -suffix.length);
      if (beforeSuffix.length > 0) {
        const beforeSplit = splitSyllables(beforeSuffix);
        return `${beforeSplit}-${suffix}`;
      }
      return suffix;
    }
  }

  return baseJoined;
}

/**
 * 生成自然拼读拆分（用于API补全）
 */
export function generatePhonicsSplit(word: string, opts?: SplitOptions): string {
  const syllables = splitSyllables(word, opts);
  
  // 如果只有一个音节，返回原单词
  if (!syllables.includes('-')) {
    return word;
  }

  // 格式化输出，保持原单词的大小写
  const syllableParts = syllables.split('-');
  const result: string[] = [];

  let wordIndex = 0;
  for (const syllable of syllableParts) {
    const syllableLength = syllable.length;
    const originalPart = word.slice(wordIndex, wordIndex + syllableLength);
    result.push(originalPart);
    wordIndex += syllableLength;
  }

  return result.join('-');
}

/**
 * 测试函数 - 用于验证拆分结果
 */
export function testPhonicsSplit(): void {
  const testWords = [
    'rabbit', 'apple', 'watermelon', 'disappear', 'tiger', 
    'celebrate', 'banana', 'nation', 'football', 'little',
    'happy', 'market', 'paint', 'cake', 'ago'
  ];

  console.log('音节拆分测试结果:');
  testWords.forEach(word => {
    const split = generatePhonicsSplit(word);
    console.log(`${word} → ${split}`);
  });
} 