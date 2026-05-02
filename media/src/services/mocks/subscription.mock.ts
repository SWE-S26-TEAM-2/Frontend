import { ISubscriptionData, IUpgradeResponse } from "@/types/subscription.types";

export const SubscriptionMockService = {

  getMySubscription: async (): Promise<ISubscriptionData> => {
    return {
      plan: "Free",
      tracks_uploaded: 1,
      limit: 3,
    };
  },

  upgradeMonthly: async (): Promise<IUpgradeResponse> => {
    return { success: true, message: "Upgraded to Premium monthly (mock)" };
  },

  upgradeYearly: async (): Promise<IUpgradeResponse> => {
    return { success: true, message: "Upgraded to Premium yearly (mock)" };
  },

  upgradeProMonthly: async (): Promise<IUpgradeResponse> => {
    return { success: true, message: "Upgraded to Pro monthly (mock)" };
  },

  upgradeProYearly: async (): Promise<IUpgradeResponse> => {
    return { success: true, message: "Upgraded to Pro yearly (mock)" };
  },
};