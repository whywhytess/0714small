import { describe, expect, it } from "vitest";
import vectors from "../vectors/slug.json" with { type: "json" };
import { isValidSlugSyntax } from "./slug.ts";

describe("isValidSlugSyntax（共享向量）", () => {
  it.each(vectors.cases)("$input → $valid", ({ input, valid }) => {
    expect(isValidSlugSyntax(input)).toBe(valid);
  });
});
