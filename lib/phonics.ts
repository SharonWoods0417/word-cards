/**
 * 英语单词音节拆分工具
 * 基于 phonics_split_rules_v4.0_syllable.md 规则实现
 */

// 规则版本标识（用于页面显示与缓存确认）
export const PHONICS_RULES_VERSION = 'rules-v4.1.4';
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

// 元音字母组合（不可拆分）——补充了文档中的 ou、常见双元音
const VOWEL_TEAMS = [
  'ai', 'ay', 'ea', 'ee', 'ie', 'igh', 'oa', 'ow', 'oo', 'oi', 'oy', 'ou',
  'au', 'aw', 'ue', 'ew', 'ei', 'ey', 'ue'
];

// R控制的元音组合
const R_CONTROLLED_VOWELS = ['ar', 'er', 'ir', 'or', 'ur'];
// R控制的三字母组合（优先于两字母与元音组合）
const R_CONTROLLED_TRIGRAMS = ['air', 'ear', 'our', 'oar', 'eer', 'ure', 'ire', 'ore'];

// 常见前缀
const PREFIXES = [
  'un', 'in', 'im', 'dis', 're', 'pre', 'sub', 'mis', 'ex', 'tele',
  'en', 'em', 'non', 'over', 'under', 'out', 'up', 'down', 'back'
];

// 常见后缀
const SUFFIXES = [
  'ing', 'ed', 'tion', 'sion', 'ment', 'ness', 'ly', 'able', 'ous',
  'ful', 'less', 'er', 'est', 'al', 'ive', 'ic', 'ical', 'ity'
];

// 更强优先级的常见前缀（在基础扫描前切分，不会影响 tiger 等词）
const STRONG_PREFIXES = [
  'dis', 're', 'pre', 'un', 'non', 'sub', 'ex', 'im', 'in', 'over', 'under'
];

// Final Stable Syllables
// 最稳定的结尾：包括 C+le 族和常见整体后缀
const FINAL_STABLE_SYLLABLES = [
  // C+le 家族（确保如 ta-ble、lit-tle）
  'ble', 'cle', 'dle', 'fle', 'gle', 'kle', 'ple', 'tle', 'zle',
  // 其余整体后缀
  'le', 'tion', 'sion', 'cian', 'ture', 'sure', 'ure', 'age', 'ous', 'cial', 'tial', 'ient', 'ience'
];

// 常见辅音二合字母（作为一个辅音单位处理，避免在其间拆分）
const CONSONANT_DIGRAPHS = [
  'th', 'sh', 'ch', 'ph', 'gh', 'wh', 'ck', 'ng', 'qu'
];

// 常见辅音三合/辅音丛（整体优先）
const CONSONANT_TRIGRAPHS = [
  'tch', 'dge', 'sch', 'scr', 'spl', 'spr', 'str', 'thr', 'shr', 'squ'
];

// 常见起始辅音丛（用于 VCV/VCCCV 拆分启发）
const INITIAL_BLENDS = [
  'bl','cl','fl','gl','pl','sl','br','cr','dr','fr','gr','pr','tr',
  'sc','sk','sm','sn','sp','st','sw','sch','scr','spl','spr','str','thr','shr','squ'
];

// 词首优先识别的三辅音丛（VCCCV），用于强制在丛后断开：street → str-eet
const LEADING_TRIPLE_CLUSTERS = ['str','spl','spr','scr','thr','shr','sch','squ'];

// 偏向开音节的常见结尾（用于 VCV / VCCV 启发，如 ti-ger, ti-cket）
const PREFERRED_OPEN_ENDINGS = ['ti', 'to', 'tu'];

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

/**
 * 检查是否为复合词
 */
function isCompoundWord(word: string): string[] | null {
  // 常见的复合词模式
  const compoundPatterns = [
    /^(foot)(ball)$/i,
    /^(water)(melon)$/i,
    /^(sun)(shine)$/i,
    /^(rain)(bow)$/i,
    /^(snow)(man)$/i,
    /^(birth)(day)$/i,
    /^(class)(room)$/i,
    /^(play)(ground)$/i,
    /^(home)(work)$/i,
    /^(book)(store)$/i,
    /^(air)(plane)$/i,
    /^(fire)(works)$/i,
    /^(base)(ball)$/i,
    /^(basket)(ball)$/i,
    /^(volley)(ball)$/i,
    /^(tennis)(ball)$/i,
    /^(foot)(print)$/i,
    /^(hand)(shake)$/i,
    /^(head)(ache)$/i,
    /^(tooth)(brush)$/i,
    /^(hair)(brush)$/i,
    /^(door)(bell)$/i,
    /^(mail)(box)$/i,
    /^(news)(paper)$/i,
    /^(note)(book)$/i,
    /^(text)(book)$/i,
    /^(work)(book)$/i,
    /^(pass)(word)$/i,
    /^(user)(name)$/i,
    /^(web)(site)$/i,
    /^(web)(page)$/i,
    /^(down)(load)$/i,
    /^(up)(load)$/i,
    /^(back)(up)$/i,
    /^(log)(in)$/i,
    /^(sign)(up)$/i,
    /^(check)(out)$/i,
    /^(set)(up)$/i,
    /^(clean)(up)$/i,
    /^(wake)(up)$/i,
    /^(get)(up)$/i,
    /^(stand)(up)$/i,
    /^(sit)(down)$/i,
    /^(lie)(down)$/i,
    /^(put)(down)$/i,
    /^(turn)(off)$/i,
    /^(turn)(on)$/i,
    /^(switch)(off)$/i,
    /^(switch)(on)$/i,
    /^(pick)(up)$/i,
    /^(give)(up)$/i,
    /^(look)(up)$/i,
    /^(make)(up)$/i,
    /^(break)(fast)$/i,
    /^(lunch)(time)$/i,
    /^(dinner)(time)$/i,
    /^(bed)(time)$/i,
    /^(play)(time)$/i,
    /^(work)(time)$/i,
    /^(school)(time)$/i,
    /^(class)(time)$/i,
    /^(study)(time)$/i,
    /^(read)(ing)$/i,
    /^(writ)(ing)$/i,
    /^(speak)(ing)$/i,
    /^(listen)(ing)$/i,
    /^(watch)(ing)$/i,
    /^(play)(ing)$/i,
    /^(work)(ing)$/i,
    /^(learn)(ing)$/i,
    /^(teach)(ing)$/i,
    /^(help)(ing)$/i,
    /^(clean)(ing)$/i,
    /^(cook)(ing)$/i,
    /^(shop)(ping)$/i,
    /^(run)(ning)$/i,
    /^(swim)(ming)$/i,
    /^(sit)(ting)$/i,
    /^(get)(ting)$/i,
    /^(put)(ting)$/i,
    /^(cut)(ting)$/i,
    /^(hit)(ting)$/i,
    /^(let)(ting)$/i,
    /^(set)(ting)$/i,
    /^(wet)(ting)$/i,
    /^(pet)(ting)$/i,
    /^(bet)(ting)$/i,
    /^(net)(ting)$/i,
    /^(jet)(ting)$/i,
    /^(met)(ting)$/i,
    /^(vet)(ting)$/i,
    /^(yet)(ting)$/i,
    /^(let)(ting)$/i,
    /^(set)(ting)$/i,
    /^(get)(ting)$/i,
    /^(wet)(ting)$/i,
    /^(pet)(ting)$/i,
    /^(bet)(ting)$/i,
    /^(net)(ting)$/i,
    /^(jet)(ting)$/i,
    /^(met)(ting)$/i,
    /^(vet)(ting)$/i,
    /^(yet)(ting)$/i
  ];

  for (const pattern of compoundPatterns) {
    const match = word.match(pattern);
    if (match) {
      return [match[1], match[2]];
    }
  }
  return null;
}

/**
 * 主要的音节拆分函数
 */
// 允许未来接收 IPA/提示选项
export interface SplitOptions {
  ipa?: string;
}

import { TEAM_SPLIT_EXCEPTIONS_MAP, FORCE_MERGE_TEAMS, matchesException } from './phonics-exceptions';

function shouldSplitTeam(word: string, index: number, team: string, opts?: SplitOptions): boolean {
  if (matchesException(word, TEAM_SPLIT_EXCEPTIONS_MAP[team])) return true;
  if (matchesException(word, FORCE_MERGE_TEAMS[team])) return false;
  // 预留：若提供 IPA，且检测到该组合两侧存在明显音节分界（如 . 或 ˈ/ˌ 位于组合之间），则选择拆分
  if (opts?.ipa) {
    const ipa = opts.ipa;
    if (/[\.ˈˌ]/.test(ipa)) {
      // 粗略启发：若 IPA 中的分界点数量 >= 1 且组合被标注为跨音节的常见词（待扩展），可返回 true
      // 这里保守返回 false，避免误拆；规则可按需要增强
    }
  }
  return false;
}

export function splitSyllables(word: string, opts?: SplitOptions): string {
  if (!word || word.length < 2) return word;

  const lowerWord = word.toLowerCase();
  let result: string[] = [];

  // 1. 检查复合词
  const compound = isCompoundWord(word);
  if (compound) {
    return compound.join('-');
  }

  // 2. 检查 Final Stable 以及 C+le 族
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

  // 3. 强前缀（如 dis-/re-/pre-）在基础扫描前切分：disappear → dis-appear
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

  // 5. 检查Magic-e
  if (isMagicE(lowerWord)) {
    return lowerWord; // Magic-e结构不拆分
  }

  // 6. 基础音节拆分逻辑
  let current = '';
  let syllables: string[] = [];
  let i = 0;

  while (i < lowerWord.length) {
    const char = lowerWord[i];
    const nextChar = lowerWord[i + 1];
    const nextNextChar = lowerWord[i + 2];

    // 三合字母优先
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

    // R控制三字母（如 ear/air/our 等）
    if (tri.length === 3 && R_CONTROLLED_TRIGRAMS.includes(tri.toLowerCase())) {
      current += tri;
      i += 3;
      continue;
    }

    // 先处理辅音二合字母，作为一个整体加入当前音节
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

    // 检查元音字母组合
    if (nextChar && isVowelTeam(char + nextChar)) {
      const team = (char + nextChar).toLowerCase();
      if (!shouldSplitTeam(word, i, team, opts)) {
        current += char + nextChar;
        i += 2;
        continue;
      }
      // 否则按单个字符继续，由后续逻辑处理分拆
    }

    // 检查R控制的元音
    if (nextChar && isRControlledVowel(char + nextChar)) {
      current += char + nextChar;
      i += 2;
      continue;
    }

    // 检查单个元音
    if (/[aeiouy]/i.test(char)) {
      current += char;
      i++;
      continue;
    }

    // 处理辅音（含 x 特例：按两个辅音参与拆分）
    if (/[bcdfghjklmnpqrstvwxz]/i.test(char)) {
      const isX = char.toLowerCase() === 'x';
      // 如果当前音节为空，添加辅音
      if (current === '') {
        current += char;
      } else {
        // 检查是否需要拆分
        if (nextChar && /[aeiouy]/i.test(nextChar)) {
          // VC/CV 拆分
          syllables.push(current);
          current = char;
        } else if (nextChar && nextNextChar && /[aeiouy]/i.test(nextNextChar)) {
          // VCCV：两个辅音夹元音
          // 若当前音节以偏向开音节的组合结尾（如 'ti'），倾向于直接在此处断开（ti-cket）
          const endsOpenPreferred = PREFERRED_OPEN_ENDINGS.some(end => current.endsWith(end));
          if (endsOpenPreferred) {
            syllables.push(current);
            current = '';
            // 不吸收当前辅音，留给下一音节
            continue;
          }
          // 常规处理：在两辅音之间拆分，优先保留后面的起始辅音丛
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

  // 开音节优先修正：
  // 若出现 [元音 + 单辅音] | [以元音开头的下一音节]，将该辅音右移到下一音节。
  const isVowel = (ch: string) => /[aeiouy]/i.test(ch);
  const isConsonant = (ch: string) => /[bcdfghjklmnpqrstvwxz]/i.test(ch);
  for (let i = 0; i < filtered.length - 1; i++) {
    const left = filtered[i];
    const right = filtered[i + 1];
    if (!left || !right) continue;
    const last = left.slice(-1);
    const preLast = left.slice(-2, -1);
    const firstRight = right[0];
    // 确保满足 VCV：左以元音+单辅音结尾，右以元音开头
    if (isConsonantAt(lowerWord, lowerWord.indexOf(last, 0)) && isVowel(firstRight) && isVowel(preLast)) {
      // 右移该辅音到下一个音节开头（如 tig-er → ti-ger）
      filtered[i] = left.slice(0, -1);
      filtered[i + 1] = last + right;
      // 如果左侧被清空（理论上不应发生），回退
      if (filtered[i].length === 0) {
        filtered[i] = left;
        filtered[i + 1] = right;
      }
    }
  }

  // 后缀边界修正：-ly/-ness/-ing/-er，若无边界则在前面增加分割
  const JOIN = (parts: string[]) => parts.join('-');
  let baseJoined = JOIN(filtered);

  // 教学友好：词首起始辅音丛 + 元音组合 → 丛-组合-(尾辅音)
  // 如 tree → tr-ee，street → str-eet（尾辅音由后续规则处理为 -t）
  (function beautifyOnsetBlendVowelTeam() {
    const TEAMS = ['oo', 'ee', 'ea', 'oa', 'ai', 'ay', 'oi', 'oy', 'au', 'aw', 'ue', 'ew'];
    const lower = word.toLowerCase();
    let blend: string | null = null;
    // 优先三辅音丛，再两辅音丛
    for (const cl of LEADING_TRIPLE_CLUSTERS) {
      if (lower.startsWith(cl) && TEAMS.includes(lower.slice(cl.length, cl.length + 2))) {
        blend = cl; break;
      }
    }
    if (!blend) {
      for (const bl of INITIAL_BLENDS) {
        if (lower.startsWith(bl) && TEAMS.includes(lower.slice(bl.length, bl.length + 2))) {
          blend = bl; break;
        }
      }
    }
    if (blend) {
      const team = lower.slice(blend.length, blend.length + 2);
      const rest = word.slice(blend.length + 2);
      if (rest.length === 0) {
        baseJoined = `${blend}-${team}`;
      } else if (rest.length === 1 && isConsonantChar(rest)) {
        baseJoined = `${blend}-${team}-${rest}`;
      } else {
        // 仅当 rest 很短时再加一段，否则并回组合后整体：
        if (rest.length <= 2) {
          baseJoined = `${blend}-${team}-${rest}`;
        } else {
          baseJoined = `${blend}-${team}${rest}`;
        }
      }
    }
  })();
  // 词首 VCCCV：若以常见三辅音丛开头，且其后为元音，则在该丛后强制断开
  for (const cl of LEADING_TRIPLE_CLUSTERS) {
    if (lowerWord.startsWith(cl) && isVowelAt(lowerWord, cl.length)) {
      const expected = `${cl}-${lowerWord.slice(cl.length)}`;
      // 若当前没有在该位置断开，则覆盖为预期形式
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
  ['ly', 'ness', 'ing', 'er'].forEach(ensureBoundaryBefore);

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

  // 展示友好规则：词尾为 {vowelTeam} + 单辅音，突出长元音连读 → 如 school → sch-oo-l
  (function beautifyEndingVowelTeamSingleConsonant() {
    const TEAMS = ['oo', 'ee', 'ea', 'oa'];
    const segs = baseJoined.split('-').filter(Boolean);
    if (segs.length === 0) return;
    const last = segs[segs.length - 1];
    const lower = word.toLowerCase();
    // 情况A：最后一段本身是 team+辅音（如 'ool'）→ 拆为 'oo' + 'l'
    for (const team of TEAMS) {
      if (last.length > team.length && last.toLowerCase().endsWith(team) === false) {
        const tail = last.slice(-1);
        const body = last.slice(0, -1);
        const maybeRC = (body.slice(-2).toLowerCase() + tail.toLowerCase());
        // 若与 R 控制组合/三字母组合匹配，则不要拆分（如 'ear'）
        if (
          isConsonantChar(tail) &&
          body.toLowerCase().endsWith(team) &&
          lower.endsWith(body + tail) &&
          !R_CONTROLLED_TRIGRAMS.includes(maybeRC) &&
          !R_CONTROLLED_VOWELS.includes(maybeRC)
        ) {
          segs[segs.length - 1] = body;
          segs.push(tail);
          baseJoined = segs.join('-');
          return;
        }
      }
    }
    // 情况B：最后两段已是 team + 单辅音（如 ['sch-oo','l']）→ 保持为 team-辅音
    if (segs.length >= 2) {
      const last2 = segs[segs.length - 2];
      const tail = segs[segs.length - 1];
      if (tail.length === 1 && isConsonantChar(tail)) {
        for (const team of TEAMS) {
          const combo = (team + tail.toLowerCase());
          if (
            last2.toLowerCase().endsWith(team) &&
            lower.endsWith(team + tail) &&
            !R_CONTROLLED_TRIGRAMS.includes(combo) &&
            !R_CONTROLLED_VOWELS.includes(combo)
          ) {
            baseJoined = segs.join('-');
            return;
          }
        }
      }
    }
  })();

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