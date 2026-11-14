import { describe, it, expect } from "vitest";
import { subscribeFrame, streamReplyFrame } from "../src/wecom/protocol.js";

describe("WeCom protocol frames", () => {
  it("builds subscribe frame", () => {
    const f = subscribeFrame("bot1", "sec", "req1");
    expect(f.cmd).toBe("aibot_subscribe");
    expect(f.body.bot_id).toBe("bot1");
  });

  it("builds stream reply", () => {
    const f = streamReplyFrame({ reqId: "r", streamId: "s", content: "hi", finish: true });
    expect(f.cmd).toBe("aibot_respond_msg");
    expect(f.body.stream.finish).toBe(true);
  });
});
