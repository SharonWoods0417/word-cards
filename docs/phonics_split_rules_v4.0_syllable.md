# 📘 英语单词音节分解规则表（Syllable Segmentation Rules for Cursor — 程序字段版）

> 本规则专为程序（如 Cursor）精准拆解英文单词音节结构设计。其拆分结果用于生成教学或学习卡片中的一个字段：`syllable_split`。规则确保**结构明确、无歧义、符合发音逻辑**，可直接用于数据表或组件中。

---

## 🧱 一、核心定义

### ✅ 音节（Syllable）
- 音节是包含**至少一个元音音素（vowel phoneme）**的最小节奏单位
- 每个单词的音节数 ≈ 它的元音音素数量（如 IPA 中标出的主元音）

### ✅ 拆分字段说明
| 字段名          | 类型     | 示例值                  | 描述                                   |
|-----------------|----------|--------------------------|----------------------------------------|
| `word`          | string   | "disappear"             | 原始英文单词                           |
| `ipa`           | string   | "/ˌdɪs.əˈpɪə/"           | 单词的音标（IPA）                     |
| `syllable_split`| string   | "dis-a-ppear"           | 用 `-` 连接音节块的字符串               |

---

## 🔤 二、基础音素分类

### 元音（Vowel Phonemes）
- 包括：/æ/, /ɪ/, /ʌ/, /ɒ/, /ə/, /iː/, /e/, /aɪ/, /əʊ/, /eə/, /ɔː/, /ɑː/, /uː/, /ɜː/ 等
- 特殊注意：/ə/（schwa）始终作为独立音节视处理

### 辅音（Consonants）
- 不构成音节核心，仅协助构型

---

## ✂️ 三、音节拆分规则（按执行优先级）

> ⚠️ 拆分逻辑为“**匹配即执行，终止后续规则**”。所有规则均为机器可解析形式。

### 1️⃣ 复合词优先处理
- 若单词由两个可独立解释的单词组成，先拆为两个词块
- 示例：football → foot-ball；watermelon → water-melon

### 2️⃣ Final Stable Syllable 保留
- 以 `-le`, `-tion`, `-sion`, `-ture` 等结尾的结尾音节块整体保留
- 合并前辅音作为音节一部分：apple → ap-ple；little → lit-tle

### 3️⃣ 前后缀整体保留
- 前缀示例：un-, in-, im-, dis-, re-, pre-, sub-, mis-, ex-, tele-
- 后缀示例：-ing, -ed, -tion, -sion, -ment, -ness, -ly, -able, -ous
- 示例：disappear → dis-a-ppear；unhappy → un-hap-py

### 4️⃣ VC/CV 拆分（默认二辅音分法）
- 若两个辅音夹在两个元音之间，则划分为：VC / CV
- 示例：rabbit → rab-bit；happy → hap-py

### 5️⃣ V/CV 拆分（长元音倾向）
- 若首元音发长音（如 /iː/, /eɪ/），拆为 V / CV
- 示例：tiger → ti-ger；robot → ro-bot

### 6️⃣ VC/V 拆分（短元音倾向）
- 若首元音为短音或弱读，则拆为 VC / V
- 示例：camel → cam-el；lemon → lem-on

### 7️⃣ R-controlled 元音整体保留
- 不可拆的 R-控制元音组合：ar, er, ir, or, ur, ear, our
- 示例：market → mar-ket；hard → hard（不能 h-ar-d）

### 8️⃣ 元音团队和双/三元音不拆
- 不可拆组合包括：ai, ay, ea, ee, ie, igh, oa, ow, oo, oi, oy, au, aw, ue, ew, ie, u_e
- 示例：paint → paint（非 pa-int）

### 9️⃣ Magic-e 规则
- CVCe 结构保持整体，不可拆分尾 e
- 示例：cake → cake（非 ca-ke）

### 🔟 弱读音节中的 /ə/ 单独成节
- 若 /ə/ 位于两个辅音之间，需拆成独立音节
- 示例：banana → ba-na-na；ago → a-go

---

## ❌ 四、严禁拆分行为（规则控制下避免）

| 违例类型         | 示例                  | 正确写法             |
|------------------|------------------------|----------------------|
| 逐字母拆分        | a-p-p-l-e              | ap-ple               |
| 拆元音组合        | pa-int, bo-at          | paint, boat          |
| 拆 final -le      | p-l-e                  | ple（整体保留）      |
| 强拆 Magic-e     | ca-ke                  | cake                 |

---


## 📊 五、示例词汇对照

| word        | ipa               | syllable_split         |
|-------------|--------------------|--------------------------|
| rabbit      | /ˈræb.ɪt/          | rab-bit                 |
| apple       | /ˈæp.əl/           | ap-ple                  |
| watermelon  | /ˈwɔː.təˌmel.ən/   | wa-ter-mel-on           |
| disappear   | /ˌdɪs.əˈpɪə/       | dis-a-ppear             |
| tiger       | /ˈtaɪ.ɡər/         | ti-ger                  |
| celebrate   | /ˈsel.ə.breɪt/     | cel-e-brate             |
| banana      | /bəˈnɑː.nə/         | ba-na-na                |
| nation      | /ˈneɪ.ʃən/         | na-tion                 |

---


