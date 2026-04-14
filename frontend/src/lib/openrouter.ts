const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function* streamModelResponse(
  modelId: string,
  systemPrompt: string,
  userContent: string,
  maxTokens: number = 2000,
): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://modelcouncil.ai",
      "X-Title": "Model Council",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: true,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenRouter ${response.status}: ${errorText || response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          const chunk = JSON.parse(data);
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) yield text;
        } catch {
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
