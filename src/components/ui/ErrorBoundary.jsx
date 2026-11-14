import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Mars Pathfinder Runtime Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div className="error-fallback__card">
            <div className="error-fallback__header">
              <AlertTriangle size={36} className="error-fallback__icon" />
              <h2>Telemetry Stream Interrupted</h2>
            </div>
            <p className="error-fallback__message">
              The Mars exploration console encountered an unexpected runtime error while rendering this subsystem.
            </p>
            {this.state.error && (
              <pre className="error-fallback__details">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="error-fallback__actions">
              <button className="error-fallback__btn" onClick={this.handleReset}>
                <RotateCcw size={16} /> Reinitialize Console
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
