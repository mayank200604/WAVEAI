"""
ai_sdk_tool.py

Example tool wrapper for exposing Denodo-grounded data to an LLM.
This is NOT tied to a specific LLM SDK — adapt register_tool(...) to your runtime.
"""

import logging
from typing import Dict, Any
from denodo_adapter import get_validated_ideas, DenodoError

LOGGER = logging.getLogger("ai_sdk_tool")
LOGGER.setLevel(logging.INFO)


def _format_citation(meta: Dict[str, Any]) -> str:
    view_url = meta.get("view_url")
    params = meta.get("params", {})
    return f"Data from Denodo view ({view_url}) with params {params}"


def get_market_signal_tool(idea_keywords: str, timeframe: str = "30d",
                           denodo_view_url: str = None,
                           require_grounding: bool = True) -> Dict[str, Any]:
    """
    Tool entrypoint intended to be called by the LLM system.
    - require_grounding: if True, the tool will return an error if Denodo fails (prevents hallucination)
    Always returns a dict with keys: success (bool), result (list), explanation (str), meta (dict).
    """
    try:
        LOGGER.info("get_market_signal_tool called with keywords=%s timeframe=%s view=%s require_grounding=%s",
                    idea_keywords, timeframe, denodo_view_url, require_grounding)

        # call the adapter (use client-side filtering by default for stability)
        res = get_validated_ideas(
            keyword=idea_keywords,
            view_url=denodo_view_url,
            top=10,
            prefer_server_filter=False  # safe default: client-side filtering
        )

        if not isinstance(res, dict):
            LOGGER.error("Denodo adapter returned non-dict: %s", type(res))
            if require_grounding:
                return {"success": False, "error": "Denodo adapter returned bad response", "details": str(res)}
            else:
                return {"success": True, "result": [], "explanation": "Ungrounded fallback (adapter returned invalid type)."}

        if res.get("status") != "ok":
            LOGGER.warning("Denodo adapter status not ok: %s", res)
            if require_grounding:
                return {"success": False, "error": "Denodo call failed", "details": res}
            else:
                return {"success": True, "result": [], "explanation": "Denodo returned no data; ungrounded fallback.", "meta": res.get("meta", {})}

        data = res.get("data", [])
        meta = res.get("meta", {}) or {}
        citation = _format_citation(meta)

        # Normalize items and prepare trimmed sample
        top_n = 10
        if isinstance(data, dict):
            items = [data]
        else:
            items = list(data)[:top_n]

        sample_row = items[0] if items else {}
        field_names = list(sample_row.keys()) if sample_row else []

        def _trim_row(r, keep_fields=None):
            if not isinstance(r, dict):
                return r
            if keep_fields is None:
                keep_fields = ["title", "name_github", "repo_name", "description_github",
                               "composite_validation_score", "stargazers_count", "forks_count",
                               "url_github", "html_url"]
            out = {}
            for k in keep_fields:
                if k in r:
                    out[k] = r[k]
            if not out:
                for i, (k, v) in enumerate(r.items()):
                    out[k] = v
                    if i >= 9:
                        break
            return out

        trimmed_result = [_trim_row(it) for it in items]

        LOGGER.info("get_market_signal_tool returning %d items (trimmed %d)", len(items), len(trimmed_result))
        return {
            "success": True,
            "result": items,
            "trimmed_result": trimmed_result,
            "sample_row": sample_row,
            "field_names": field_names,
            "explanation": f"Market signals for '{idea_keywords}' (timeframe={timeframe}). Grounded using Denodo. {citation}",
            "citation": citation,
            "meta": meta
        }

    except DenodoError as de:
        LOGGER.exception("DenodoError in get_market_signal_tool")
        if require_grounding:
            return {"success": False, "error": "DenodoError", "details": str(de)}
        else:
            return {"success": True, "result": [], "explanation": "Denodo unavailable; ungrounded fallback.", "meta": {}}

    except Exception as e:
        LOGGER.exception("Unexpected error in get_market_signal_tool")
        # never return None — always a dict
        return {"success": False, "error": "unexpected_exception", "details": str(e)}

# helper to trim large records for UI/demos (adjust keep_fields as you like)
def _trim_row(r, keep_fields=None):
    if not isinstance(r, dict):
        return r
    if keep_fields is None:
        # default: keep a short, useful subset if present
        keep_fields = ["title", "name_github", "repo_name", "description_github", "composite_validation_score", "stargazers_count", "forks_count", "url_github", "html_url"]
    out = {}
    for k in keep_fields:
        if k in r:
            out[k] = r[k]
    # if nothing selected, return first 10 keys+values
    if not out:
        for i, (k, v) in enumerate(r.items()):
            out[k] = v
            if i >= 9:
                break
    return out

    trimmed_result = [_trim_row(it) for it in items]

    return {
        "success": True,
        "result": items,               # full items (careful: large)
        "trimmed_result": trimmed_result,  # small, UI-friendly rows
        "sample_row": sample_row,
        "field_names": field_names,
        "explanation": f"Market signals for '{idea_keywords}' (timeframe={timeframe}). Grounded using Denodo. {citation}",
        "citation": citation,
        "meta": meta
        }


if __name__ == "__main__":
    import json, os, traceback
    try:
        view = os.getenv("DENODO_DEFAULT_VIEW_URL")
        out = get_market_signal_tool("ai", denodo_view_url=view)
        if not out:
            print("get_market_signal_tool returned None (no result).")
        else:
            print(json.dumps(out.get("meta", {}), indent=2))
            print("rows:", len(out.get("result", [])))
    except Exception as e:
        print("Exception while calling get_market_signal_tool:", str(e))
        traceback.print_exc()
