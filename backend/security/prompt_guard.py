"""Sanitise free-text context fed to the AI agent.

The agent is the largest prompt-injection surface in the platform. Untrusted
operator input is passed into a model that has access to grounded web search
results. Without guards, an attacker controlling the input could try to
exfiltrate the system prompt, jailbreak constraints, or steer the agent
toward harmful actions.

Defences applied here:
  1. Length cap (no 100k-token prompt-stuffing)
  2. Strip control characters (NUL, escape, RTLO, zero-width, etc.)
  3. Strip common injection markers ("ignore previous instructions",
     "system:", role-tags, etc.) by replacement with a clear sentinel,
     so the model sees the intent obfuscated and the operator sees the
     replacement in the audit log.
  4. Wrap the user-provided text in a clearly-marked block so the
     downstream system prompt can refuse to follow instructions inside.

This is layered defence; the model itself is also instructed to ignore
instructions inside the `<context>` block in the system prompt.
"""
from __future__ import annotations

import re
import unicodedata

MAX_CONTEXT_CHARS = 2000

# Characters we never want in a model input — control chars, RTLO, zero-width
_BAD_CHAR_RE = re.compile(
    r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F"
    r"​-‏‪-‮⁠-⁯"
    r"]"
)

# Common jailbreak / prompt-injection patterns. Replaced with `[REDACTED]`
# so the operator can see what was stripped in the audit log.
_INJECTION_PATTERNS = [
    re.compile(r"(?i)\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts)\b"),
    re.compile(r"(?i)\bdisregard\s+(all\s+)?(previous|prior|above)\b"),
    re.compile(r"(?i)\b(system|assistant|developer)\s*:\s*"),
    re.compile(r"<\s*/?\s*(system|assistant|user|developer)\s*>", re.IGNORECASE),
    re.compile(r"(?i)\bact\s+as\s+(?:a\s+)?\w+\s+(model|agent|ai)\b"),
    re.compile(r"(?i)\byou\s+are\s+now\s+(?:a\s+)?\w+\s+(model|agent|ai)\b"),
    re.compile(r"(?i)\breveal\s+(your|the)\s+(system|hidden|secret)\s+(prompt|instructions)\b"),
    re.compile(r"(?i)\b(execute|run|eval|sudo|rm\s+-rf|curl|wget)\b"),
]


def sanitize_context(text: str) -> str:
    """Return a cleaned version of operator-provided AI context."""
    if not isinstance(text, str):
        return ""
    # Normalize unicode (NFKC collapses lookalikes)
    cleaned = unicodedata.normalize("NFKC", text)
    cleaned = _BAD_CHAR_RE.sub("", cleaned)
    for pat in _INJECTION_PATTERNS:
        cleaned = pat.sub("[REDACTED]", cleaned)
    if len(cleaned) > MAX_CONTEXT_CHARS:
        cleaned = cleaned[:MAX_CONTEXT_CHARS] + "…[truncated]"
    return cleaned.strip()


def wrap_for_model(cleaned: str) -> str:
    """Wrap sanitised context in a clearly-marked block.

    The model's system prompt instructs it to treat content inside
    `<operator_context>...</operator_context>` as DATA only — never as new
    instructions to follow. This is belt-and-braces alongside the regex pass.
    """
    return f"<operator_context>\n{cleaned}\n</operator_context>"
