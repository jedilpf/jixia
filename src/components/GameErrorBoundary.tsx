import React, { Component, ReactNode } from 'react';

interface GameErrorBoundaryProps {
  screenName: string;
  onBackToMenu?: () => void;
  onRetry?: () => void;
  children: ReactNode;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class GameErrorBoundary extends Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  state: GameErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: unknown): GameErrorBoundaryState {
    const message = error instanceof Error ? error.message : '未知异常';
    return {
      hasError: true,
      message,
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error(`[GameErrorBoundary:${this.props.screenName}]`, error, info.componentStack);
  }

  componentDidUpdate(prevProps: GameErrorBoundaryProps): void {
    if (prevProps.screenName !== this.props.screenName && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[#120f0d] p-6 text-[#f1dfbb]">
        <div className="w-full max-w-xl rounded-2xl border border-[#8f5f4a] bg-[#221814]/95 p-6 text-center">
          <h2 className="text-2xl tracking-[0.12em] text-[#ffd8a8]">对局界面异常</h2>
          <p className="mt-3 text-sm text-[#e2c3a0]">
            系统已拦截一次运行时异常，避免直接闪退。你可以重试当前界面或返回主菜单。
          </p>
          <div className="mt-4 rounded-lg border border-[#714739] bg-[#2a1c16] px-3 py-2 text-left text-xs text-[#f3c2aa]">
            错误信息: {this.state.message || '未知错误'}
          </div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-md border border-[#8f7752] bg-[#312719] px-4 py-2 text-sm text-[#ffd68d] transition hover:bg-[#453521]"
            >
              重试当前界面
            </button>
            <button
              type="button"
              onClick={this.props.onBackToMenu}
              className="rounded-md border border-[#7e4d4d] bg-[#3b1d1f] px-4 py-2 text-sm text-[#ffc0c0] transition hover:bg-[#5a2a2e]"
            >
              返回主菜单
            </button>
          </div>
        </div>
      </div>
    );
  }
}
