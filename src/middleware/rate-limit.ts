const hits = new Map<string, number[]>();

export function rateLimit(windowMs = 60000, max = 30) {
  return (req: any, res: any, next: any) => {
    const ip = req.ip ?? "unknown";
    const now = Date.now();
    const arr = hits.get(ip) ?? [];
    const recent = arr.filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);

    if (recent.length > max) {
      return res.status(429).json({ error: "Too many requests" });
    }
    next();
  };
}
