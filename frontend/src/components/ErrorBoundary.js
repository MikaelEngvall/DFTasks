import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Uppdatera state så nästa render visar fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Du kan också logga felet till en felrapporteringsservice
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Du kan rendera vilken fallback UI du vill
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
