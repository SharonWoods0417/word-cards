# 自然拼读拆分原则（含示例）

> 用法：从左到右扫描，**按优先级由高到低匹配**；一旦命中规则，**整体保留**并在边界处拆分；若都未命中，再退回到通用音节规则（CVC/VCV/C+le 等）。

---

## 0. 字母分类（用于判定 C/V/半辅音）

### 0.1 元音 Vowels
a, e, i, o, u；有时 y 作元音（词尾或元音间）。
- 示例（y 作元音）：hap-py，my（单音节不再拆）

### 0.2 辅音 Consonants
b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, x, z
- 示例：cat → c-at（CVC）

### 0.3 半辅音 Semi-vowels（滑音）
w, y：词首多作辅音；在元音组合中常并入元音。
- 示例（辅音）：wa-ter → wa-ter  
- 示例（并入元音）：yel-low → yel-low；cow → c-ow

---

## 1. 前缀（**最高优先**，只在词首匹配，整体保留）
un-, re-, pre-, dis-, mis-, non-, over-, under-, sub-, inter-, super-, trans-, semi-, anti-, auto-
- 示例：un-hap-py；re-do；pre-view；dis-like；mis-lead  
           over-eat；un-der-ground；sub-ma-rine；in-ter-na-tion-al

---

## 2. 特殊首字母（静音/固定组合，整体保留）
kn, wr, mb（词尾静音 b）、tw, gn
- 示例：kn-ock；wr-ist；la-mb（不再拆 la-mb 中的 mb）；tw-in；sig-nal → sig-nal

---

## 3. 三字母辅音丛 Trigraphs（整体处理）
squ, spr, str, scr, shr
- 示例：squ-are；spr-ing → spr-ing；str-eet；scr-atch；shr-ink

---

## 4. 双字母辅音 Digraphs（整体处理）
ch, tch, sh, th (/θ/ /ð/), wh, ph, gh（多读/不读，按词典策略）
- 示例：ch-ip；tch → ma-tch；sh-ip；th-in / tha-t；wh-eel；ph-one；cou-gh（gh 不发音）

---

## 5. S-blends（整体处理）
sc, sk, sl, sm, sn, sp, st, sw
- 示例：st-op；sk-ate；sl-im；sm-all；sn-ap；sp-in；sw-im；sc-ar

---

## 6. L-blends（整体处理）
bl, cl, fl, gl, pl, sl
- 示例：bl-ue；cl-ap；fl-ag；gl-ass；pl-an；sl-ed

---

## 7. R-blends（整体处理）
br, cr, dr, fr, gr, pr, tr
- 示例：br-own；cr-ab；dr-op；fr-og；gr-een；pr-int；tr-ain

---

## 8. 短元音（用于 CVC/闭音节判定）
a, e, i, o, u（在闭音节中倾向短音）
- 示例：cat → c-at；bed → b-ed；sit → s-it；hot → h-ot；sun → s-un

---

## 9. 单词家族 Word Families（整体处理，优先于单元音）
an, en, in, on, un
- 示例：pl-an；ch-icken → chick-en（注意优先保留 -en）

---

## 10. Magic-E（V-C-e：前元音多为长音，整体保留）
a-e, e-e, i-e, o-e, u-e
- 示例：c-ake；th-ese；t-ide；b-one；c-ute

---

## 11. R-controlled Vowels I（整体处理）
ar, or, ur, er, ir
- 示例：car；for；fur；her；bird → bird（单音节不再拆）

---

## 12. R-controlled Vowels II（整体处理）
air, are, ear, eer, ere, ire, ore, oar
- 示例：air-plane → air-plane；c-are；h-ear；d-eer；h-ere；w-ire；b-ore；oar

---

## 13. 元音团队 Vowel Teams（整体处理，长/双元音/变体）
- ai/ay：r-ain，pl-ay
- au/aw：au-thor，s-aw
- oa/ow（长 o/双读）：b-oat，sn-ow
- ee/ea/ey：s-eed，br-ead，k-ey
- ie/igh：p-ie，l-ight（igh 视作一个单位）
- oi/oy：c-oin，b-oy
- ou/ow（多读）：out → ou-t，c-ow → c-ow，th-ough（ow/ough 特例见词典）
- ui/ue/ew：fr-uit，bl-ue，n-ew

> 说明：遇到多读（ea/ow/ou/ough 等），优先整体匹配，读音交由词典/后处理决定；拆分仅保留组合边界。

---

## 14. 常见后缀（整体保留，**高优先**，只在词尾匹配）
- 名词/形容词：-tion，-sion，-ture，-ment，-ness，-less，-ful，-ous，-al，-y，-en
- 形容词对比：-er，-est
- 形容词能力：-able，-ible
- 副词：-ly
- 动词形态：-ing，-ed（规则化处理）
- 专用：-cian，-cial，-tial，-ious，-eous，-age，-ure
- 示例：ac-tion；vi-sion；pic-ture；en-joy-ment；hap-pi-ness；hope-less；beau-ti-ful；fa-mous；per-son-al；hap-py；gold-en；big-gest；teach-er；man-age-able；pos-si-ble；quick-ly；run-ning；play-ed；mu-si-cian；so-cial；spa-tial；cu-ri-ous；cou-ra-geous；vill-age；fu-ture

---

## 15. 硬/软 C 与 G（用于读音/次级拆分判断）
- **c**：在 e/i/y 前多 /s/，否则 /k/；**ge/dge** 作为整体；**g** 在 e/i/y 前多 /dʒ/，否则 /g/
- 示例：ci-ty（/s/），cat（/k/）；c-age → c-age；brid-ge → bri-dge  
         gi-ant（/dʒ/），goat（/g/）

---

## 16. 通用音节规则（当以上均未命中时）

### 16.1 CVC（闭音节）
- 规则：C-V-C 切在首辅音后  
- 示例：bas-ket → bas-ket（实际为 VC-CCVC，可结合 16.3）；cat → c-at

### 16.2 VCV（优先 V/CV，其次 VC/V）
- 规则：首选 **V/CV**（如 ti-ger → **ti-ger**），若 /C 不能做后音节合法起始丛，再用 **VC/V**  
- 示例：ti-ger（V/CV）；lev-el（VC/V）

### 16.3 VCCV（夹两辅音，优先 C/C；若后两辅音能成丛则 CC/）
- 规则：rab-bit → rab-bit（C/C）；ex-tra → ex-tra（因 *tr* 为丛，拆在 **x | tra**）

### 16.4 VCCCV（看后两/后三码是否为常见丛）
- 规则：in-stru-ment → in-stru-ment（*str* 为丛）；pump-kin → pump-kin（mpk 不成丛 → C/C）

### 16.5 C+le（稳定结尾，整体为一音节）
- 规则：-ble/-cle/-dle/-fle/-gle/-kle/-ple/-tle/-zle  
- 示例：ap-ple；ta-ble；lit-tle；cir-cle；bun-dle；gig-gle

### 16.6 x 的处理（= /ks/ 或 /gz/，参与 VC/CV 计算）
- 示例：ox-en → ox-en（/ks/）；ex-am-ple → ex-am-ple（首音 /ɪg-/ 时按 VC/V）

---

## 17. 匹配优先级（从高到低，命中即停）

1) **前缀** → 2) **特殊首字母** → 3) **三字母辅音丛** → 4) **双字母辅音** →  
5) **S/L/R-blends** → 6) **后缀** → 7) **Magic-E** →  
8) **R-controlled**（I/II）→ 9) **Vowel Teams** → 10) **Word Families** →  
11) **短元音判定** → 12) **C/G 软硬**（读音）→ 13) **通用音节规则**

> 提示：**最长优先**（如先匹配 *str* 而不是 *st*）；**位置限制**（前缀只在词首，后缀只在词尾）；**w/y 位置判定**（词首多辅音，词中/尾多并入元音组合）。

---

## 18. 复杂/多读的处理建议（实现提示）
- **ea/ow/ou/ough/gh** 等多读：拆分只保留组合边界；读音交由词典/概率表。  
- 示例：th-ough，th-rough，c-ough，th-ought（均整体保留 ough）

