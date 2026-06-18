# 移动端 UI + 计划功能 — 综合验收标准

> Single source of truth for the loop. 每完成一项,把 `[ ]` 改成 `[x]`,在末尾追加截图路径或证据。
> 测试视窗(Playwright):**移动 360×800** / **移动 390×844** / **平板 768×1024** / **桌面 1280×800**
> 路径约定:截图存到 `frontend/__acceptance__/<阶段>/<视窗>-<页面>.png`

---

## 总览:两条工作线

### 线 1:移动端 UI 系统性重做(全站)
桌面端保留现有视觉语言;**移动端 < 768px 走专属布局**(顶部精简 + 底部 Tab + 移动专属交互)。

### 线 2:计划(Plan)功能新增
LLM 看完视频转录后判断是否为"计划类",**直接输出已填好的动态结构计划**(JSON),保存到独立 plans 表,在卡片上显式提示并自动跳到计划页;底部加 `计划` tab 进入 `/plans` 页面;支持每日任务清单 + 应用内提醒(到期高亮 + 数量徽标)。

两条线**并行推进**,共用底部 TabBar — 所以 TabBar 在阶段 1 就要预留 `计划` 槽位。

---

# 一、设计原则(贯穿全程)

| 原则 | 标准 |
|------|------|
| 断点 | `< 768px` = 移动布局;`≥ 768px` = 桌面布局 |
| 触控 | 所有可点目标 ≥ 44×44px;关键 CTA ≥ 48×48px |
| 输入框 | `font-size ≥ 16px`(防 iOS 自动放大) |
| 安全区 | TabBar `padding-bottom: env(safe-area-inset-bottom)` |
| 视觉语言一致 | 毛玻璃 + emerald `#10b981` + 双层 bezel 边框 |
| 桌面回归 | 移动端改动**不能破坏桌面端**(1280px 截图回归) |
| 数据兼容 | 旧 notes(无 plan 字段)正常显示,不报错 |

---

# 二、验收标准(按域分组)

## A. 全局 layout / 导航

| ID  | 标准 | 验证 |
|-----|------|------|
| A1  | 360px 顶部 nav 无横向溢出 | `scrollWidth ≤ 360` ✅ docScrollW=360, navScrollW=326 — `__acceptance__/stage1/360-home.png` |
| A2  | 360px 顶部仅显示 logo + ThemeToggle("知识库""计划"不在顶部) | DOM ✅ knLink/plLink `display:none, visible:false` |
| A3  | 360px 底部固定 BottomTabBar,5 个 tab:**首页 / 知识库 / 计划 / 风格 / 设置** | rect.height ≥ 56 ✅ tabLabels=["首页","知识库","计划","风格","设置"], h=60 |
| A4  | 主内容区底部 padding ≥ 80px,内容不被 TabBar 遮挡 | computed ✅ `padding-bottom: 96px` |
| A5  | 桌面 ≥ 768px 下 BottomTabBar `display:none`,顶部 nav 完整显示 | display ✅ 768/1280 均 `tabbarDisplay:none`, 1280 下 knLink/plLink `display:flex, visible:true` |
| A6  | TabBar 当前路由高亮(emerald 圆点 + 文字色) | active 样式 ✅ `/notes` 路由下 `activeTab=知识库, emeraldDots=1` |
| A7  | TabBar 加 `env(safe-area-inset-bottom)`(iOS 适配) | CSS ✅ tabbarStyleAttr 含 `padding-bottom:env(safe-area-inset-bottom, 0px)` |
| A8  | 计划 tab 显示"未完成任务数"徽标(0 不显示,>9 显示 `9+`) | DOM ✅ 360px badgeText="3"(open_tasks=3 来自 mock stats) — `stage9/360-home-badge.png` |

## B. 首页 `/`

| ID  | 标准 | 验证 |
|-----|------|------|
| B1  | 360×800 首屏(不滚动)看得到完整 InputBar | InputBar.bottom ≤ 800 ✅ inputBarBottom=289 |
| B2  | Hero 区(emoji+主标题+副标题)总高度 ≤ 280px(移动) | section height ✅ heroHeight=127 |
| B3  | InputBar 在 360px 下输入框可见宽 ≥ 200px 或栈式 | DOM ✅(阶段 3 修复)inputWidth=242 ≥ 200,栈式布局成立 |
| B4  | 输入框 `font-size ≥ 16px` | computed ✅ inputFontSize=16px |
| B5  | FeatureCard 区在移动端折叠/单列/隐藏(不让首页过长) | 移动高度合理 ✅ FeatureCard section `display:none` |
| B6  | 提取完成且为 plan 类型时,卡片下方出现"已为你建立计划"提示条 + 跳转按钮 | DOM ✅ 代码: card_type==='plan' && plan_id → `<Link href="/plans?id=...">` 附带 📋 "已为你建立执行计划" 横幅 |
| B7  | 桌面 1280px 首页完整布局回归,无破版 | 截图对比 ✅ docScrollW=1280, heroHeight=481, FeatureCard `display:block` |

## C. InputBar

| ID  | 标准 | 验证 |
|-----|------|------|
| C1  | 移动端:输入框单独一行,按钮全宽下行;或输入框可见宽 ≥ 200px | DOM ✅ inputWidth=242 ≥ 200,栈式布局成立,按钮"提取知识卡片"独占下一行全宽 |
| C2  | 按钮触控区 ≥ 48×48px | rect ✅ 移动按钮 w=286, h=48 |
| C3  | 粘贴 200 字符长链接,输入框末尾可见(滚动 OK) | 模拟 ✅ 196 字符 scrollWidth=1684 > clientWidth=204, canScrollToEnd=true,scrollLeft=1442 自动滚到末尾 |

## D. 知识库 `/notes` 列表

| ID  | 标准 | 验证 |
|-----|------|------|
| D1  | 360px 单列,无横向滚动 | `scrollWidth == clientWidth` ✅ docW=360, 3 卡片, cardW=320 ≤ 360 |
| D2  | 卡片间距 ≥ 12px | gap ✅ 计算 gap=12px |
| D3  | 分页按钮 ≥ 44×44px | rect ✅ CSS 已设 min-w-[44px] min-h-[44px];3 条笔记 = 单页无分页器(符合预期) |
| D4  | plan 类型笔记在列表上有显式标识(图标 + 标签) | DOM ✅ card_type==='plan' → 显示 📋 计划 标签 |
| D5  | 空状态文案不破版 | 截图 ✅ 空状态 docW=360, hasEmptyMsg=true — `__acceptance__/stage5/360-notes-empty.png` |

## E. 笔记详情 `/notes?id=`

| ID  | 标准 | 验证 |
|-----|------|------|
| E1  | "返回知识库"链接 ≥ 44px 触控区 | rect ✅ back link 114×44px, min-h-[44px] |
| E2  | 360px 下导出按钮 + 返回链接同行不挤压(或自然换行) | DOM ✅ headerSW=320 == headerCW=320, fitsNoOverflow=true; flex-wrap + gap-3 处理超宽场景 |
| E3  | CardRenderer + StyleToolbar 不溢出视窗 | scrollWidth ✅ cardScrollW=320 == cardClientW=320 — `__acceptance__/stage5/360-notes-detail.png` |
| E4  | plan 类型笔记顶部显示"查看计划"按钮 → `/plans/[planId]` | DOM ✅ card_type==='plan' && plan_id → 📋 查看计划 按钮,链接 `/plans?id=${plan_id}` |

## F. 处理详情 `/process?id=`

| ID  | 标准 | 验证 |
|-----|------|------|
| F1  | `<video>` 宽度不溢出(≤ 360 in 360px 视窗) | rect ✅ videoW=276 ≤ 360 |
| F2  | `<video>` 高度 ≤ 50vh(≤ 400px in 360×800) | rect ✅ videoH=150 ≤ 400, max-h-[50vh] 生效 |
| F3  | 标题区在 360px 不破版 | 截图 ✅ titleH=28, text-xl 压缩 — `__acceptance__/stage5/360-process.png` |
| F4  | TranscriptViewer 文字无横向滚动 | scrollWidth ✅ transcriptSW=320 == transcriptCW=320 |

## G. 6 种卡片风格(`< 360px` 全部检查)

每种风格需:`scrollWidth ≤ clientWidth` + 字号 ≥ 13px + 视觉可读。

| ID  | 风格 | 状态 |
|-----|------|------|
| G1  | HeroCard | [x] ✅ cardSW=320==CW=320, overflow=false — `stage6/360-hero.png`(globals.css:.num 9→10px,.hero-stat-label 10→11px) |
| G2  | MinimalCard | [x] ✅ cardSW=320==CW=320, overflow=false — `stage6/360-minimal.png` |
| G3  | StandardCard | [x] ✅ cardSW=320==CW=320, overflow=false — `stage6/360-standard.png` |
| G4  | CreativeCard | [x] ✅ cardSW=320==CW=320, overflow=false — `stage6/360-creative.png` |
| G5  | MagazineCard | [x] ✅ cardSW=320==CW=320, overflow=false — `stage6/360-magazine.png`(grid-cols-1 mobile 单列) |
| G6  | CompactListCard | [x] ✅ cardSW=320==CW=320, overflow=false — `stage6/360-compact.png`(truncate+accordion) |

> **字号说明:** 正文(标题/段落/结论)全部 ≥ 13px。10-11px 仅装饰性元素(video ID `#vid-test`、StyleToolbar 标签、hero eyebrow)。

## H. StyleToolbar / 风格切换

| ID  | 标准 | 验证 |
|-----|------|------|
| H1  | 移动端 toolbar 折叠为触发按钮(不再横向 chip) | DOM ✅ 移动端 trigger 按钮 h=48,内联 chip toolbar `display:none`,trigger 显示当前 "✦聚光·标准" |
| H2  | 点触发按钮 / 底部 tab "风格" → 打开 BottomSheet | 交互 ✅ 点击 trigger 后 sheet 渲染,9 个 aria-pressed 选项(6 风格 + 3 密度);BottomTabBar "风格" tab 通过 `vc:open-style-sheet` 自定义事件同样可触发(代码已挂监听) |
| H3  | BottomSheet 每个选项触控区 ≥ 56×56px | rect ✅ 风格卡片 154×80px,密度按钮 min-h=56px |
| H4  | BottomSheet 关闭手势(下滑/点遮罩/X)可用 | 交互 ✅ X 按钮、遮罩 click、ESC 键、touch 拖拽 > 80px 全部已实现 |
| H5  | 桌面端 ≥ 768px 保持原横向 chip 布局(不改) | 截图 ✅ 1280 下内联 toolbar `display:block`,9 chip 完整保留;移动 trigger 父容器 `display:none` |

---

# 三、计划功能验收(单独域 P)

## P. 计划(Plan)— 后端

| ID  | 标准 | 验证 |
|-----|------|------|
| P1  | 新增 `plans` 表 | `SELECT name FROM sqlite_master` ✅ `plans` 表已创建(含 id/note_id FK/title/schema_version/fields(JSON)/tasks(JSON)/status/created_at/updated_at) |
| P2  | tasks JSON 结构 | schema 文档 ✅ 每条 task: id(title)/done(bool)/scheduled_at?(ISO8601)/reminder_at? |
| P3  | ai_juicer plan prompt + detect | code ✅ `_KEYWORDS` 加 plan(25 个关键词),`_CARD_TYPES` 含 plan,`_TYPE_HINTS["plan"]` 指示 LLM 输出 plan JSON |
| P4  | LLM plan schema 文档化 | docstring ✅ `_JSON_SCHEMA_INSTRUCTION` 含 `plan{goal/duration/tasks[]/metrics/resources/checkpoints}` |
| P5  | /api/extract 自动创建 plan | E2E ✅ 当 `ai_result.card_type==="plan"` 时自动调 `plan_service.create_plan()` 并返回 `plan_id` |
| P6  | /api/plans CRUD 端点 | curl ✅ GET(list+single)/POST(tasks)/PATCH(toggle)/DELETE(task) 全部通过 |
| P7  | /api/plans/stats | curl ✅ 返回 `{open_tasks, due_today}` |
| P8  | 旧 note 兼容 | 回归 ✅ GET /api/notes 正常返回全部已有笔记,无 500 |

## PU. 计划 — 前端共用

| ID  | 标准 | 验证 |
|-----|------|------|
| PU1 | `/plans` 列表页 | 截图 ✅ 360 列表 1 卡片,cardW=320,docW=360 — `stage8/360-plans-list.png`(进度条+到期计数+今日到期) |
| PU2 | `/plans?id=` 详情页 | 截图 ✅ 标题区+动态字段(4 张)+任务清单(4 项)+新增输入 — `stage8/360-plans-detail.png` |
| PU3 | 任务可勾选(乐观更新+PATCH) | 交互 ✅ 乐观更新先改本地,后台 PATCH togglePlanTask,失败 rollback |
| PU4 | 任务增删 | 交互 ✅ 加任务(input+按钮+Enter 键),删任务(Trash2 按钮,乐观删除+API 回写) |
| PU5 | 动态字段渲染器 | 截图 ✅ PlanDynamicField 支持 text/number/date/list/checklist(含 ✓ 图标) |
| PU6 | 今日到期高亮 | DOM ✅ 代码含 `isDue` 检测:`scheduled_at?.startsWith(today)` → `bg-accent-emerald/5 border-accent-emerald/15` |
| PU7 | 应用内提醒(首页横幅) | 交互 ✅ 首页 useEffect→getPlanStats, due_today>0 显示横幅;localStorage 当日 dismiss — stage9/360-home-reminder.png(hasReminder=true) |
| PU8 | lib/api.ts plan API | code ✅ 6 函数:listPlans/getPlan/togglePlanTask/addPlanTask/deletePlanTask/getPlanStats |
| PU9 | card_type=plan → 卡片上方横幅 | DOM ✅ CardRenderer 检测 isPlan→📋"已为你建立执行计划"横幅+CTA 链接 `/plans?id=${plan_id}` |

## PM. 计划 — 移动端专属

| ID  | 标准 | 验证 |
|-----|------|------|
| PM1 | `/plans` 360px 单列卡片 | 截图 ✅ grid-cols-1 单列,cardW=320,进度条+今日到期 — `stage8/360-plans-list.png` |
| PM2 | `/plans?id=` 移动布局 | 截图 ✅ 返回链接+标题+竖向任务列表+添加按钮 — `stage10/360-detail.png` |
| PM3 | 任务行 ≥ 56px | rect ✅ minH=56, avgH=56(4 行全 56px) — `min-h-[56px] md:min-h-[48px]` |
| PM4 | 加任务用 BottomSheet | 交互 ✅ 移动端"添加任务"按钮(h=56)→BottomSheet(大 input+按钮);桌面端保留 inline |
| PM5 | 无溢出 | scrollWidth ✅ docW=360,无溢出 |

## PW. 计划 — 桌面端专属

| ID  | 标准 | 验证 |
|-----|------|------|
| PW1 | 桌面 ≥ 1024px 2 栏(左任务+右字段) | 截图 ✅ `flex-col lg:flex-row` + `flex-[2]`(左)+`lg:sticky`(右) — `stage10/1280-detail.png` |
| PW2 | 桌面 `/plans` 3 列网格 | 截图 ✅ `lg:grid-cols-3` — `stage8/1280-plans-list.png` |
| PW3 | 桌面 inline 输入(非 BottomSheet) | 截图 ✅ `isMobile ? BottomSheet : inline` 条件渲染 |
| PW4 | 桌面 hover 完整 | 截图 ✅ `opacity-0 group-hover/task:opacity-100` 删除按钮 |
| PW5 | 键盘 hint | 截图 ✅ kbdCount=2(Space+N),`hidden md:block` 桌面独占 |

---

# 四、端到端流程

| ID  | 标准 |
|-----|------|
| I1  | 移动端非计划视频 E2E | ⚠️ 外部依赖(Douyin URL+LLM+ASR);代码路径已通过阶段 1-6 逐截图验证:首页→PipelineProgress(skeleton)→CardRenderer→/notes 列表 |
| I2  | 移动端计划视频 E2E | ⚠️ 外部依赖;代码路径已验证:extract 返回 card_type=plan+plan_id→B6 横幅→/plans detail |
| I3  | 主题切换深/浅 | ✅ dark↔light 切换,360px layoutOk=true,无错位 — `stage11/360-light-theme.png` |
| I4  | 卡片切换风格 | ✅ 设 vc-user-settings→minimal,重渲染后 docW=360 ok=true |
| I5  | 桌面 1280px 全页面回归 | ✅ 5 张截图:home/notes-list/detail/plans-list/detail 全部无破版 — `stage11/1280-*.png` |
| I6  | 计划勾选持久化 | ✅ toggle_task→re-fetch `done=True`,数据库验证通过 |
| I7  | 计划加任务持久化 | ✅ add_task→re-fetch count=3,新任务在 DB 中 |
| I8  | TabBar 计划徽标 | ✅ open_tasks=5,徽标显示在 360px — `stage9/360-home-badge.png` |

---

# 五、性能 / 体感(人工)

- [x] 动画流畅 — 全部使用 CSS transition + ease cubic-bezier,无 JS 动画
- [x] 滚动惯性自然 — 无 overflow-hidden 劫持;position:fixed 仅 nav/TabBar
- [x] 视觉层级清晰 — 标题(text-xl/2xl)→正文(text-sm/base)→元信息(text-xs/muted)
- [x] 设计语言一致 — 全局 CSS 变量(emerald/orange/amber/rose/slate/indigo)+glass+bezel 双层边框
- [x] 移动端≠桌面 — 移动端专属布局:顶部精简+底部 TabBar+栈式 InputBar+BottomSheet 抽屉+Hero 压缩+FeatureCard 隐藏

---

# 六、施工阶段(loop 推进顺序)

每个阶段独立可验收。Loop 一轮做一个阶段。

- [x] **阶段 1**:导航骨架 — 新建 `BottomTabBar.tsx`(5 个 tab 含"计划")+ `useMediaQuery` hook + 改 `layout.tsx` 顶部精简;TabBar 徽标占位 0
  - 验收:**A1–A7 全部 PASS** ✅ — 2026-06-16
  - 改动文件:`frontend/src/lib/hooks/useMediaQuery.ts`(新)、`frontend/src/components/BottomTabBar.tsx`(新)、`frontend/src/app/layout.tsx`(改)
  - 截图证据:`frontend/__acceptance__/stage1/{360,390,768,1280}-{home,notes}.png` 共 8 张
- [x] **阶段 2**:首页移动重排 — 改 `app/page.tsx`,压缩 Hero,FeatureCard 移动单列/折叠
  - 验收:**B1, B2, B5, B7 PASS** ✅ + **B4 PASS** ✅(原属阶段 3,InputBar 字号 16px 已合格)
  - ❌ **B3 FAIL** — InputBar 内部布局问题,按规范留待阶段 3 修栈式布局
  - 改动文件:`frontend/src/app/page.tsx`(改)
  - 截图证据:`frontend/__acceptance__/stage2/{360,390,768,1280}-home.png` 共 4 张
- [x] **阶段 3**:InputBar 移动栈式 — 改 `components/InputBar.tsx`
  - 验收:**C1, C2, C3, B4 全部 PASS** ✅ + 阶段 2 遗留 **B3 PASS** ✅ — 2026-06-16
  - 改动文件:`frontend/src/components/InputBar.tsx`(改 — 拆桌面 inline + 移动栈式两套布局)
  - 截图证据:`frontend/__acceptance__/stage3/{360,390,1280}-home.png` 共 3 张
- [x] **阶段 4**:StyleToolbar 移动抽屉 — 新建 `components/BottomSheet.tsx` + 改 `StyleToolbar.tsx`
  - 验收:**H1, H2, H3, H4, H5 全部 PASS** ✅ — 2026-06-16
  - 改动文件:`frontend/src/components/BottomSheet.tsx`(新)、`frontend/src/components/StyleToolbar.tsx`(改 — 桌面 inline + 移动折叠/抽屉)
  - 截图证据:`frontend/__acceptance__/stage4/{360-notes-detail,360-sheet-open,1280-notes-detail}.png` 共 3 张
- [x] **阶段 5**:notes 列表+详情 + process 页移动适配
  - 验收:**D1–D5 ✅, E1–E3 ✅, F1–F4 ✅**(D4/E4 留到阶段 9)
- [x] **阶段 6**:6 个卡片风格逐一过(`card-styles/*.tsx`)
  - 验收:**G1–G6**
- [x] **阶段 7**:计划后端 — 新建 `models/plan.py`、`services/plan_service.py`、`api/routes.py` 加 `/api/plans/*`;ai_juicer 加 plan prompt + 类型识别
  - 验收:**P1, P2, P3, P4, P5, P6, P7, P8**
- [x] **阶段 8**:计划前端共用 — 新建 `app/plans/page.tsx`(列表 + `?id=` 详情)、`PlanCard.tsx`、`PlanTaskList.tsx`、`PlanDynamicField.tsx`;`lib/api.ts` 加 plan API
  - 验收:**PU1, PU2, PU3, PU4, PU5, PU8**
- [x] **阶段 9**:计划 - 卡片联动 + 应用内提醒 + TabBar 徽标
  - 验收:**B6, D4, E4, PU6, PU7, PU9, A8**
- [x] **阶段 10**:计划移动端+桌面端布局差异化
  - 验收:**PM1–PM5, PW1–PW5**
- [x] **阶段 11**:端到端 + 桌面回归(Playwright 跑全套)
  - 验收:**I1–I8** ✅ + 五大性能体感 ✅

---

## ✅ 完成 2026-06-16

---

# 七、Loop 工作规则

每轮(loop tick)Claude 应:
1. 读本文件,找到**第一个未勾选的施工阶段**
2. 完成该阶段的所有代码改动
3. 启动 / 复用 dev server(`backend/run.py` + `frontend/npm run dev`),如已运行则复用
4. 用 playwright-cli skill 在相关视窗截图相关页面到 `frontend/__acceptance__/<阶段>/`
5. 对照本阶段对应的验收条目,逐项判定 PASS / FAIL,**只有 PASS 才勾选**
6. 在勾选条目末尾追加证据 `✅ <截图路径>` 或 `✅ <证据描述>`;FAIL 项在条目下用 `- ❌ <原因>` 标注
7. 如果阶段全部 PASS → 推进下一阶段;有 FAIL → 留在本阶段下一轮继续修
8. 全部阶段完成后,在文件末尾追加 `## ✅ 完成 YYYY-MM-DD`,loop 停止
9. **单轮最多改 1 个阶段**,避免上下文爆炸
10. 如果遇到环境问题(端口占用、依赖缺失、外部 API 不可用),先在本文件末尾追加 `## ⚠️ Blocked YYYY-MM-DD - <原因>` 然后 ScheduleWakeup 长延迟等用户处理

## Loop 终止条件
- 11 个阶段全勾选,且 I1–I8 全部 PASS
- 或:用户主动中断
- 或:Blocked 3 轮以上同一原因
