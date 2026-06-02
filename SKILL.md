---
name: exa-search
description: Neural web search and content extraction via Exa AI. Use for semantic search ("find docs/code that handle concept X"), AI-grounded answers with citations, fetching clean pre-extracted page content, and any query where keyword matching tends to fail. Better than traditional keyword search for code, docs, and conceptual lookup.
license: MIT
compatibility: Node.js 18+; no npm dependencies.
---

# Exa Search

Neural web search built for AI agents. Returns clean, pre-extracted page content (no scraping needed) and supports semantic ("neural"), keyword, and auto-routed search.

## Setup

Get a free API key at https://dashboard.exa.ai/api-keys.

The scripts read the key from **either** of these locations (env var wins if both are set):

```bash
# Option 1 — environment variable (good for shells, CI)
export EXA_API_KEY=your-key-here

# Option 2 — config file (works without touching shell rc)
mkdir -p ~/.config/exa
printf '%s' 'your-key-here' > ~/.config/exa/key
chmod 600 ~/.config/exa/key
```

Requires Node.js 18+ (uses built-in `fetch`). No `npm install` needed.

## Search

```bash
{baseDir}/search.js "query"                          # 5 results, snippets only
{baseDir}/search.js "query" -n 10                    # More results (max 100)
{baseDir}/search.js "query" --contents               # Include page text as markdown
{baseDir}/search.js "query" --highlights             # Include top excerpts (cheaper than --contents, ~10x fewer tokens)
{baseDir}/search.js "query" --type fast              # ~450ms latency
{baseDir}/search.js "query" --type instant           # ~250ms latency (chat/voice)
{baseDir}/search.js "query" --type deep              # 4-15s, multi-step reasoning
{baseDir}/search.js "query" --domain github.com      # Restrict to one domain (repeatable)
{baseDir}/search.js "query" --fresh                  # Force livecrawl (current content, slower)
{baseDir}/search.js "query" --days 30                # Only results published in last 30 days
{baseDir}/search.js "query" --category "research paper"  # Filter by content category
```

Default `--type` is `auto` (Exa routes to the best variant per query). Valid types: `auto`, `fast`, `instant`, `deep-lite`, `deep`, `deep-reasoning`.

**Category restrictions:** `--category company` and `--category people` reject `--days` and date filters — combining them returns a 400 error.

## Direct Answer

For factual questions where you want a synthesized cited answer instead of parsing results:

```bash
{baseDir}/answer.js "What is the latest stable Node.js LTS version?"
{baseDir}/answer.js "Who founded Anthropic?" --text   # Include source page text
```

## When to Use

- **Semantic lookup** ("code that does X", "docs about Y concept"): `search.js` — neural search shines here
- **Quick factual question**: `answer.js` — one call, cited answer, no result-parsing
- **Fresh content** (releases, news): add `--days N`
- **Site-restricted lookup**: add `--domain example.com` (repeat for multiple)
- **Token-tight context**: prefer `--highlights` over `--contents` (~10x fewer tokens)
- **Real-time data** (rates, prices, today's news): add `--fresh` to force livecrawl
- **Exact-string / error-message lookups**: pass `--type fast` and put the literal string in quotes — Exa's `auto` router will fall back to keyword matching when the query looks lexical
