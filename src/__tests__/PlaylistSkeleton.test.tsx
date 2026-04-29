/**
 * PlaylistSkeleton.test.tsx
 */

import { render, screen } from "@testing-library/react";
import PlaylistSkeleton from "@/components/playlist/PlaylistSkeleton";

describe("PlaylistSkeleton", () => {
  it("renders with role status for accessibility", () => {
    render(<PlaylistSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders a screen-reader loading message", () => {
    render(<PlaylistSkeleton />);
    expect(screen.getByText(/loading playlist/i)).toBeInTheDocument();
  });

  it("renders 7 skeleton track rows", () => {
    const { container } = render(<PlaylistSkeleton />);
    const rows = container.querySelectorAll(".pl-skeleton__track-row");
    expect(rows).toHaveLength(7);
  });

  it("renders cover skeleton", () => {
    const { container } = render(<PlaylistSkeleton />);
    expect(container.querySelector(".pl-skeleton__cover")).toBeInTheDocument();
  });

  it("renders action button skeletons", () => {
    const { container } = render(<PlaylistSkeleton />);
    const buttons = container.querySelectorAll(".pl-skeleton__btn");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
