/**
 * 英语单词音节拆分工具
 * 基于 phonics_split_rules_v4.0_syllable.md 规则实现
 */

// 元音音素列表
const VOWEL_PHONEMES = [
  'æ', 'ɪ', 'ʌ', 'ɒ', 'ə', 'iː', 'e', 'aɪ', 'əʊ', 'eə', 'ɔː', 'ɑː', 'uː', 'ɜː',
  'ɑ', 'ʊ', 'oʊ', 'aʊ', 'ɔɪ', 'eɪ', 'ɪə', 'ʊə'
];

// 元音字母组合（不可拆分）
const VOWEL_TEAMS = [
  'ai', 'ay', 'ea', 'ee', 'ie', 'igh', 'oa', 'ow', 'oo', 'oi', 'oy', 
  'au', 'aw', 'ue', 'ew', 'ie', 'ei', 'ey'
];

// R控制的元音组合
const R_CONTROLLED_VOWELS = ['ar', 'er', 'ir', 'or', 'ur', 'ear', 'our'];

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

// Final Stable Syllables
const FINAL_STABLE_SYLLABLES = ['le', 'tion', 'sion', 'ture', 'sure', 'cial', 'tial'];

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
export function splitSyllables(word: string): string {
  if (!word || word.length < 2) return word;

  const lowerWord = word.toLowerCase();
  let result: string[] = [];

  // 1. 检查复合词
  const compound = isCompoundWord(word);
  if (compound) {
    return compound.join('-');
  }

  // 2. 检查Final Stable Syllable
  const finalStable = findFinalStableSyllable(lowerWord);
  if (finalStable) {
    const beforeStable = lowerWord.slice(0, -finalStable.length);
    if (beforeStable.length > 0) {
      const beforeSplit = splitSyllables(beforeStable);
      return `${beforeSplit}-${finalStable}`;
    }
    return finalStable;
  }

  // 3. 检查前缀
  const prefix = findPrefix(lowerWord);
  if (prefix) {
    const afterPrefix = lowerWord.slice(prefix.length);
    if (afterPrefix.length > 0) {
      const afterSplit = splitSyllables(afterPrefix);
      return `${prefix}-${afterSplit}`;
    }
    return prefix;
  }

  // 4. 检查后缀
  const suffix = findSuffix(lowerWord);
  if (suffix) {
    const beforeSuffix = lowerWord.slice(0, -suffix.length);
    if (beforeSuffix.length > 0) {
      const beforeSplit = splitSyllables(beforeSuffix);
      return `${beforeSplit}-${suffix}`;
    }
    return suffix;
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

    // 检查元音字母组合
    if (nextChar && isVowelTeam(char + nextChar)) {
      current += char + nextChar;
      i += 2;
      continue;
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

    // 处理辅音
    if (/[bcdfghjklmnpqrstvwxz]/i.test(char)) {
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
          // 两个辅音夹元音，在辅音间拆分
          current += char;
          syllables.push(current);
          current = '';
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
  return syllables.filter(s => s.length > 0).join('-');
}

/**
 * 生成自然拼读拆分（用于API补全）
 */
export function generatePhonicsSplit(word: string): string {
  const syllables = splitSyllables(word);
  
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