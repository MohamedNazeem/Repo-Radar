import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./types.js";

describe("getErrorMessage", () => {
  it("prefers a string, then Error.message, then the fallback", () => {
    expect(getErrorMessage("boom", "fallback")).toBe("boom");
    expect(getErrorMessage(new Error("nope"), "fallback")).toBe("nope");
    expect(getErrorMessage({ status: 500 }, "fallback")).toBe("fallback");
  });
});
