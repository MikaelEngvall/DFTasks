import React from 'react';
import PropTypes from 'prop-types';
import { Card } from './Card';
import { Button } from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Logga felet till en tjänst
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    // Här kan vi implementera loggning till t.ex. Sentry
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card
            title="Något gick fel"
            footer={
              <div className="flex justify-end">
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                >
                  Ladda om sidan
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Ett oväntat fel har inträffat. Vi har loggat felet och kommer att undersöka det.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                  <p className="text-red-600 dark:text-red-400 font-mono text-sm">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  <pre className="mt-2 text-sm text-gray-500 dark:text-gray-400 overflow-auto">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary; 