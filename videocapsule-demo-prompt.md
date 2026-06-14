# 收藏夹榨汁机 (VideoCapsule) — 90s 产品演示视频提示词

> 用法：将此提示词完整交给视频生成 AI（如 HyperFrames / Remotion / Motion Canvas 等），它会按此分镜脚本精确生成 MP4。

---

## Composition Specs

Build a 90-second product-demo composition (1920×1080, 30fps) showcasing **收藏夹榨汁机** (VideoCapsule) — a tool that turns long Douyin videos into structured knowledge cards. The video tells a three-act story: Problem → Solution → Result.

Pull these plugins:
- `npx hyperframes add app-showcase`
- `npx hyperframes add ui-3d-reveal`
- `npx hyperframes add text-type-in`
- `npx hyperframes add shimmer-sweep`
- `npx hyperframes add logo-outro`
- `npx hyperframes add parallax-drift`

## Visual Identity

The product uses a **dark glassmorphism** design language. Every frame must feel like looking through frosted glass into a deep emerald-tinted space.

| Token | Value | Usage |
|-------|-------|-------|
| Canvas BG | `#050505` | Root background — near-black |
| Canvas BG gradient | `radial-gradient(ellipse at 20% 10%, rgba(16,185,129,0.08), transparent 70%)` | Ambient emerald orb, always present, subtly drifting |
| Glass surface | `rgba(255,255,255,0.025)` with `backdrop-filter: blur(36px)` | Every card / panel surface |
| Glass border | `rgba(255,255,255,0.08)` | 1px borders on all glass elements |
| Primary accent | `#10b981` (Emerald) | CTAs, progress bars, active states, icons |
| Secondary accent | `#f97316` (Orange) | Recipe card type |
| Tertiary accent | `#f43f5e` (Rose) | Product card type |
| Warm accent | `#f59e0b` (Amber) | History card type |
| Text primary | `#f0f0f5` | Headlines, titles |
| Text secondary | `#a0a0b0` | Body copy, descriptions |
| Text muted | `#606070` | Labels, timestamps |
| Product emoji | 🫒 | Olive — the product logo |

**Type hierarchy:**
- Headline: "General Sans" 80px / 700 weight / tracking -0.02em
- Sub-headline: "General Sans" 44px / 600 weight
- Body: "Inter" 24px / 400 weight / line-height 1.7
- Label: "Inter" 16px / 600 weight / uppercase / tracking 0.08em (eyebrow chips)
- Mono: "JetBrains Mono" 18px / 500 weight (pipeline step labels, stats numbers)

**Glass card anatomy** (reused throughout):
- Border-radius: 20px
- Box-shadow: `0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`
- Top accent ribbon: 2px gradient bar at top, left-to-right `transparent → accent → transparent`

---

## Screen Compositions

Render each phone screen as a sub-composition under `screens/`. All three phones float on a deterministic `sin(t * π / 3)` gentle bob, amplitude 4px, cycling every 3 seconds.

### Phone A (left) — Home Screen / Input
The main landing page of the app:
- Top: glass nav pill with 🫒 logo + "收藏夹榨汁机" text
- Center: large headline "收藏夹榨汁机" (80px) with subline "将任意视频转化为精美知识卡片"
- Below: a glass input bar showing a Douyin URL being pasted: `https://v.douyin.com/FOBMUnEEE8A/`
- Bottom: eyebrow chip "AI 视频知识提取" with a pulsing green dot
- BG: ambient emerald orbs (3 blurred radial gradients, slowly drifting)

### Phone B (center) — Processing / AI Pipeline
The pipeline progress screen:
- Same glass nav pill at top
- A glass card containing 4 pipeline steps, rendered as a vertical timeline:
  1. ✅ 解析视频 — completed, emerald check icon
  2. ✅ 提取文案 — completed
  3. 🔄 AI 榨汁 — ACTIVE, emerald pulse glow, spinner rotating
  4. ○ 保存笔记 — pending, muted
- Each step has: icon circle (32px) + label text + status message
- The active step pulses with `box-shadow: 0 0 20px rgba(16,185,129,0.3)`

### Phone C (right) — Knowledge Card Output
The final HeroCard (the product's flagship output):
- Glass card with emerald accent ribbon at top
- Eyebrow chips: "📝 通用" + "观点 + 干货"
- Title: "厌蠢是赚钱的敌人" (20px bold)
- Stats strip: 3 mini glass boxes — "核心要点 · 5节" / "预计阅读 · 3分钟" / "内容体量 · 深度"
- 2 visible sections (scrolled state) with icon markers + numbered badges:
  - Section 1: "厌蠢让你远离利润" with body text preview
  - Section 2: "忽略沉默的大多数需求" with body text preview
- Bottom: takeaway box "三句话带走" with 3 numbered items
- Pitfall meter bar: gradient emerald→amber→rose, filled to 80%
- Source line: "来源：抖音视频"

---

## Animation Timeline (90s total)

### ACT 1 — THE PROBLEM (0–18s)

**0–3.0s — Cold open.** Black canvas. A single emerald dot (8px) fades in at dead center, then pulses twice. On the second pulse it expands into a radial gradient bloom that fills the frame with the dark canvas BG + ambient orbs fading in.

**3.0–6.0s — Pain point montage.** Three lines of text type in sequentially (text-type-in, 0.5s each, stagger 0.8s):
```
Line 1: "刷了100条视频"          (44px, text-secondary)
Line 2: "记住了几条？"            (80px, text-primary, bold)
Line 3: "收藏夹吃灰，干货全丢了"   (24px, text-muted)
```
After line 3 appears, all three shimmer-sweep left-to-right (1 overlay pass, 0.6s duration).

**6.0–8.0s — Problem visualization.** Three ghost phone outlines (just borders, no content, `rgba(255,255,255,0.06)` stroke) float in from edges via parallax-drift. Each shows a blurred, scrolling video feed — visual noise. The phones are desaturated, slightly tilted, conveying information overload.

**8.0–10.0s — Transition beat.** The ghost phones shatter / dissolve into particles that converge toward center, forming the 🫒 emoji (large, 120px). A hairline rule wipes in horizontally through the emoji center.

**10.0–14.0s — Product name reveal.** "收藏夹榨汁机" types in character-by-character below the 🫒 (General Sans 80px, emerald accent on the 器 character only). Below it, a subtitle fades in: "VideoCapsule · AI 视频知识提取" (24px, text-secondary).

**14.0–18.0s — Value proposition.** Three benefit cards fly in from bottom (stagger 0.4s, ease expo.out), each a glass surface with an icon + one-liner:
1. 🫒 "粘贴链接 → 提取文案" — ASR transcription
2. 🧠 "AI 榨汁 → 结构化卡片" — AI structuring
3. 📱 "5种卡片风格 · 随心切换" — Multi-style output

All three cards gently parallax-drift (different depths, different speeds) while held.

### ACT 2 — THE DEMO (18–66s)

**18.0–20.0s — Scene transition.** Benefit cards slide down and out. Three real iPhone frames (not ghost outlines — full device mockup, dark glass body, notch) fly in via ui-3d-reveal:
- Phone A (left): from x=-300, rotateY=-18°, easing expo.out 1.4s
- Phone B (center): from z=-400 (starts small), same ease, delayed 180ms
- Phone C (right): from x=+300, rotateY=+18°, same ease, delayed 360ms

All phones have the glass surface background with emerald accent ribbons.

**20.0–30.0s — Beat 1: INPUT (Phone A spotlight).**
- 20.0s: Phone A rotates to face camera (rotateY → 0°, scale → 1.06 over 0.8s). Phones B & C dim to 60% opacity and shift slightly outward.
- 21.0s: Phone A content animates — the input bar highlights (emerald border glow), cursor blinks. Then a URL pastes in character-by-character: `https://v.douyin.com/FOBMUnEEE8A/`
- 22.5s: The "提取" button pulses emerald, then the screen content slides up (transition out).
- 23.0s: A floating callout label types in to the LEFT of Phone A: "粘贴抖音链接，一键提取" (Inter 24px, text-primary, with a thin emerald connecting line from label to phone).
- 25.0s: Phone A returns to idle 3D pose. Callout fades out. Phones B & C restore opacity.

**30.0–42.0s — Beat 2: PROCESSING (Phone B spotlight).**
- 30.0s: Phone B rotates to face camera (same 3D reveal beat). Phones A & C dim.
- 31.0s: Phone B content shows pipeline progress. Steps 1 & 2 already have green checks. Step 3 "AI 榨汁" has an animated spinner — the emerald dot orbits the icon circle (deterministic: 2 full rotations over 2s).
- 33.0s: Step 3 checkmark animates in (scale 0 → 1.2 → 1.0, bounce). Step 4 activates.
- 34.5s: Step 4 completes. The entire pipeline card pulses briefly (emerald glow, 0.4s).
- 35.0s: Callout label types in to the RIGHT of Phone B: "AI 四步流水线 · 从视频到知识卡片" (with connecting line).
- 38.0s: Phone B returns to idle. Callout fades. Other phones restore.

**42.0–58.0s — Beat 3: OUTPUT (Phone C spotlight — the hero moment).**
- 42.0s: Phone C rotates to face camera, larger scale (1.10 — this is the payoff). Phones A & B dim AND shift further apart to give Phone C more visual space.
- 43.0s: Phone C shows the HeroCard being "built" piece by piece:
  1. 43.0–43.5s: Accent ribbon wipes in at top
  2. 43.5–44.0s: Eyebrow chips fade in
  3. 44.0–44.8s: Title "厌蠢是赚钱的敌人" types in
  4. 44.8–45.5s: Stats strip — three mini cards rise up from below (stagger 0.2s)
  5. 45.5–47.0s: Sections appear one by one (slide in from right, stagger 0.5s) — icon markers pulse as they land
  6. 47.0–48.0s: Takeaway box fades in from bottom
  7. 48.0–48.5s: Pitfall meter bar fills left-to-right (emerald → amber → rose gradient)
- 48.5s: Callout types in below Phone C: "5种卡片风格 · 一键导出PNG" with 5 small style chips: ✦聚光 ◻极简 🪟标准 🎨创意 📰杂志
- 51.0–58.0s: **Style switch demo.** The card on Phone C morphs through styles:
  - 51.0s: Hero → Minimal (crossfade 0.6s)
  - 53.0s: Minimal → Creative (crossfade 0.6s, background gains gradient glow)
  - 55.0s: Creative → Magazine (crossfade 0.6s, multi-column layout)
  - 57.0s: Magazine → back to Hero (crossfade 0.6s)
  Each transition: the style name chip highlights in teal (#2bbab2) while active.
- 58.0s: Phone C returns to idle. All phones restore.

**58.0–66.0s — Beat 4: CARD TYPES.**
All three phones rotate to face camera simultaneously (no dimming — this is a wide shot).
- 58.0s: Each phone's card content crossfades to a DIFFERENT card type:
  - Phone A: 🍳 Recipe card (orange accent #f97316) — "宫保鸡丁完美配方" with ingredient list
  - Phone B: 💡 Insight card (emerald accent #10b981) — "认知升级的底层逻辑" with key insight
  - Phone C: 📚 History card (amber accent #f59e0b) — "丝绸之路被遗忘的真相" with timeline
- 60.0s: A wide label types in across the top: "AI 自动识别 · 5种内容类型" (General Sans 44px)
- 62.0–64.0s: Each phone's accent ribbon color swaps one more time (recipe → product → insight) showing the type system is dynamic.
- 64.0–66.0s: All phones return to idle 3D poses, gently bobbing.

### ACT 3 — THE CLOSE (66–90s)

**66.0–70.0s — Feature recap.** All three phones slide to the right edge (exit right, stagger 0.3s). Left half of canvas shows a feature list that types in:
```
✦ AI 语音转文字 — 支持抖音视频一键提取
✦ 智能结构化 — 自动识别内容类型与章节
✦ 5种卡片风格 — 聚光/极简/标准/创意/杂志
✦ 三句话带走 — 核心结论一目了然
✦ 踩坑预警 — 1-5分内容可信度评分
✦ 一键导出PNG — 随时分享知识卡片
```
Each line appears with a 0.3s stagger. Emerald bullet dots pulse sequentially as each line lands.

**70.0–76.0s — Cross-platform callout.** The feature list fades to 40% opacity. Below it, two platform badges fade in:
- 📱 Android App (with a mock Android phone frame sliding in from bottom-left)
- 🌐 Web App (with a mock browser frame sliding in from bottom-right)
Label: "全平台可用 · 随时随地提取知识" (Inter 24px, text-secondary)

**76.0–82.0s — Final hero shot.** Platform badges and feature list dissolve. The three phones re-enter from different directions, now ALL showing the same HeroCard (the "厌蠢" card) in perfect alignment. They drift together, overlap slightly, then merge into ONE large centered card (scale 1.4x) — the hero moment. The card's emerald ribbon glows brighter, the shimmer-sweep crosses the card once (left to right, 1.2s duration).

**82.0–86.0s — Tagline.** The large card scales down and slides up to top-third. Below it, the main tagline types in large:
```
"告别信息过载"
"只留核心干货"
```
(General Sans 80px, emerald accent on 核心干货)

**86.0–90.0s — Logo outro.** Logo-outro fires bottom-right:
- 🫒 emoji scales from 0 → 1.3 → 1.0 (bounce, 0.5s)
- "收藏夹榨汁机" fades in below (General Sans 32px)
- "VideoCapsule" in mono below that (JetBrains Mono 16px, text-muted)
- URL fades in: "videocapsule.app" (Inter 16px, emerald, with underline)
- A final shimmer-sweep crosses the entire canvas (top-left to bottom-right, 1.5s)
- Everything holds for 1.5s, then fades to `#050505` over 0.8s.

---

## Non-Negotiables

1. **Deterministic only** — no `Math.random()`, no `Date.now()`, no `requestAnimationFrame` outside of the render tick. All animation values are computed from `frame / fps`.
2. **Entrance-only animations** — every element animates IN, never loops infinitely. Hold states are static (or use deterministic sin/cos bob with exact cycle count).
3. **Phone screens are sub-compositions** — each phone's content renders as a `<div>` inside the phone frame. Never put `<video>` or `<img>` with external URLs directly inside a timed clip. All screen content is drawn with CSS/React primitives.
4. **No `repeat: -1`** — compute exact cycle counts. For the 2.0s bob window at 3s period: floor(2.0 / 3.0) = 0 full cycles, so bob uses `sin(t * π / 3)` over exactly 2.0s with no repeat flag.
5. **Min 24px on all label callouts** — no text smaller than 24px in the video (accessibility + readability).
6. **All timelines `paused: true`** — the root composition controls playhead. No auto-playing children.
7. **Root `data-duration="90"`** — exactly 90 seconds, 2700 frames at 30fps.
8. **Chinese-first** — all on-screen text is in Chinese except the product English name "VideoCapsule" and the URL.
9. **Glass consistency** — every surface that looks like a card/panel MUST have the glass treatment (blur + semi-transparent bg + subtle border). No flat opaque rectangles.
10. **Color discipline** — emerald (#10b981) is the ONLY accent used for CTAs, progress, and active states. Orange/Amber/Rose appear ONLY inside card-type demos where they represent specific card types. Never use them as general UI accents.

---

## Run Command

```bash
npx hyperframes inspect --samples 18   # 18 sample frames across 90s (every 5s)
```

Verify:
- No label callout overlaps with phone frames
- All text is ≥24px
- Glass blur renders correctly at every sample frame
- Card type accent colors appear only within card demos
- Pipeline spinner is deterministic (same position at same frame across renders)

## Output

`videocapsule-demo-90s.mp4`
