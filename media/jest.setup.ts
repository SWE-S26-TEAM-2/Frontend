import "@testing-library/jest-dom";

import type { ReactNode } from "react";

jest.mock("@react-oauth/google", () => ({
	useGoogleLogin: () => jest.fn(),
	GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
}));