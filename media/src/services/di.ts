import { ENV } from '../config/env';
import { RealAuthService } from './api/auth.api';
import { MockAuthService } from './mocks/auth.mock';

// If the toggle is true, inject the Mocks. Otherwise, inject the Real API.
export const AuthService = ENV.USE_MOCK_API ? MockAuthService : RealAuthService;

// You will add your other services here later (TrackService, PlaylistService, etc.)