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

  it("keeps a configured localhost API URL when the browser is also on localhost (local dev, different port)", () => {
    expect(
      resolveBaseUrl("http://localhost:3001/api", {
        origin: "http://localhost:5173",
        hostname: "localhost",
      }),
    ).toBe("http://localhost:3001/api");
  });

  it("falls back to same-origin /api when a localhost API URL is loaded from a non-localhost host (e.g. LAN access)", () => {
    expect(
      resolveBaseUrl("http://localhost:3001/api", {
        origin: "http://192.168.1.50:5173",
        hostname: "192.168.1.50",
      }),
    ).toBe("http://192.168.1.50:5173/api");
  });
});
