export type Theme = "light" | "dark" | "automatic";

export interface IEmail {
  address: string;
  isPrimary: boolean;
}

export interface ILinkedAccounts {
  facebook: boolean;
  google: boolean;
  apple: boolean;
}

export interface IAccountSettings {
  theme: Theme;
  emails: IEmail[];
  linkedAccounts: ILinkedAccounts;
}