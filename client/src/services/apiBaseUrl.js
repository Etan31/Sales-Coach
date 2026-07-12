export function resolveBaseUrl(
  configuredBaseUrl,
  location = typeof window !== "undefined" ? window.location : undefined,
) {
  const trimmed = configuredBaseUrl?.trim();

  if (trimmed) {
    const isLocalhost =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(trimmed);
    if (isLocalhost) {
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
