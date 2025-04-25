import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LocationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Location Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'Failed to get location information'}
            </AlertDescription>
            {this.props.onRetry && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={this.props.onRetry}
              >
                Try Again
              </Button>
            )}
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}