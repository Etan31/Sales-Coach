const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;
const LOCALHOST_HOST_RE = /^(localhost|127\.0\.0\.1)$/i;

export function resolveBaseUrl(
  configuredBaseUrl,
  location = typeof window !== "undefined" ? window.location : undefined,
) {
  const trimmed = configuredBaseUrl?.trim();

  if (trimmed) {
    const isConfiguredLocalhost = LOCALHOST_RE.test(trimmed);
    const isBrowserLocalhost =
      !location?.hostname || LOCALHOST_HOST_RE.test(location.hostname);

    // A "localhost" API URL is only trustworthy when the page itself is being
    // served from localhost too (normal local dev, where the API commonly runs
    // on a different port than the client). If the page is loaded from a LAN IP
    // or a real domain instead, "localhost" in the configured URL would resolve
    // to the visitor's own machine, so fall back to same-origin /api there.
    if (isConfiguredLocalhost && !isBrowserLocalhost) {
      return location?.origin
        ? `${location.origin.replace(/\/+$/, "")}/api`
        : "/api";
    }

    return trimmed.replace(/\/+$/, "");
  }

  return location?.origin
    ? `${location.origin.replace(/\/+$/, "")}/api`
    : "/api";
}
