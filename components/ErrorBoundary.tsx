import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً، حدث خطأ ما</h1>
            <p className="text-gray-700 mb-4">
              نعتذر عن هذا الخلل. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.
            </p>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64 text-left dir-ltr">
              <pre className="text-sm text-red-800 whitespace-pre-wrap">
                {this.state.error?.message}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
