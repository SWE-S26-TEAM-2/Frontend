import { apiGet, apiPost } from "./apiClient";
import { getApiBaseUrl } from "@/config/env";
import { ISubscriptionData, IUpgradeRequest, IUpgradeResponse } from "@/types/subscription.types";

export const SubscriptionService = {

  getMySubscription: async (): Promise<ISubscriptionData> => {
    return apiGet<ISubscriptionData>(`${getApiBaseUrl()}/subscriptions/me`);
  },

  upgrade: async (data: IUpgradeRequest): Promise<IUpgradeResponse> => {
    return apiPost<IUpgradeResponse>(`${getApiBaseUrl()}/subscriptions/upgrade`, data);
  },
};