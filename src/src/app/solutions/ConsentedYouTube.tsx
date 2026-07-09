"use client";

import { useEffect, useState } from "react";
import { Youtube } from "lucide-react";
import { Button } from "@/components/landing/ui/button";

interface ConsentedYouTubeProps {
  youtubeId: string;
  title: string;
}

/**
 * GDPR-compliant YouTube embed.
 *
 * The raw YouTube iframe sets marketing cookies as soon as it loads, which
 * happens before the user responds to the Cookiebot dialog (Cookiebot's
 * auto-blocking does not block iframes). To stay compliant we render a
 * cookieless placeholder — which makes zero external requests — until the
 * user has granted the "marketing" consent category. Only then do we load
 * the player, via the privacy-friendly youtube-nocookie.com domain.
 *
 * Consent is detected with the same pattern used by the analytics components
 * (Clarity/GoogleAnalytics): sync once on mount (in case the consent event
 * already fired before hydration) and again on every CookiebotOnConsentReady
 * event. It fails closed — if Cookiebot is absent, consent stays false and no
 * YouTube request is ever made.
 */
export default function ConsentedYouTube({ youtubeId, title }: ConsentedYouTubeProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => {
      setAllowed(!!window.Cookiebot?.consent?.marketing);
    };

    // Case 1: consent was already granted before this component mounted.
    sync();

    // Case 2: catch the first consent response and any later consent changes.
    window.addEventListener("CookiebotOnConsentReady", sync);

    return () => {
      window.removeEventListener("CookiebotOnConsentReady", sync);
    };
  }, []);

  if (allowed) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={`${title} Demo`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-muted px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Youtube className="h-8 w-8 text-primary" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        Please accept marketing cookies to watch this video
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.Cookiebot?.renew?.()}
        aria-label="Manage cookies"
      >
        Manage cookies
      </Button>
    </div>
  );
}
