import { generateAiResponse } from "./ai-engine.js";
import { getOrCreateConversation, getHistory, saveMessage } from "./conversation.js";

export async function handleIncomingMessage(opts: {
  channel: "web" | "wecom";
  externalUserId?: string;
  text: string;
}) {
  const conversation = getOrCreateConversation({
    channel: opts.channel,
    externalUserId: opts.externalUserId,
  });

  saveMessage({
    conversationId: conversation.id,
    channel: opts.channel,
    role: "user",
    content: opts.text,
  });

  const history = getHistory(conversation.id);
  const ai = await generateAiResponse(opts.text, history);

  saveMessage({
    conversationId: conversation.id,
    channel: opts.channel,
    role: "assistant",
    content: ai.text,
  });

  return { conversationId: conversation.id, reply: ai.text };
}
