import styles from "./ErrorPage.module.css";

// Single status -> copy map backing every supported error page.
const STATUS_COPY = {
  400: {
    title: "Bad request",
    message:
      "That request was malformed. Please check your input and try again.",
  },
  401: {
    title: "Sign in required",
    message: "Your session has expired or you are not signed in.",
  },
  403: {
    title: "Access denied",
    message: "You do not have permission to view this page.",
  },
  404: {
    title: "Page not found",
    message: "The page you're looking for doesn't exist.",
  },
  500: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again later.",
  },
  502: {
    title: "Bad gateway",
    message: "The upstream service is unavailable right now.",
  },
  503: {
    title: "Service unavailable",
    message: "The service is temporarily down for maintenance.",
  },
  504: {
    title: "Gateway timeout",
    message: "The request took too long to respond. Please try again.",
  },
};

/** Renders any of 400/401/403/404/500/502/503/504 from one status->copy map, plus a link home. */
function ErrorPage({ code, title, message }) {
  const copy = STATUS_COPY[code] || STATUS_COPY[500];

  return (
    <div className={styles.wrapper}>
      <p className={styles.code}>{code}</p>
      <h1 className={styles.title}>{title || copy.title}</h1>
      <p className={styles.message}>{message || copy.message}</p>
      {/* Plain anchor (not react-router Link): this can render outside Router context,
          e.g. from the root ErrorBoundary if the router itself throws. */}
      <a href="/" className={styles.link}>
        Go home
      </a>
    </div>
  );
}

export default ErrorPage;

/** Convenience wrapper for the catch-all route. */
export function NotFound() {
  return <ErrorPage code={404} />;
}

/** Convenience wrapper for inline auth failures (401/403). */
export function AuthError({ code = 401, title, message }) {
  return <ErrorPage code={code} title={title} message={message} />;
}

/** Convenience wrapper for server-side failures (500/502/503/504). */
export function ServerError({ code = 500, title, message }) {
  return <ErrorPage code={code} title={title} message={message} />;
}
