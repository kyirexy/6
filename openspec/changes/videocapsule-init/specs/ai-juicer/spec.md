## ADDED Requirements

### Requirement: Auto-detect content type
The system SHALL analyze the transcript text and automatically classify it into one of the predefined content types: recipe (美食做菜), insight (认知搞钱), history (历史科普), product (好物推荐), or general (通用).

#### Scenario: Recipe content detected
- **WHEN** transcript contains cooking-related keywords (食材, 做法, 炒, 煮, 调料 etc.)
- **THEN** system classifies it as `recipe` type

#### Scenario: Insight content detected
- **WHEN** transcript contains finance/self-improvement keywords (赚钱, 投资, 认知, 思维 etc.)
- **THEN** system classifies it as `insight` type

### Requirement: Generate structured card content
The system SHALL call DeepSeek-V3 via LiteLLM to generate structured card content based on the detected content type, including formatted sections with emoji decorations.

#### Scenario: Recipe card generation
- **WHEN** content type is `recipe`
- **THEN** AI generates: ingredients list with emoji, numbered step-by-step instructions (1️⃣2️⃣3️⃣), cooking tips, 3-line conclusion, and pitfall avoidance rating (⭐ out of 5)

#### Scenario: Insight card generation
- **WHEN** content type is `insight`
- **THEN** AI generates: key quotes with 💡, action items checklist, mental model summary, 3-line conclusion, and pitfall avoidance rating

### Requirement: Three-line ultimate conclusion
Every AI-generated card SHALL include a concise 3-line summary at the bottom that captures the core value of the video.

#### Scenario: Conclusion present in output
- **WHEN** AI processes any transcript
- **THEN** output contains a section labeled "【3行字终极结论】" with exactly 3 lines of distilled insight

### Requirement: Pitfall avoidance index
Every AI-generated card SHALL include a "防踩坑避雷指数" rating from 1 to 5 stars indicating how reliable/actionable the video content is.

#### Scenario: Rating output format
- **WHEN** AI completes card generation
- **THEN** output contains "【防踩坑避雷指数】⭐⭐⭐⭐ (4/5)" with the appropriate star count

### Requirement: LiteLLM integration
The system SHALL use LiteLLM's Python SDK to call LLM providers, with DeepSeek-V3 as the default model.

#### Scenario: Default model call
- **WHEN** no model override is specified
- **THEN** system calls `litellm.completion(model="deepseek/deepseek-chat", ...)` with the transcript as input

#### Scenario: Model fallback
- **WHEN** DeepSeek API is unavailable
- **THEN** system falls back to another configured model via LiteLLM
