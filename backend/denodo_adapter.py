# denodo_adapter_full.py
"""
Complete Denodo adapter + filtering + scoring helper.

Usage:
    python denodo_adapter_full.py --view-url "<VIEW_URL>" --keyword ai --top 10

Notes:
    - This code first tries server-side OData-like filtering ($filter).
    - If server-side filter fails (400/4xx), it fetches the full view and applies a robust
      client-side filter (checks common fields + deep text extraction).
"""

import os
import json
import logging
import argparse
from typing import Any, Dict, List, Optional, Tuple

import requests

try:
    import redis
except Exception:
    redis = None

# Logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("denodo_adapter")

# Environment / defaults
DENODO_BASE = os.getenv("DENODO_BASE_URL", "http://localhost:9090")
DENODO_USER = os.getenv("DENODO_USER", "admin")
DENODO_PASS = os.getenv("DENODO_PASS", "admin")
DENODO_DEFAULT_VIEW_URL = os.getenv(
    "DENODO_DEFAULT_VIEW_URL",
    f"{DENODO_BASE}/server/wave_market_signals/final_market_signals/views/final_market_signals"
)
REDIS_URL = os.getenv("REDIS_URL", None)
DEFAULT_TTL = int(os.getenv("DENODO_CACHE_TTL_SECONDS", "1200"))

# Redis client (optional)
_redis_client = None
if REDIS_URL and redis:
    try:
        _redis_client = redis.from_url(REDIS_URL)
        logger.info("Redis configured for caching.")
    except Exception as e:
        logger.warning("Could not connect to Redis: %s", e)
        _redis_client = None


class DenodoError(Exception):
    pass


def _cache_get(key: str) -> Optional[str]:
    if _redis_client:
        try:
            v = _redis_client.get(key)
            if v:
                return v.decode("utf-8") if isinstance(v, bytes) else v
        except Exception:
            return None
    return None


def _cache_set(key: str, value: str, ttl: int = DEFAULT_TTL):
    if _redis_client:
        try:
            _redis_client.set(key, value, ex=ttl)
        except Exception:
            pass


def _normalize_denodo_response(body: Any) -> List[Dict]:
    """
    Normalizes typical Denodo REST shapes into a list of dict rows.
    Recognizes 'elements' (your sample), 'result', 'items', 'rows', 'data', or root list.
    """
    if body is None:
        return []

    if isinstance(body, list):
        return body

    if isinstance(body, dict):
        # common keys (include 'elements')
        for k in ("elements", "result", "items", "rows", "data"):
            v = body.get(k)
            if isinstance(v, list):
                return v
            # sometimes v is a dict that contains a list
            if isinstance(v, dict):
                for k2, v2 in v.items():
                    if isinstance(v2, list):
                        return v2
        # sometimes a single named list sits under a single top-level key - try first list value
        list_values = [v for v in body.values() if isinstance(v, list)]
        if len(list_values) == 1:
            return list_values[0]
        # fallback: return the dict as one-row
        return [body]
    # unknown shape -> wrap
    return [body]


def fetch_view_json(
    view_url: str,
    params: Optional[Dict[str, str]] = None,
    ttl: Optional[int] = None,
    timeout: int = 30
) -> Any:
    """
    Fetch JSON from Denodo view REST endpoint.
    Caches via Redis if configured and ttl provided.
    """
    params = params or {}
    cache_key = None
    if _redis_client and ttl and ttl > 0:
        q = "&".join(f"{k}={params[k]}" for k in sorted(params.keys()))
        cache_key = f"denodo:{view_url}|{q}"
        cached = _cache_get(cache_key)
        if cached:
            try:
                return json.loads(cached)
            except Exception:
                pass

    auth = (DENODO_USER, DENODO_PASS)
    headers = {"Accept": "application/json"}
    try:
        resp = requests.get(view_url, auth=auth, headers=headers, params=params, timeout=timeout)
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        raise DenodoError(f"Denodo HTTP error: {e} - URL: {view_url}") from e
    except requests.exceptions.RequestException as e:
        raise DenodoError(f"Connection error to Denodo: {e} - URL: {view_url}") from e

    try:
        body = resp.json()
    except ValueError as e:
        raise DenodoError(f"Invalid JSON from Denodo: {e} - URL: {view_url}") from e

    if cache_key:
        try:
            _cache_set(cache_key, json.dumps(body), ttl or DEFAULT_TTL)
        except Exception:
            pass

    return body


def try_server_side_filter(
    view_url: str,
    keyword: str,
    top: int = 50
) -> Tuple[bool, List[Dict], Optional[str]]:
    """
    Try to request a filtered result using server-side OData-like $filter and $top.
    Returns (succeeded:boolean, rows:list, error_message or None)
    """
    kw = keyword.replace("'", "''")  # basic escape for single-quote inside filter
    candidate_fields = ["name_github", "description_github", "title", "title_news"]
    # Build contains(tolower(...)) clauses conservatively
    contains_clauses = [f"contains(tolower({f}),'{kw.lower()}')" for f in candidate_fields]
    filter_expr = " or ".join(contains_clauses)

    params = {
        "$top": str(top),
        "$filter": filter_expr
    }

    try:
        body = fetch_view_json(view_url, params=params, ttl=None)
        rows = _normalize_denodo_response(body)
        logger.info("Server-side filtering accepted. Received %d rows", len(rows))
        return True, rows, None
    except DenodoError as e:
        logger.warning("Server-side filter failed: %s", e)
        return False, [], str(e)


def _collect_text_from_value(v: Any) -> str:
    """Recursively collect textual content from nested dict/list/scalars."""
    if v is None:
        return ""
    if isinstance(v, str):
        return v
    if isinstance(v, (int, float, bool)):
        return str(v)
    if isinstance(v, dict):
        parts: List[str] = []
        for vv in v.values():
            t = _collect_text_from_value(vv)
            if t:
                parts.append(t)
        return " ".join(parts)
    if isinstance(v, list):
        parts: List[str] = []
        for item in v:
            t = _collect_text_from_value(item)
            if t:
                parts.append(t)
        return " ".join(parts)
    return str(v)


def simple_keyword_filter(rows: List[Dict], keyword: str) -> List[Dict]:
    """
    Client-side filter:
      1) check a list of candidate fields quickly
      2) if no match, do deep text extraction and search
    """
    keyword = (keyword or "").strip().lower()
    if not keyword:
        return rows

    out: List[Dict] = []
    candidate_fields = ["name_github", "description_github", "title", "title_news", "repo_name", "repo_description", "name", "full_name"]
    for r in rows:
        matched = False
        for f in candidate_fields:
            val = r.get(f)
            if val and keyword in str(val).lower():
                out.append(r)
                matched = True
                break
        if matched:
            continue
        # deep fallback
        textblob = _collect_text_from_value(r).lower()
        if keyword in textblob:
            out.append(r)
    return out


def safe_number(val: Any, default: float = 0.0) -> float:
    try:
        return float(val)
    except Exception:
        return default


def score_item(item: Dict) -> Dict:
    """
    Compute a composite score for the item and attach it to the dictionary.
    """
    stars = safe_number(item.get("stargazers_count") or item.get("stars") or item.get("stargazers") or 0)
    forks = safe_number(item.get("forks_count") or item.get("forks") or 0)
    watchers = safe_number(item.get("watchers_count") or item.get("watchers") or 0)
    reddit_ups = safe_number(item.get("ups") or item.get("reddit_ups") or 0)
    reddit_comments = safe_number(item.get("num_comments") or item.get("reddit_comments") or 0)
    trend_momentum = safe_number(item.get("trend_momentum") or item.get("momentum") or 0)

    composite = (
        0.30 * trend_momentum +
        0.25 * stars +
        0.20 * (reddit_ups + reddit_comments) +
        0.15 * forks +
        0.10 * (0 if watchers == 0 else forks / (watchers + 1))
    )

    item["_computed"] = {
        "stars": stars,
        "forks": forks,
        "watchers": watchers,
        "reddit_ups": reddit_ups,
        "reddit_comments": reddit_comments,
        "trend_momentum": trend_momentum,
        "composite": composite
    }
    item["composite_validation_score"] = composite
    return item


def get_validated_ideas(
    keyword: str,
    view_url: Optional[str] = None,
    prefer_server_filter: bool = True,
    top: int = 50,
    do_score: bool = True,
    use_cache_ttl: Optional[int] = DEFAULT_TTL
) -> Dict[str, Any]:
    """
    High-level function for the AI tool/backend.
    """
    view_url = view_url or DENODO_DEFAULT_VIEW_URL
    if not view_url:
        return {"status": "error", "error": "No Denodo view URL provided", "meta": {}}

    rows: List[Dict] = []
    meta: Dict[str, Any] = {"view_url": view_url, "used_server_filter": False}

    if prefer_server_filter:
        ok, rows, err = try_server_side_filter(view_url, keyword, top=top)
        meta["server_filter_attempt_error"] = err
        if ok:
            meta["used_server_filter"] = True
        else:
            try:
                raw = fetch_view_json(view_url, params=None, ttl=use_cache_ttl)
            except DenodoError as e:
                return {"status": "error", "error": str(e), "meta": meta}
            rows = _normalize_denodo_response(raw)
    else:
        try:
            raw = fetch_view_json(view_url, params=None, ttl=use_cache_ttl)
        except DenodoError as e:
            return {"status": "error", "error": str(e), "meta": meta}
        rows = _normalize_denodo_response(raw)

    if not meta.get("used_server_filter"):
        before_cnt = len(rows)
        rows = simple_keyword_filter(rows, keyword)
        meta["rows_before_filter"] = before_cnt
        meta["rows_after_filter"] = len(rows)

    result = rows
    if do_score:
        scored = [score_item(r) for r in result]
        scored_sorted = sorted(scored, key=lambda x: x.get("composite_validation_score", 0), reverse=True)
        result = scored_sorted[:top]

    return {"status": "ok", "data": result, "meta": meta}


# ----------------- CLI / quick test -----------------
def parse_args():
    p = argparse.ArgumentParser(description="Denodo adapter quick test")
    p.add_argument("--view-url", default=DENODO_DEFAULT_VIEW_URL, help="Full Denodo published view URL")
    p.add_argument("--keyword", default="ai", help="Keyword to validate / filter")
    p.add_argument("--top", type=int, default=10, help="Return top N results")
    p.add_argument("--no-server-filter", action="store_true", help="Do not attempt server-side $filter (force client-side)")
    p.add_argument("--no-score", action="store_true", help="Skip scoring (return raw filtered rows)")
    return p.parse_args()



if __name__ == "__main__":
    args = parse_args()
    logger.info("Testing Denodo adapter...")
    logger.info("Using view URL: %s", args.view_url)
    prefer_server = not args.no_server_filter

    try:
        resp = get_validated_ideas(
            keyword=args.keyword,
            view_url=args.view_url,
            prefer_server_filter=prefer_server,
            top=args.top,
            do_score=not args.no_score
        )
    except Exception as e:
        logger.exception("Unexpected error: %s", e)
        raise

    if resp.get("status") != "ok":
        logger.error("ERROR: %s", resp.get("error"))
        logger.info("META: %s", resp.get("meta"))
    else:
        logger.info("SUCCESS - meta: %s", resp.get("meta"))
        data = resp.get("data", [])
        logger.info("Returning %d rows (top=%d)", len(data), args.top)
        for i, item in enumerate(data, 1):
            name = item.get("name_github") or item.get("repo_name") or item.get("title") or "<no-title>"
            score = item.get("composite_validation_score", 0)
            print(f"{i:02d}. {name}  (score={score:.3f})")
