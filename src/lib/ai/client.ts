// AI provider abstraction — swap between Anthropic Claude and OpenAI

const PROVIDER = process.env.AI_PROVIDER ?? "anthropic"; // "anthropic" | "openai"

export interface ChatMessage { role: "system"|"user"|"assistant"; content: string; }

export async function aiChat(messages: ChatMessage[], options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
  const { maxTokens = 4096, temperature = 0.3 } = options;

  if (PROVIDER === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "claude-sonnet-4-6",
        max_tokens: maxTokens,
        temperature,
        system: messages.find(m => m.role === "system")?.content,
        messages: messages.filter(m => m.role !== "system"),
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = await res.json();
    return data.content[0]?.text ?? "";
  }

  // OpenAI fallback
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function getEmbedding(text: string): Promise<number[]> {
  if (PROVIDER === "anthropic") {
    // Use OpenAI embeddings even when using Anthropic for chat
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY required for embeddings");
  }
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = await res.json();
  return data.data[0]?.embedding ?? [];
}
