# 自然拼读拆分原则（分阶段优先匹配 + 测试集）

> 用法：从左到右扫描单词；按“阶段”由高到低匹配；每个阶段 **最长匹配优先**；一旦命中某一组合，**整体保留**并在边界处断开；若所有阶段均未命中，则进入“通用音节规则”。

---

## 使用原则
1. **从左到右**扫描，不回退、不跳跃。
2. **分阶段**匹配，每个阶段内按**最长匹配优先**（先长后短）。
3. 命中的组合**整体保留**，不再拆散（如 `str` 不再拆成 `st` + `r`）。
4. 阶段结束后，继续下一阶段处理**剩余部分**。
5. 若无命中特殊组合，再应用**通用音节规则**（CVC、VCV、VCCV、C+le 等）。
6. **w, y** 的“元音/辅音”身份由位置决定（见“字母分类”）。

---

## 阶段 1：前缀（Prefixes）— **最高优先（词首限定）**
在单词**开头**匹配，匹配成功**立即拆分**。

**前缀列表：**  
`un-`, `re-`, `pre-`, `dis-`, `mis-`, `non-`, `over-`, `under-`, `sub-`, `inter-`, `super-`, `trans-`, `semi-`, `anti-`, `auto-`

**示例：**  
- unhappy → **un**-hap-py  
- preview → **pre**-view  
- dislike → **dis**-like

**测试单词：** undo → **un**-do；redo → **re**-do；submarine → **sub**-ma-rine

---

## 阶段 2：特殊首字母/静音组合（Silent Letters）
在**词首**或**固定位置**整体处理。

**组合：**  
- 词首静音：`kn`, `wr`, `gn`  
- 词内/词尾固定：`mb`（尾位 b 静音）、`tw`（固定起首连缀）

**示例：**  
- knock → **kn**-ock  
- write → **wr**-ite  
- gnome → **gn**ome  
- lamb → la-**mb**（整体保留，不拆 b）  
- twin → **tw**-in

**测试单词：** wrist → **wr**ist；thumb → thu-**mb**

---

## 阶段 3：辅音组合（Consonant Clusters & Digraphs）
**顺序：Trigraphs → Digraphs → S/L/R-blends**；命中后**整体保留**。

### 3.1 三字母辅音丛（Trigraphs）
`squ`, `spr`, `str`, `scr`, `shr`  
**示例：** street → **str**-eet；spring → **spr**-ing；square → **squ**-are

### 3.2 双字母辅音（Digraphs）
`ch`, `tch`, `sh`, `th`, `wh`, `ph`, `gh`（读音由词典/后处理决定）  
**示例：** cheat → **ch**-eat；ship → **sh**-ip；phone → **ph**-one；match → ma-**tch**；though（`gh` 不发音，组合整体保留）

### 3.3 S-blends（S 起首连缀）
`sc`, `sk`, `sl`, `sm`, `sn`, `sp`, `st`, `sw`  
**示例：** stop → **st**-op；skate → **sk**-ate；swim → **sw**-im

### 3.4 L-blends
`bl`, `cl`, `fl`, `gl`, `pl`, `sl`  
**示例：** blue → **bl**-ue；clock → **cl**-ock；flower → **fl**-ow-er

### 3.5 R-blends
`br`, `cr`, `dr`, `fr`, `gr`, `pr`, `tr`  
**示例：** green → **gr**-een；bread → **br**-ead；truck → **tr**-uck

---

## 阶段 4：元音组合（Vowel Teams & Magic‑E & R‑controlled）
**元音组合必须整体识别**，避免被拆成单独元音。

### 4.1 元音团队（Vowel Teams）
`ai`, `ay`, `au`, `aw`, `oa`, `ow`, `ee`, `ea`, `ey`, `ie`, `igh`, `oi`, `oy`, `ou`, `ui`, `ue`, `ew`

**示例：**  
- rain → r-**ai**-n  
- cheat → ch-**ea**-t  
- boat → b-**oa**-t  
- new → n-**ew**  
- light → l-**igh**-t（`igh` 整体）  
- coin → c-**oi**-n  
- blue → bl-**ue**

> 多读提示：`ea`/`ow`/`ou`/`ough` 等读音交由词典或后处理；拆分仅保留组合边界。

### 4.2 Magic‑E（VCe 结构）
`a‑e`, `e‑e`, `i‑e`, `o‑e`, `u‑e`  
**示例：** cake → c‑**ake**；time → t‑**ime**；home → h‑**ome**

### 4.3 R‑controlled Vowels（R 控制）
- 单元音 + r：`ar`, `or`, `ur`, `er`, `ir`  
- 双元音/字母 + r：`air`, `are`, `ear`, `eer`, `ere`, `ire`, `ore`, `oar`

**示例：** care → c‑**are**；bird → **bird**；deer → d‑**eer**；wire → w‑**ire**

---

## 阶段 5：后缀（Suffixes）— **词尾限定**
在**词尾**匹配，整体保留。

**常见后缀：**  
`-tion`, `-sion`, `-ture`, `-able`, `-ible`, `-ment`, `-ness`, `-less`, `-ful`, `-ous`, `-al`, `-ly`, `-ing`, `-ed`, `-er`, `-est`, `-y`, `-en`, `-cian`, `-cial`, `-tial`, `-ious`, `-eous`, `-age`, `-ure`

**示例：**  
- action → ac‑**tion**  
- happiness → hap‑pi‑**ness**  
- teacher → teach‑**er**  
- running → run‑**ning**  
- golden → gold‑**en**  
- biggest → big‑**gest**  
- social → so‑**cial**；musician → mu‑si‑**cian**

---

## 阶段 6：通用音节规则（当以上均未命中时）
1. **CVC（闭音节）**：元音多为短音。  
   - cat → c‑at；hot → h‑ot
2. **VCV（优先 V/CV，其次 VC/V）**：看后续是否能形成合法起始丛。  
   - tiger → **ti**‑ger（V/CV）；level → lev‑el（VC/V）
3. **VCCV（两辅音夹心）**：多数 **C/C**；若后两辅音为常见丛，则 **VC/CCV**。  
   - rabbit → rab‑bit（C/C）；extra → ex‑tra（因 *tr* 为丛）
4. **VCCCV**：观察后两/后三是否为常见丛。  
   - instrument → in‑stru‑ment（*str* 为丛）；pumpkin → pump‑kin
5. **C+le（稳定结尾）**：`‑ble/‑cle/‑dle/‑fle/‑gle/‑kle/‑ple/‑tle/‑zle` 整体为一音节。  
   - apple → ap‑ple；table → ta‑ble；little → lit‑tle；circle → cir‑cle；giggle → gig‑gle
6. **x 的处理**：`x` 视作 /ks/ 或 /gz/ 参与 VC/CV。  
   - oxen → ox‑en；example → ex‑am‑ple（首音 /ɪg‑/ 时按 VC/V）

---

## 阶段 7：字母分类（供模式判断）
- **元音（Vowels）**：`a, e, i, o, u`（`y` 在元音位置时等同元音）  
- **辅音（Consonants）**：`b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, x, z`  
- **半辅音（Semi‑vowels / Glides）**：`w, y`  
  - 词首多作辅音：water → **w**a‑ter，yes → **y**es  
  - 元音间/词尾多并入元音：yellow → yel‑lo**w**，happy → hap‑p**y**，cow → c‑**ow**

---

## 匹配优先级总览（从高到低）
1. 前缀（词首）  
2. 特殊首字母/静音组合  
3. 辅音组合（Trigraphs → Digraphs → S/L/R‑blends）  
4. 元音组合（Vowel Teams → Magic‑E → R‑controlled）  
5. 后缀（词尾）  
6. 通用音节规则（CVC, V/CV, VC/V, VCCV, VCCCV, C+le, x 特例）

**实现要点：**
- **阶段内最长优先**（例如先匹配 `str` 再考虑 `st`）。
- **位置限制**：前缀仅词首，后缀仅词尾，C+le 仅词尾结构。
- **w/y 动态角色**：根据位置判断其为辅音或元音的一部分。
- **多读组合**（如 `ea/ow/ou/ough/gh`）：拆分保留组合，读音交由词典/后处理。

---

## 小型阶段测试集（可用于单元测试）
- 前缀：undo → **un**‑do；redo → **re**‑do；submarine → **sub**‑ma‑rine
- 静音：knock → **kn**‑ock；wrist → **wr**‑ist；thumb → thu‑**mb**
- Trigraphs：street → **str**‑eet；spring → **spr**‑ing；square → **squ**‑are
- Digraphs：cheat → **ch**‑**ea**‑t；phone → **ph**‑one；match → ma‑**tch**
- S/L/R‑blends：stop → **st**‑op；blue → **bl**‑ue；green → **gr**‑een
- Vowel Teams：rain → r‑**ai**‑n；boat → b‑**oa**‑t；new → n‑**ew**
- Magic‑E：cake → c‑**ake**；time → t‑**ime**
- R‑controlled：care → c‑**are**；bird → **bird**；wire → w‑**ire**
- 后缀：action → ac‑**tion**；teacher → teach‑**er**；running → run‑**ning**
- 通用：tiger → **ti**‑ger；rabbit → rab‑bit；extra → ex‑tra；apple → ap‑ple

