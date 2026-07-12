import { resolveBaseUrl } from "./apiBaseUrl.js";

describe("resolveBaseUrl", () => {
  it("falls back to the current origin when no API base URL is configured", () => {
    expect(resolveBaseUrl("")).toMatch(/\/api$/);
  });

  it("keeps an explicitly configured API base URL intact", () => {
    expect(resolveBaseUrl("https://example.com/api")).toBe(
      "https://example.com/api",
    );
  });
});
