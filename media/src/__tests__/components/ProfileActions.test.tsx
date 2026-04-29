import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileActions } from "@/components/Profile/ProfileActions";
import type { IUser } from "@/types/userProfile.types";

const mockPush = jest.fn();
const mockFollowUser = jest.fn();
const mockUnfollowUser = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/Share/Share", () => ({
  ShareModal: ({ username, onClose }: { username: string; onClose: () => void }) => (
    <div>
      <span>Share modal for {username}</span>
      <button onClick={onClose}>Close share</button>
    </div>
  ),
}));

jest.mock("@/services/di", () => ({
  userProfileService: {
    followUser: (...args: unknown[]) => mockFollowUser(...args),
    unfollowUser: (...args: unknown[]) => mockUnfollowUser(...args),
  },
}));

const ownerUser: IUser = {
  id: "user-1",
  username: "testuser",
  location: "Cairo, Egypt",
  bio: "Original bio",
  role: "listener",
  isPrivate: false,        
  followers: 0,
  following: 0,
  tracks: 0,
  likes: 0,
  avatarUrl: null,
  headerUrl: null,
  isOwner: true,
};

const publicUser: IUser = {
  ...ownerUser,
  id: "user-2",
  username: "publicuser",
  isOwner: false,
};

describe("ProfileActions", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockFollowUser.mockReset();
    mockUnfollowUser.mockReset();
  });

  //TEST 1: Edit button triggers callback
  it("calls onEditOpen when Edit button is clicked", () => {
    const mockOnEditOpen = jest.fn();

    render(<ProfileActions user={ownerUser} onEditOpen={mockOnEditOpen} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(mockOnEditOpen).toHaveBeenCalledTimes(1);
  });

  //TEST 2: Share modal opens correctly
  it("opens and closes the share modal", () => {
    render(<ProfileActions user={ownerUser} />);

    fireEvent.click(screen.getByRole("button", { name: /share/i }));

    expect(screen.getByText(/share modal for testuser/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/close share/i));

    expect(screen.queryByText(/share modal/i)).not.toBeInTheDocument();
  });

  it("follows public profile by username and switches to Following", async () => {
    mockFollowUser.mockResolvedValueOnce(undefined);

    render(<ProfileActions user={publicUser} />);

    fireEvent.click(screen.getByRole("button", { name: /follow/i }));

    expect(screen.getByRole("button", { name: /following/i })).toBeInTheDocument();
    await waitFor(() => expect(mockFollowUser).toHaveBeenCalledWith("publicuser"));
  });
});
