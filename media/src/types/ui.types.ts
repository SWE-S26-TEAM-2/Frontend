import type { RefObject, ReactNode } from "react";
import type { IUser, ILikedTrack, IFanUser, IFollower, IFollowing, IEditProfilePayload } from "@/types/userProfile.types";

export interface ILoginModalProps {
  onClose: () => void;
}

export interface IBannerProps {
  user: IUser;
  onUploadAvatar?: (file: File) => Promise<void>;
  onUploadCover?: (file: File) => Promise<void>;
  onAvatarChange?: (url: string, file?: File) => void;
  onHeaderChange?: (url: string, file?: File) => void;
}

export interface IToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface IShareModalProps {
  username: string;
  onClose: () => void;
  mode?: "modal" | "popover";
  anchorRef?: RefObject<HTMLElement | null>;
}

export interface IProfileStatsProps {
  user: IUser;
}

export interface IProfileActionsProps {
  user: IUser;
  onEditOpen?: () => void;
}

export interface IProfileSidebarProps {
  user: IUser;
  likes: ILikedTrack[];
  fans: IFanUser[];
  followers: IFollower[];
  following: IFollowing[];
}

export interface IIconBtnProps {
  icon: ReactNode;
  label?: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export interface IMenuItem {
  icon: ReactNode;
  label: string;
  href: string;
  orange?: boolean;
  dividerBefore?: boolean;
  onClick?: () => void;
  noNav?: boolean;
}

export interface ITrackPageProps {
  params: Promise<{ id: string }>;
}

export type IActiveTab =
  | "All"
  | "Popular tracks"
  | "Tracks"
  | "Albums"
  | "Playlists"
  | "Reposts";

export interface IEditProfileModalProps {
  user: IUser;
  onClose: () => void;
  onSave: (payload: IEditProfilePayload) => Promise<void>;
}

export interface IVerifyEmailStepProps {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}