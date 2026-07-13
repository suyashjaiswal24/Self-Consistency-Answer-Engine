# Self-Consistency Answer Engine

Sends the same prompt to multiple LLM providers in parallel, then uses an LLM
to synthesize their answers into a single, evaluated response.

## Interface

Both CLI and UI are supported:

- **CLI**: `node index.js` — prompts for input in the terminal, prints results.
- **UI**: React frontend (`web/`) + API (`server.js` locally / `api/ask.js`
  on Vercel) — prompt box, per-model response cards, and the synthesized
  answer.

## Providers used

- **OpenAI** (`gpt-4o-mini`)
- **Anthropic Claude** (`claude-haiku-4-5`)
- **Google Gemini** (`gemini-3.5-flash`, Interactions API)

Each is called through its own SDK with structured output enforced via a
shared Zod schema (`{ name, output }`).

## Self-consistency flow

1. **Fan-out**: the same prompt + system prompt is sent to all three
   providers concurrently (`Promise.allSettled` in `src/fetchAll.js`), so one
   provider failing doesn't block the others.
2. **Normalize**: each response is parsed into the shared `{ name, output }`
   shape; failures are captured as `{ error }` instead of throwing.
3. **Evaluate/synthesize**: all raw responses are handed to Claude again
   (`src/evaluate.js`) with an evaluator system prompt instructing it to
   compare answers for accuracy/clarity, discard hallucinated or weak
   content, and merge the strongest points into one final answer.
4. The result is a single authoritative response backed by cross-checking
   across three independent models, rather than trusting any one model's
   output alone.

## Running locally

```bash
pnpm install
pnpm server   # API on http://localhost:3001
pnpm web      # React UI on http://localhost:5173 (proxies /api to server)
```

or CLI-only:

```bash
node index.js
```

Requires `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and `GOOGLE_API_KEY` in a
`.env` file (see `.env.example`).
