const TAVILY_API_URL = "https://api.tavily.com/search";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export async function searchForContext(topic: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return "";
  }

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: topic,
        max_results: 6,
        include_answer: true,
        search_depth: "basic",
      }),
    });

    if (!response.ok) {
      console.error(`Tavily search failed: ${response.status}`);
      return "";
    }

    const data = (await response.json()) as TavilyResponse & { answer?: string };
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const lines: string[] = [`CONTEXT BRIEFING (web search as of ${dateStr}):`];

    if (data.answer) {
      lines.push(`\nSummary: ${data.answer}`);
    }

    if (data.results?.length > 0) {
      lines.push("\nSources:");
      for (const result of data.results) {
        const snippet = result.content.length > 200
          ? result.content.slice(0, 200) + "..."
          : result.content;
        lines.push(`- ${result.title}: ${snippet}`);
      }
    }

    return lines.join("\n");
  } catch (error) {
    console.error("Web search error:", error);
    return "";
  }
}
