"use client";

import LandingHeader from "@/components/landing/Header";
import LandingFooter from "@/components/landing/Footer";

export default function PrivacyTermsPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy & Terms of Service</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              At Rensights, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Information We Collect</h3>
            <p>
              We collect information that you provide directly to us, including name, email address, and any other information you choose to provide. We also automatically collect certain information about your device and how you interact with our services.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">How We Use Your Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect our users and services.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Data Security</h3>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              By accessing and using Rensights, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Use License</h3>
            <p>
              Permission is granted to temporarily access the materials on Rensights for personal, non-commercial use only. This is the grant of a license, not a transfer of title.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Service Modifications</h3>
            <p>
              Rensights reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">User Responsibilities</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The information provided by Rensights is for general informational purposes only. All information on the platform is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the platform.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Investment Disclaimer</h3>
            <p>
              The content on Rensights does not constitute financial, investment, or legal advice. All investments carry risk, and past performance is not indicative of future results. You should consult with qualified professionals before making any investment decisions.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Limitation of Liability</h3>
            <p>
              Under no circumstance shall Rensights have any liability to you for any loss or damage of any kind incurred as a result of the use of the platform or reliance on any information provided on the platform. Your use of the platform and your reliance on any information is solely at your own risk.
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Changes to This Document</h3>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the platform after any such changes constitutes your acceptance of the new terms.
            </p>
            
            <p className="mt-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
