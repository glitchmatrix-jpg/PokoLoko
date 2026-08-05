import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Renderer boundary caught an error', { error, componentStack: info.componentStack });
  }

  public override render(): ReactNode {
    if (this.state.error) {
      return <main className="fatal"><h1>PokoLoko needs a moment.</h1><p>{this.state.error.message}</p></main>;
    }
    return this.props.children;
  }
}

