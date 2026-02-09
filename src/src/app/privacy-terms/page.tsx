"use client";

import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";
import { useTranslations } from "@/hooks/useTranslations";

export default function PrivacyTermsPage() {
  const { t } = useTranslations("privacyTerms", {
    "privacyTerms.title": "Privacy Policy & Terms of Service",
    "privacyTerms.privacy.title": "Privacy Policy",
    "privacyTerms.privacy.p1": "At Rensights, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
    "privacyTerms.privacy.infoTitle": "Information We Collect",
    "privacyTerms.privacy.infoBody": "We collect information that you provide directly to us, including name, email address, and any other information you choose to provide. We also automatically collect certain information about your device and how you interact with our services.",
    "privacyTerms.privacy.useTitle": "How We Use Your Information",
    "privacyTerms.privacy.useBody": "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users and services.",
    "privacyTerms.privacy.securityTitle": "Data Security",
    "privacyTerms.privacy.securityBody": "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    "privacyTerms.terms.title": "Terms of Service",
    "privacyTerms.terms.p1": "By accessing and using Rensights, you accept and agree to be bound by the terms and provisions of this agreement.",
    "privacyTerms.terms.licenseTitle": "Use License",
    "privacyTerms.terms.licenseBody": "Permission is granted to temporarily access the materials on Rensights for personal, non-commercial use only. This is the grant of a license, not a transfer of title.",
    "privacyTerms.terms.modificationsTitle": "Service Modifications",
    "privacyTerms.terms.modificationsBody": "Rensights reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.",
    "privacyTerms.terms.responsibilitiesTitle": "User Responsibilities",
    "privacyTerms.terms.responsibilitiesBody": "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.",
    "privacyTerms.disclaimer.title": "Disclaimer",
    "privacyTerms.disclaimer.p1": "The information provided by Rensights is for general informational purposes only. All information on the platform is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the platform.",
    "privacyTerms.disclaimer.investmentTitle": "Investment Disclaimer",
    "privacyTerms.disclaimer.investmentBody": "The content on Rensights does not constitute financial, investment, or legal advice. All investments carry risk, and past performance is not indicative of future results. You should consult with qualified professionals before making any investment decisions.",
    "privacyTerms.disclaimer.liabilityTitle": "Limitation of Liability",
    "privacyTerms.disclaimer.liabilityBody": "Under no circumstance shall Rensights have any liability to you for any loss or damage of any kind incurred as a result of the use of the platform or reliance on any information provided on the platform. Your use of the platform and your reliance on any information is solely at your own risk.",
    "privacyTerms.disclaimer.changesTitle": "Changes to This Document",
    "privacyTerms.disclaimer.changesBody": "We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the platform after any such changes constitutes your acceptance of the new terms.",
    "privacyTerms.lastUpdated": "Last Updated:",
  });

  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">{t("privacyTerms.title")}</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{t("privacyTerms.privacy.title")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>{t("privacyTerms.privacy.p1")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.privacy.infoTitle")}</h3>
            <p>{t("privacyTerms.privacy.infoBody")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.privacy.useTitle")}</h3>
            <p>{t("privacyTerms.privacy.useBody")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.privacy.securityTitle")}</h3>
            <p>{t("privacyTerms.privacy.securityBody")}</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{t("privacyTerms.terms.title")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>{t("privacyTerms.terms.p1")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.terms.licenseTitle")}</h3>
            <p>{t("privacyTerms.terms.licenseBody")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.terms.modificationsTitle")}</h3>
            <p>{t("privacyTerms.terms.modificationsBody")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.terms.responsibilitiesTitle")}</h3>
            <p>{t("privacyTerms.terms.responsibilitiesBody")}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("privacyTerms.disclaimer.title")}</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>{t("privacyTerms.disclaimer.p1")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.disclaimer.investmentTitle")}</h3>
            <p>{t("privacyTerms.disclaimer.investmentBody")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.disclaimer.liabilityTitle")}</h3>
            <p>{t("privacyTerms.disclaimer.liabilityBody")}</p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">{t("privacyTerms.disclaimer.changesTitle")}</h3>
            <p>{t("privacyTerms.disclaimer.changesBody")}</p>
            
            <p className="mt-6">
              <strong>{t("privacyTerms.lastUpdated")}</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
