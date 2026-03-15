import { ENV } from '../config/env';
import { RealAuthService } from './api/auth.api';
import { MockAuthService } from './mocks/auth.mock';
import { trackService as realTrackService } from './api/trackService';
import { trackService as mockTrackService } from './mocks/trackService';

// If the toggle is true, inject the Mocks. Otherwise, inject the Real API.
export const AuthService = ENV.USE_MOCK_API ? MockAuthService : RealAuthService;
export const trackService = ENV.USE_MOCK_API ? mockTrackService : realTrackService;

// You will add your other services here later (PlaylistService, etc.)