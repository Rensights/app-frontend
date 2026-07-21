import { getServerTranslations } from "@/lib/serverTranslations";
import PrivacyTermsContent from "./PrivacyTermsContent";

// Static/ISR: bake the privacyTerms bundle into the first paint so the page
// renders the real content immediately (no default-then-translated flash).
export const revalidate = 3600;

export default async function PrivacyTermsPage() {
  const seeded = await getServerTranslations("privacyTerms");
  return <PrivacyTermsContent seeded={seeded} />;
}
