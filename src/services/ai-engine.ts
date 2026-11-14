import { config } from "../config.js";
import type { AiResult } from "../types.js";

export interface AiContextMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateAiResponse(
  userMessage: string,
  context: AiContextMessage[] = []
): Promise<AiResult> {
  const { provider, gatewayUrl, model } = config.ai;

  if (provider === "cloudflare" && gatewayUrl) {
    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are FlyTripVisa AI assistant." },
          ...context,
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI provider error: ${res.status}`);
    }

    const data = await res.json();
    const text =
      data?.response ??
      data?.result ??
      data?.choices?.[0]?.message?.content ??
      "";

    if (!text) throw new Error("Empty AI response");

    return { text, provider };
  }

  throw new Error("AI provider not configured. Set AI_GATEWAY_URL.");
}
