interface CookiebotConsent {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

interface Cookiebot {
  consent: CookiebotConsent;
  hasResponse: boolean;
}

declare global {
  interface Window {
    Cookiebot?: Cookiebot;
  }
}

export {};
