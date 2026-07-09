interface CookiebotConsent {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

interface Cookiebot {
  consent: CookiebotConsent;
  hasResponse: boolean;
  renew?: () => void;
}

declare global {
  interface Window {
    Cookiebot?: Cookiebot;
  }
}

export {};
