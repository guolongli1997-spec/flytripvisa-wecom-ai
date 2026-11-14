export type Channel = "web" | "wecom";

export interface ChatMessage {
  id: string;
  conversationId: string;
  channel: Channel;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  channel: Channel;
  externalUserId?: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WeComInboundEvent {
  cmd: string;
  headers?: { req_id?: string };
  body?: any;
}

export interface AiResult {
  text: string;
  provider: string;
}
