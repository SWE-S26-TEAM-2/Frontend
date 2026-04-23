import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Banner } from "@/components/Banner/Banner";
import type { IUser } from "@/types/userProfile.types";

const baseUser: IUser = {
  id: "user-1",
  username: "testuser",
  location: "Cairo, Egypt",
  role: "listener",
  followers: 0,
  following: 0,
  tracks: 0,
  likes: 0,
  avatarUrl: null,
  headerUrl: null,
  isOwner: true,
};

describe("Banner", () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => "blob:preview");
    URL.revokeObjectURL = jest.fn();
  });

  it("uploads an avatar file through the owner callback", async () => {
    const onUploadAvatar = jest.fn().mockResolvedValue(undefined);
    const onUploadCover = jest.fn().mockResolvedValue(undefined);

    const { container } = render(
      <Banner
        user={baseUser}
        onUploadAvatar={onUploadAvatar}
        onUploadCover={onUploadCover}
      />
    );

    const inputs = container.querySelectorAll('input[type="file"]');
    const avatarInput = inputs[0] as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    fireEvent.change(avatarInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUploadAvatar).toHaveBeenCalledWith(file);
    });
  });

  it("uploads a cover file through the owner callback", async () => {
    const onUploadAvatar = jest.fn().mockResolvedValue(undefined);
    const onUploadCover = jest.fn().mockResolvedValue(undefined);

    const { container } = render(
      <Banner
        user={baseUser}
        onUploadAvatar={onUploadAvatar}
        onUploadCover={onUploadCover}
      />
    );

    const inputs = container.querySelectorAll('input[type="file"]');
    const coverInput = inputs[1] as HTMLInputElement;
    const file = new File(["cover"], "cover.png", { type: "image/png" });

    fireEvent.change(coverInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUploadCover).toHaveBeenCalledWith(file);
    });
  });

  it("does not show upload controls for non-owners", () => {
    render(
      <Banner
        user={{ ...baseUser, isOwner: false }}
        onUploadAvatar={jest.fn()}
        onUploadCover={jest.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /upload header image/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit photo/i })).not.toBeInTheDocument();
  });
});
