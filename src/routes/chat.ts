import { Router } from "express";
import { handleIncomingMessage } from "../services/message-router.js";
import { rateLimit } from "../middleware/rate-limit.js";

export const chatRouter = Router();

chatRouter.post("/chat", rateLimit(), async (req, res) => {
  const text = (req.body?.message ?? "").toString().trim();
  if (!text) return res.status(400).json({ error: "Empty message" });

  try {
    const result = await handleIncomingMessage({ channel: "web", text });
    res.json({ ok: true, ...result });
  } catch (e: any) {
    res.status(502).json({ error: e.message });
  }
});
