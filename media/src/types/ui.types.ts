import type { RefObject, ReactNode } from "react";
import type { IUser, ILikedTrack, IFanUser, IFollower, IFollowing } from "@/types/userProfile.types";

export interface ILoginModalProps {
  onClose: () => void;
}

export interface IBannerProps {
  user: IUser;
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


  export interface IVerifyEmailStepProps {
    email: string;
    onBack: () => void;
  }