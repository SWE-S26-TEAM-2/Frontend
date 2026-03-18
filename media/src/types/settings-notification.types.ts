export type DevicesValue = boolean | "Everyone" | "Following" | "No one";

export interface INotificationRow {
  name: string;
  email: boolean;
  devices: DevicesValue;
}

export interface INotificationSettings {
  activities: INotificationRow[];
  soundcloudUpdates: INotificationRow[];
}