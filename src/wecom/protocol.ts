export interface WeComFrame {
  cmd: string;
  headers?: { req_id?: string };
  body?: any;
}

export function subscribeFrame(botId: string, secret: string, reqId: string): WeComFrame {
  return {
    cmd: "aibot_subscribe",
    headers: { req_id: reqId },
    body: {
      bot_id: botId,
      secret,
    },
  };
}

export function pongFrame(reqId: string) {
  return {
    cmd: "pong",
    headers: { req_id: reqId },
  };
}

export function streamReplyFrame(opts: {
  reqId: string;
  streamId: string;
  content: string;
  finish: boolean;
}) {
  return {
    cmd: "aibot_respond_msg",
    headers: { req_id: opts.reqId },
    body: {
      msgtype: "stream",
      stream: {
        id: opts.streamId,
        content: opts.content,
        finish: opts.finish,
      },
    },
  };
}
