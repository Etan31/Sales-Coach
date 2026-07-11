/** Maps a failed page-level fetch (ApiError) to the ErrorPage status code to render. */
export function toErrorPageCode(error) {
  const status = error?.status;
  return status && status >= 400 ? status : 500;
}

/** True when the given ApiError status should render the inline auth page (401/403). */
export function isAuthErrorCode(code) {
  return code === 401 || code === 403;
}
