"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface IPlaylistErrorBoundaryProps {
  children: ReactNode;
}

interface IPlaylistErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class PlaylistErrorBoundary extends Component<
  IPlaylistErrorBoundaryProps,
  IPlaylistErrorBoundaryState
> {
  constructor(props: IPlaylistErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): IPlaylistErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "Something went wrong while rendering the playlist.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[PlaylistErrorBoundary]", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      errorMessage: "",
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5 text-orange-400">
            <svg
              aria-hidden="true"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="max-w-xl text-sm text-white/70">{this.state.errorMessage}</p>
          </div>
          <button
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            onClick={this.handleReset}
            type="button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
