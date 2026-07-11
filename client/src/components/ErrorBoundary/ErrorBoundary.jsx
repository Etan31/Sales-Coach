import { Component } from 'react';
import { ServerError } from '../ErrorPage/ErrorPage.jsx';

/** Root error boundary: catches render errors anywhere below it and renders a 500 page. */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface unexpected render errors for debugging; no logging service is wired up yet.
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ServerError code={500} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
