import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  wecom: {
    botId: process.env.WECOM_BOT_ID ?? "",
    secret: process.env.WECOM_BOT_SECRET ?? "",
    wsUrl: process.env.WECOM_WS_URL ?? "wss://openws.work.weixin.qq.com",
  },

  ai: {
    provider: process.env.AI_PROVIDER ?? "cloudflare",
    gatewayUrl: process.env.AI_GATEWAY_URL ?? "",
    model: process.env.AI_MODEL ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  },

  admin: {
    username: process.env.ADMIN_USERNAME ?? "admin",
    passwordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  },

  db: {
    url: process.env.DATABASE_URL ?? "./data/flytripvisa.db",
  },
};
