type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

export class AnthropicConfigError extends Error {}

/**
 * Calls the Anthropic Messages API from the server.
 * Throws AnthropicConfigError if ANTHROPIC_API_KEY is not set, so API
 * routes can return a clear, friendly error instead of a generic 500.
 */
export async function callAnthropic(
  systemPrompt: string,
  messages: AnthropicMessage[],
  maxTokens = 1200
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AnthropicConfigError(
      "ANTHROPIC_API_KEY is not set. Add it in your Vercel project's Environment Variables."
    );
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlocks = (data.content || [])
    .filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text);

  return textBlocks.join("\n").trim();
}
