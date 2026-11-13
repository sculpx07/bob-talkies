import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <AlertTriangle size={48} className="text-warning mx-auto mb-4" aria-hidden="true" />
            <h1 className="font-display text-2xl text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-2">
              We ran into an unexpected error. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-bg-elevated border border-border-subtle rounded-lg p-3 mb-4 overflow-auto max-h-40 text-red-400 whitespace-pre-wrap">
                {this.state.error.message}{'\n'}{this.state.error.stack?.split('\n').slice(0,4).join('\n')}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-gold px-6 py-3 rounded-xl font-semibold"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
