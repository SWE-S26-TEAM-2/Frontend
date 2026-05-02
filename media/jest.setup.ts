import "@testing-library/jest-dom";

import type { ReactNode } from "react";

global.fetch = jest.fn(() => Promise.reject(new Error("fetch not available in tests"))) as jest.Mock;

jest.mock("@react-oauth/google", () => ({
	useGoogleLogin: () => jest.fn(),
	GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
}));