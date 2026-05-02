import { apiGet, apiPost } from "./apiClient";
import { getApiBaseUrl } from "@/config/env";
import { ISubscriptionData, IUpgradeRequest, IUpgradeResponse } from "@/types/subscription.types";

export const SubscriptionService = {

  getMySubscription: async (): Promise<ISubscriptionData> => {
    return apiGet<ISubscriptionData>(`${getApiBaseUrl()}/subscriptions/me`);
  },

  upgradeMonthly: async (data: IUpgradeRequest): Promise<IUpgradeResponse> => {
    return apiPost<IUpgradeResponse>(`${getApiBaseUrl()}/subscriptions/upgrade/monthly`, data);
  },

  upgradeYearly: async (data: IUpgradeRequest): Promise<IUpgradeResponse> => {
    return apiPost<IUpgradeResponse>(`${getApiBaseUrl()}/subscriptions/upgrade/yearly`, data);
  },

  upgradeProMonthly: async (data: IUpgradeRequest): Promise<IUpgradeResponse> => {
    return apiPost<IUpgradeResponse>(`${getApiBaseUrl()}/subscriptions/upgrade/pro/monthly`, data);
  },

  upgradeProYearly: async (data: IUpgradeRequest): Promise<IUpgradeResponse> => {
    return apiPost<IUpgradeResponse>(`${getApiBaseUrl()}/subscriptions/upgrade/pro/yearly`, data);
  },
};