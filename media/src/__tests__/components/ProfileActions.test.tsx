import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileActions } from "@/components/Profile/ProfileActions";
import type { IUser } from "@/types/userProfile.types";

const mockPush = jest.fn();
const mockUpdateProfile = jest.fn();
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
  AuthService: {
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  },
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
  followers: 0,
  following: 0,
  tracks: 0,
  likes: 0,
  avatarUrl: null,
  headerUrl: null,
  isOwner: true,
};

describe("ProfileActions", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUpdateProfile.mockReset();
    mockFollowUser.mockReset();
    mockUnfollowUser.mockReset();
  });

  it("saves profile edits through AuthService.updateProfile", async () => {
    mockUpdateProfile.mockResolvedValue({
      success: true,
      user: {
        id: "user-1",
        username: "updated-name",
        email: "test@example.com",
        profileImageUrl: "",
        createdAt: new Date().toISOString(),
      },
    });

    render(<ProfileActions user={ownerUser} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const textboxes = screen.getAllByRole("textbox");

    fireEvent.change(textboxes[0], {
      target: { value: "updated-name" },
    });
    fireEvent.change(textboxes[1], {
      target: { value: "New bio" },
    });
    fireEvent.change(textboxes[2], {
      target: { value: "Alexandria, Egypt" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        displayName: "updated-name",
        bio: "New bio",
        location: "Alexandria, Egypt",
      });
    });

    await waitFor(() => {
      expect(screen.queryByText(/edit profile/i)).not.toBeInTheDocument();
    });
  });

  it("keeps the edit modal text-only with no image upload controls", () => {
    const { container } = render(<ProfileActions user={ownerUser} />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const textboxes = screen.getAllByRole("textbox");

    expect(textboxes).toHaveLength(3);
    expect(screen.getByText(/display name/i)).toBeInTheDocument();
    expect(screen.getByText(/^bio$/i)).toBeInTheDocument();
    expect(screen.getByText(/location/i)).toBeInTheDocument();
    expect(screen.queryByText(/upload image/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/update image/i)).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});
