import { Router } from "express";
import { db } from "../database/db.js";
import { startWeCom, stopWeCom, getStatus } from "../wecom/connection.js";
import { requireAdmin } from "../middleware/auth.js";
import crypto from "crypto";

export const wecomRouter = Router();

function maskSecret(s: string) {
  if (!s) return "";
  return s.slice(0, 3) + "****" + s.slice(-3);
}

wecomRouter.get("/wecom/status", (req, res) => {
  const stats = db.prepare(`SELECT * FROM connection_stats WHERE id=1`).get() as any;
  const cfg = db.prepare(`SELECT bot_name, bot_id, ws_url, enabled FROM wecom_config WHERE id=1`).get() as any;

  res.json({
    status: getStatus(),
    config: cfg
      ? { botName: cfg.bot_name, botId: cfg.bot_id, wsUrl: cfg.ws_url, enabled: !!cfg.enabled }
      : null,
    stats: stats ?? {},
  });
});

wecomRouter.post("/wecom/configure", requireAdmin, (req, res) => {
  const { botName, botId, secret, wsUrl, enabled } = req.body ?? {};

  db.prepare(
    `INSERT INTO wecom_config (id, bot_name, bot_id, secret_encrypted, ws_url, enabled, updated_at)
     VALUES (1,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       bot_name=excluded.bot_name,
       bot_id=excluded.bot_id,
       secret_encrypted=excluded.secret_encrypted,
       ws_url=excluded.ws_url,
       enabled=excluded.enabled,
       updated_at=excluded.updated_at`
  ).run(
    botName ?? "FlyTripVisa Bot",
    botId,
    secret ? crypto.createCipheriv("aes-256-gcm", Buffer.alloc(32), "iv").update(secret).toString("hex") : "",
    wsUrl ?? "wss://openws.work.weixin.qq.com",
    enabled ? 1 : 0,
    Date.now()
  );

  res.json({ ok: true, secretMasked: maskSecret(secret ?? "") });
});

wecomRouter.post("/wecom/connect", requireAdmin, (req, res) => {
  startWeCom();
  res.json({ ok: true, status: getStatus() });
});

wecomRouter.post("/wecom/disconnect", requireAdmin, (req, res) => {
  stopWeCom();
  res.json({ ok: true, status: getStatus() });
});

wecomRouter.post("/wecom/test", requireAdmin, (req, res) => {
  res.json({ ok: true, note: "Use real WeCom client message to verify round-trip." });
});

wecomRouter.get("/wecom/logs", requireAdmin, (req, res) => {
  const stats = db.prepare(`SELECT * FROM connection_stats WHERE id=1`).get();
  res.json(stats);
});
