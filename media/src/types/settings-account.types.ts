export type ITheme = "light" | "dark" | "automatic";
export type IGender = "Female" | "Male" | "Non-binary" | "Prefer not to say";

export interface IEmail {
  address: string;
  isPrimary: boolean;
}

export interface ILinkedAccounts {
  facebook: boolean;
  google: boolean;
  apple: boolean;
}

export interface ILinkedAccountInfo {
  platform: "facebook" | "google";
  name: string;
}

export interface IBirthDate {
  month: string;
  day: number;
  year: number;
}

export interface IConnectedApp {
  id: string;
  name: string;
}

export interface IAccountSettings {
  theme: ITheme;
  emails: IEmail[];
  primaryEmail: string;
  linkedAccounts: ILinkedAccounts;
  linkedAccountsInfo: ILinkedAccountInfo[];
  birthDate: IBirthDate;
  gender: IGender;
  connectedApps: IConnectedApp[];
}