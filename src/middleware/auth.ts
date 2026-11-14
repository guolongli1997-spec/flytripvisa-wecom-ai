import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.set("WWW-Authenticate", "Basic realm=admin");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [user, pass] = Buffer.from(auth.slice(6), "base64").toString().split(":");
  if (user !== process.env.ADMIN_USERNAME || !pass) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // In production: compare hashed password
  next();
}
