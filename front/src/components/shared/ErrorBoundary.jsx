import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0,
      lastError: null // Track last error for preventing infinite loops
    };
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.func, // Custom fallback UI component
    onError: PropTypes.func, // Error callback for logging/tracking
    onReset: PropTypes.func, // Called when error is reset
    maxRetries: PropTypes.number // Max number of retries before forcing refresh
  };

  static defaultProps = {
    maxRetries: 3
  };

  static getDerivedStateFromError(error) {
    return (prevState) => {
      // Detect infinite error loops by comparing with last error
      const isRepeatedError = prevState.lastError && 
        prevState.lastError.message === error.message;

      return {
        hasError: true,
        error,
        lastError: error,
        // Only increment error count for new errors
        errorCount: isRepeatedError ? prevState.errorCount : prevState.errorCount + 1
      };
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Force refresh after max retries
    if (this.state.errorCount >= this.props.maxRetries) {
      console.warn(`Too many errors encountered (${this.state.errorCount}), forcing page reload`);
      window.location.reload();
    }
  }

  resetError = () => {
    // Clean up error state completely
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0,
      lastError: null
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    // If a custom fallback is provided, use it
    if (hasError && fallback) {
      return fallback({ 
        error, 
        errorInfo, 
        resetError: this.resetError 
      });
    }

    if (hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error?.message || 'The application encountered an unexpected error. Please try refreshing the page.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
          {import.meta.env.MODE === 'development' && (
            <div className="mt-8 w-full max-w-2xl">
              <details className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                <summary className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                  {error && error.toString()}
                  {'\n\n'}
                  {errorInfo?.componentStack || ''}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
