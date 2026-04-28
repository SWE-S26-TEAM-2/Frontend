/* eslint-disable @next/next/no-img-element */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UserSearchCard from "@/components/Search/UserSearchCard";
import type { ISearchUser } from "@/types/userProfile.types";

const mockFollowUser = jest.fn();
const mockUnfollowUser = jest.fn();

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const rest = { ...props };
    delete rest.unoptimized;
    return <img alt="" {...rest} />;
  },
}));

jest.mock("@/services/di", () => ({
  userProfileService: {
    followUser: (...args: unknown[]) => mockFollowUser(...args),
    unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
  },
}));

const searchUser: ISearchUser = {
  id: "user-1",
  username: "searchuser",
  displayName: "Search User",
  role: "artist",
  avatarUrl: null,
  followerCount: 12,
  isVerified: false,
};

describe("UserSearchCard", () => {
  beforeEach(() => {
    mockFollowUser.mockReset();
    mockUnfollowUser.mockReset();
  });

  it("follows by username and switches to Following", async () => {
    mockFollowUser.mockResolvedValueOnce(undefined);

    render(<UserSearchCard user={searchUser} />);

    fireEvent.click(screen.getByRole("button", { name: /follow/i }));

    expect(screen.getByRole("button", { name: /following/i })).toBeInTheDocument();
    await waitFor(() => expect(mockFollowUser).toHaveBeenCalledWith("searchuser"));
  });
});
