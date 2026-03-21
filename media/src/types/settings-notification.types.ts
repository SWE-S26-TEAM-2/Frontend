export type IDevicesValue = boolean | "Everyone" | "Following" | "No one";

export interface INotificationRow {
  name: string;
  email: boolean;
  devices: IDevicesValue;
}

export interface INotificationSettings {
  activities: INotificationRow[];
  soundcloudUpdates: INotificationRow[];
}