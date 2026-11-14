import { db } from "../database/db.js";
import type { ChatMessage, Conversation } from "../types.js";
import { randomUUID } from "crypto";

export function getOrCreateConversation(opts: {
  channel: "web" | "wecom";
  externalUserId?: string;
}): Conversation {
  const existing = db
    .prepare(
      `SELECT * FROM conversations WHERE channel=? AND (external_user_id IS ? OR external_user_id=?) LIMIT 1`
    )
    .get(opts.channel, opts.externalUserId ?? null, opts.externalUserId ?? null) as
    | Conversation
    | undefined;

  if (existing) return existing;

  const now = Date.now();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO conversations (id, channel, external_user_id, created_at, updated_at)
     VALUES (?,?,?,?,?)`
  ).run(id, opts.channel, opts.externalUserId ?? null, now, now);

  return {
    id,
    channel: opts.channel,
    externalUserId: opts.externalUserId,
    createdAt: now,
    updatedAt: now,
  };
}

export function saveMessage(msg: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const full: ChatMessage = {
    ...msg,
    id: randomUUID(),
    createdAt: Date.now(),
  };
  db.prepare(
    `INSERT INTO messages (id, conversation_id, channel, role, content, created_at)
     VALUES (?,?,?,?,?,?)`
  ).run(full.id, full.conversationId, full.channel, full.role, full.content, full.createdAt);

  db.prepare(`UPDATE conversations SET updated_at=? WHERE id=?`).run(full.createdAt, full.conversationId);
  return full;
}

export function getHistory(conversationId: string, limit = 10): AiContextMessage[] {
  const rows = db
    .prepare(
      `SELECT role, content FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT ?`
    )
    .all(conversationId, limit) as { role: string; content: string }[];

  return rows.reverse().map((r) => ({ role: r.role as any, content: r.content }));
}
