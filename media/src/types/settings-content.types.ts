export type EmailDisplay = "don't display" | "display";

export interface IContentSettings {
  rssUrl: string;
  emailDisplay: EmailDisplay;
  customFeedTitle: string;
  category: string;
  statsServiceUrl: string;
  customAuthorName: string;
  language: string;
  subscriberRedirect: string;
  explicitContent: boolean;
  includeInRSS: boolean;
  creativeCommons: boolean;
}