export interface IBlockedUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

export interface IPrivacySettings {
  receiveMessages: boolean;
  showActivities: boolean;
  showTopFan: boolean;
  showTrackFans: boolean;
  blockedUsers: string[];
}