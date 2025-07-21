'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          
          <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
          
          <p className="mb-6 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          
          {this.state.error && process.env.NODE_ENV === 'development' && (
            <details className="mb-6 max-w-2xl rounded-lg bg-muted/50 p-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error details (development only)
              </summary>
              <pre className="mt-2 overflow-auto text-xs">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh page
            </Button>
            
            <Button
              onClick={this.handleReset}
              variant="default"
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}