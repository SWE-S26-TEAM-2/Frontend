/**
 * Messaging service barrel — REAL API ONLY.
 *
 * All hooks and pages import `messagingService` from here.
 * Always uses the real FastAPI backend.
 *
 * AVAILABLE_USERS is empty — the New Message modal searches real
 * users via the /search/users endpoint instead.
 */

import type { IMessagingService, IConversationParticipant } from "@/types/messaging.types";
import { realMessagingService } from "@/services/api/messaging.api";

export const messagingService: IMessagingService = realMessagingService;

/**
 * Always empty in real mode — the New Message modal uses the
 * /search/users endpoint to find users.
 */
export const AVAILABLE_USERS: IConversationParticipant[] = [];
