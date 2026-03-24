import { Component, ErrorInfo, ReactNode } from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateFooter,
  EmptyStateStatus,
  Button,
  PageSection,
} from '@patternfly/react-core';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Kueue plugin error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <PageSection>
          <EmptyState
            headingLevel="h2"
            titleText={this.props.fallbackTitle ?? 'Something went wrong'}
            status={EmptyStateStatus.warning}
          >
            <EmptyStateBody>
              {this.state.error?.message || 'An unexpected error occurred in the Kueue plugin.'}
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={this.handleRetry}>
                  Retry
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </PageSection>
      );
    }

    return this.props.children;
  }
}
