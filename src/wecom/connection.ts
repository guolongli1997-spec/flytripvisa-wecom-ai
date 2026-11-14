import WebSocket from "ws";
import { config } from "../config.js";
import { db } from "../database/db.js";
import { subscribeFrame, pongFrame, streamReplyFrame } from "./protocol.js";
import { handleIncomingMessage } from "../services/message-router.js";
import { randomUUID } from "crypto";

type Status =
  | "not_configured"
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "auth_failed"
  | "error";

let ws: WebSocket | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let shouldRun = false;

function setStatus(status: Status, errorDetail?: string) {
  db.prepare(
    `INSERT INTO connection_stats (id, status, error_detail, last_disconnected_at)
     VALUES (1, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status=excluded.status, error_detail=COALESCE(?, error_detail)`
  ).run(status, errorDetail ?? null, Date.now(), errorDetail ?? null);
}

export function getStatus(): Status {
  const row = db.prepare(`SELECT status FROM connection_stats WHERE id=1`).get() as any;
  return row?.status ?? "not_configured";
}

export function startWeCom() {
  if (!config.wecom.botId || !config.wecom.secret) {
    setStatus("not_configured");
    return;
  }
  shouldRun = true;
  connect();
}

export function stopWeCom() {
  shouldRun = false;
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (reconnectTimer) clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
  setStatus("disconnected");
}

function connect() {
  setStatus(ws ? "reconnecting" : "connecting");

  ws = new WebSocket(config.wecom.wsUrl);

  ws.on("open", () => {
    setStatus("connected");
    db.prepare(`UPDATE connection_stats SET last_connected_at=? WHERE id=1`).run(Date.now());

    ws!.send(
      JSON.stringify(
        subscribeFrame(config.wecom.botId, config.wecom.secret, randomUUID())
      )
    );

    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(pongFrame(randomUUID())));
      }
    }, 25000);
  });

  ws.on("message", async (data) => {
    let frame: any;
    try {
      frame = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (frame.cmd === "ping") {
      ws!.send(JSON.stringify(pongFrame(frame?.headers?.req_id ?? randomUUID())));
      return;
    }

    if (frame.cmd === "aibot_msg_callback") {
      const inbound = frame?.body;
      const userId = inbound?.user_id ?? inbound?.from?.user_id ?? "wecom-user";
      const text = inbound?.text ?? inbound?.content ?? "";

      if (!text) return;

      db.prepare(`UPDATE connection_stats SET received_count = received_count + 1, last_message_at=? WHERE id=1`)
        .run(Date.now());

      try {
        const { reply } = await handleIncomingMessage({
          channel: "wecom",
          externalUserId: userId,
          text,
        });

        ws!.send(
          JSON.stringify(
            streamReplyFrame({
              reqId: frame?.headers?.req_id ?? randomUUID(),
              streamId: inbound?.stream_id ?? randomUUID(),
              content: reply,
              finish: true,
            })
          )
        );

        db.prepare(`UPDATE connection_stats SET sent_count = sent_count + 1 WHERE id=1`).run();
      } catch (err: any) {
        ws!.send(
          JSON.stringify(
            streamReplyFrame({
              reqId: frame?.headers?.req_id ?? randomUUID(),
              streamId: inbound?.stream_id ?? randomUUID(),
              content: "Sorry, AI service unavailable.",
              finish: true,
            })
          )
        );
        setStatus("error", err?.message);
      }
    }
  });

  ws.on("error", (err) => {
    setStatus("error", err.message);
  });

  ws.on("close", () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    setStatus("disconnected");

    if (shouldRun) {
      reconnectTimer = setTimeout(connect, 5000);
    }
  });
}
