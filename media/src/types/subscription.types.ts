export interface ISubscriptionData {
    plan: "Free" | "Premium";
    tracks_uploaded: number;
    limit: number | null; // null means unlimited (Premium)
  }
  
  export interface ISubscriptionResponse {
    success: boolean;
    data: ISubscriptionData;
  }
  
  export interface IUpgradeRequest {
    payment_token: string;
    plan: string;
  }
  
  export interface IUpgradeResponse {
    success: boolean;
    message: string;
  }