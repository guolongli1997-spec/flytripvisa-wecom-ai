import { Router } from "express";
import { getStatus } from "../wecom/connection.js";

export const adminRouter = Router();

adminRouter.get("/health", (req, res) => {
  res.json({ ok: true, wecom: getStatus() });
});
