// src/services/userProfile.service.ts
// ─────────────────────────────────────────────────────────────

import { ENV } from "@/config/env";
import { mockUserProfileService } from "@/services/mocks/userProfile.mock";
import { realUserProfileService } from "@/services/api/userProfile.api";

export type { IUser, ITrack, ILikedTrack, IFanUser, IFollower, IFollowing, IUserProfileService } from "@/types/userProfile.types";

export const userProfileService = ENV.USE_MOCK_API
  ? mockUserProfileService
  : realUserProfileService;