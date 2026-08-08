import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary capturou um erro de execução:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-white">Ops! Algo inesperado aconteceu.</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Ocorreu uma oscilação temporária de inicialização. Clique abaixo para recarregar a aplicação com segurança.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar Aplicação</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
