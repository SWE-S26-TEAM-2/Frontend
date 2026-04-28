export type IDevicesValue = boolean | "Everyone" | "Followed" | "Off" | "none";

export interface INotificationRow {
  name: string;
  email: boolean;
  devices: IDevicesValue;
}

export interface INotificationSettings {
  activities: INotificationRow[];
  soundcloudUpdates: INotificationRow[];
}