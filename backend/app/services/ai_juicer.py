"""
AI content extraction service.

Takes a raw transcript and produces a structured knowledge card using
DeepSeek-V3 via LiteLLM.
"""

from __future__ import annotations

import json
from typing import Any

from litellm import completion

from app.core.config import settings

# ---------------------------------------------------------------------------
# Content-type detection (keyword-based)
# ---------------------------------------------------------------------------

_KEYWORDS: dict[str, list[str]] = {
    "recipe": [
        "食谱", "做法", "食材", "烹饪", "炒", "煮", "炖", "蒸", "烤",
        "调料", "大火", "小火", "翻炒", "腌制", "切片", "切块",
        "克", "毫升", "适量", "勺", "盐", "糖", "酱油", "醋",
    ],
    "insight": [
        "思维", "认知", "方法论", "底层逻辑", "心理学", "习惯",
        "成长", "建议", "提升", "效率", "管理", "目标", "复盘",
        "深度思考", "本质", "规律", "原理",
    ],
    "history": [
        "历史", "朝代", "皇帝", "战争", "文明", "古代", "公元",
        "世纪", "王朝", "帝国", "革命", "改革", "战役", "史记",
    ],
    "product": [
        "测评", "推荐", "好物", "性价比", "价格", "对比",
        "种草", "拔草", "开箱", "使用体验", "优缺点", "值得买",
        "品牌", "型号", "参数",
    ],
}

_CARD_TYPES = ("recipe", "insight", "history", "product", "general")


def detect_content_type(transcript: str) -> str:
    """Classify transcript content into one of the predefined card types."""
    scores: dict[str, int] = {t: 0 for t in _CARD_TYPES}

    for card_type, keywords in _KEYWORDS.items():
        for kw in keywords:
            if kw in transcript:
                scores[card_type] += 1

    best = max(scores, key=lambda k: scores[k])
    # Require at least 2 keyword hits to avoid false positives on short text.
    if scores[best] >= 2:
        return best
    return "general"


# ---------------------------------------------------------------------------
# System prompts (Chinese, type-specific)
# ---------------------------------------------------------------------------

_BASE_INSTRUCTION = (
    "你是一位专业的知识提炼助手。请根据用户提供的视频转录文本，"
    "生成结构化的知识卡片。输出必须严格遵守下面的 JSON 格式。"
)

_TYPE_HINTS: dict[str, str] = {
    "recipe": (
        "这是一段美食/烹饪类视频的转录文本。请提取：\n"
        "- 食材清单与用量\n"
        "- 烹饪步骤（按顺序）\n"
        "- 关键技巧与注意事项\n"
        "- 踩坑提示（常见失败原因）"
    ),
    "insight": (
        "这是一段知识/观点/方法论类视频的转录文本。请提取：\n"
        "- 核心观点\n"
        "- 分论点及论据\n"
        "- 可操作的行动建议\n"
        "- 常见误区"
    ),
    "history": (
        "这是一段历史/文化类视频的转录文本。请提取：\n"
        "- 关键历史事件与时间线\n"
        "- 重要人物与关系\n"
        "- 因果关系与影响\n"
        "- 容易混淆或记错的知识点"
    ),
    "product": (
        "这是一段产品测评/种草类视频的转录文本。请提取：\n"
        "- 产品基本信息\n"
        "- 优点与缺点\n"
        "- 适用场景与人群\n"
        "- 购买建议与性价比分析"
    ),
    "general": (
        "请提取这段视频转录文本的核心内容：\n"
        "- 主题概述\n"
        "- 关键要点（3-5 个）\n"
        "- 实用建议或结论\n"
        "- 需要注意的事项"
    ),
}

_JSON_SCHEMA_INSTRUCTION = """\
请以如下 JSON 格式输出，不要包含任何其他文字：

{
  "sections": [
    {"title": "小节标题", "content": "小节内容", "emoji": "对应emoji"}
  ],
  "conclusion": "三句话总结，用换行符分隔",
  "pitfall_rating": 3,
  "card_type": "general"
}

字段说明：
- sections: 3-6 个小节，每小节包含标题、内容和一个 emoji
- conclusion: 恰好三句话的总结
- pitfall_rating: 踩坑风险评级，1-5 的整数（1=几乎不会踩坑，5=极易踩坑）
- card_type: 卡片类型，与输入一致
"""


def get_system_prompt(content_type: str) -> str:
    """Return the full system prompt for a given content type."""
    hint = _TYPE_HINTS.get(content_type, _TYPE_HINTS["general"])
    return f"{_BASE_INSTRUCTION}\n\n{hint}\n\n{_JSON_SCHEMA_INSTRUCTION}"


# ---------------------------------------------------------------------------
# Card generation
# ---------------------------------------------------------------------------

def generate_card(
    transcript: str,
    content_type: str,
    video_title: str,
) -> dict[str, Any]:
    """Call LLM to produce a structured knowledge card.

    Returns
    -------
    dict
        Keys: ``sections`` (list), ``conclusion`` (str), ``pitfall_rating`` (int),
        ``card_type`` (str).
    """
    system_prompt = get_system_prompt(content_type)

    user_message = (
        f"视频标题：{video_title}\n\n"
        f"视频转录文本如下：\n\n{transcript}"
    )

    # Build LiteLLM call parameters.
    # Supports custom Anthropic-compatible endpoints (e.g. mimo proxy).
    import os

    llm_kwargs: dict = {
        "model": settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.3,
        "max_tokens": 4096,
    }

    # Custom API base and key for proxied Anthropic endpoints.
    if settings.LLM_API_BASE:
        llm_kwargs["api_base"] = settings.LLM_API_BASE
    if settings.LLM_API_KEY:
        llm_kwargs["api_key"] = settings.LLM_API_KEY
    elif settings.API_KEY:
        llm_kwargs["api_key"] = settings.API_KEY

    response = completion(**llm_kwargs)

    raw: str = response.choices[0].message.content.strip()

    # Strip markdown code fences if present.
    if raw.startswith("```"):
        # Remove opening fence (```json or ```)
        first_newline = raw.index("\n")
        raw = raw[first_newline + 1 :]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    try:
        card: dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError:
        # If the LLM output isn't valid JSON, wrap it as a single-section card.
        card = {
            "sections": [
                {"title": "AI 提取结果", "content": raw, "emoji": "📝"},
            ],
            "conclusion": "AI 返回内容格式异常，请重试。",
            "pitfall_rating": 3,
            "card_type": content_type,
        }

    # Ensure required keys exist.
    card.setdefault("sections", [])
    card.setdefault("conclusion", "")
    card.setdefault("pitfall_rating", 3)
    card.setdefault("card_type", content_type)

    # Validate pitfall_rating range.
    try:
        card["pitfall_rating"] = max(1, min(5, int(card["pitfall_rating"])))
    except (TypeError, ValueError):
        card["pitfall_rating"] = 3

    return card
