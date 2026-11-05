import { describe, expect, test } from "bun:test";
import { cn } from "./utils";

describe("cn", () => {
  test("a later class wins over a conflicting earlier one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  test("drops falsy values", () => {
    expect(cn("flex", false, undefined, "gap-2")).toBe("flex gap-2");
  });
});
