"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import styles from "./PlaylistHeader.module.css";

interface IPlaylistErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
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
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): IPlaylistErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message ?? "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[PlaylistErrorBoundary]", error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className={styles.playlistErrorBoundary} role="alert">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className={styles.playlistErrorBoundary__icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>

          <h2 className={styles.playlistErrorBoundary__title}>
            Something went wrong
          </h2>

          <p className={styles.playlistErrorBoundary__message}>
            {this.state.errorMessage}
          </p>

          <button
            className={`${styles.playlistHeader__btn} ${styles["playlistHeader__btn--primary"]}`}
            onClick={this.handleReset}
            aria-label="Retry loading the playlist"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
