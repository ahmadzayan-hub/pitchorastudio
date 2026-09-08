import { describe, it, expect } from "vitest";
import { extractTemplate } from "../pptx/template-intelligence";

describe("pptx/template-intelligence", () => {
  it("returns an empty token set for non-zip input", async () => {
    const buf = Buffer.from("not a zip");
    const tokens = await extractTemplate(buf);
    expect(tokens.layouts).toEqual([]);
    expect(tokens.palette.accent).toEqual([]);
  });
});
