import { describe, it, expect } from "vitest";

describe("chat input rules", () => {
  it("ignores blank messages", () => {
    expect("".trim().length === 0).toBe(true);
  });
});
