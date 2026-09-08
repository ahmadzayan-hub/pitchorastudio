# Deployment (Free Stack)

Total cost target: **$0/month** for the MVP.

## 1. Supabase (free tier)

1. Create a new project at https://supabase.com.
2. In the SQL editor, paste `supabase/migrations/0001_init.sql` and run.
3. (Optional) Run `supabase/seed.sql` once you have at least one org.
4. Copy your project URL, anon key, and service-role key.
5. In **Authentication → Providers**, enable **Email** with magic link.

## 2. Ollama (free LLM engine)

Choose one:

- **Local development**: install [Ollama](https://ollama.com), then
  ```bash
  ollama pull llama3
  ollama pull mistral
  ollama pull phi3
  ollama serve              # exposes http://localhost:11434
  ```
- **Free VPS** (Oracle Always Free, Fly.io free, etc.): install Ollama and
  expose port `11434` over a private tunnel (e.g. Cloudflare Tunnel — also free).
- **Self-hosted at home**: forward `11434` via Tailscale Funnel (free).

Set `OLLAMA_BASE_URL` accordingly.

## 3. Vercel (free hosting)

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OLLAMA_BASE_URL` (must be reachable from Vercel — use a tunnel)
   - `OLLAMA_MODEL_REASONING` / `_FAST` / `_REWRITE`
   - `EXTENSION_API_KEY` (any random string for dev; rotate per-user later)
4. Deploy.

> **Tip**: Vercel functions can't reach `localhost`. Use a free tunnel
> (Cloudflare Tunnel, Tailscale Funnel, ngrok free) to expose your Ollama
> endpoint to the public internet for the deployed app.

## 4. Chrome extension

1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** → select the `extension/` folder.
3. Open the extension's **Options** page:
   - API base URL = `https://your-app.vercel.app`
   - API key      = the `EXTENSION_API_KEY` value from `.env.local`
4. Visit ChatGPT/Claude/Copilot/Gemini — the **✨ Enhance** button appears
   next to the prompt box.

## 5. Sanity checks

```bash
curl http://localhost:3000/api/health
# → { "status": "ok", "service": "prompt-orchestrator" }

curl -X POST http://localhost:3000/api/extension/enhance \
  -H "Authorization: Bearer dev-extension-key" \
  -H "Content-Type: application/json" \
  -d '{"raw_prompt":"write a tweet about coffee","target_model":"chatgpt"}'
```

## Upgrade paths (still mostly free)

- Swap Ollama for **Groq free tier** by replacing `src/lib/llm/ollama.ts`.
- Move from Vercel free to Cloudflare Pages (also free) without code changes.
- Replace Supabase with self-hosted Postgres on Fly.io free tier.
