"use client";

import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useTranslations } from "@/hooks/useTranslations";

export default function LandingContact() {
  const { t } = useTranslations("contact", {
    "contact.title": "Get in Touch",
    "contact.subtitle": "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    "contact.emailTitle": "Email Us",
    "contact.emailResponse": "We'll respond within 24 hours",
    "contact.form.name": "Name",
    "contact.form.namePlaceholder": "Your name",
    "contact.form.email": "Email",
    "contact.form.emailPlaceholder": "your@email.com",
    "contact.form.message": "Message",
    "contact.form.messagePlaceholder": "Tell us how we can help...",
    "contact.form.submit": "Send Message",
  });

  return (
    <section id="contact" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("contact.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t("contact.emailTitle")}</h3>
                <p className="text-sm text-muted-foreground">info@rensights.com</p>
                <p className="text-sm text-muted-foreground">{t("contact.emailResponse")}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("contact.form.name")}</label>
                <Input placeholder={t("contact.form.namePlaceholder")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("contact.form.email")}</label>
                <Input type="email" placeholder={t("contact.form.emailPlaceholder")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("contact.form.message")}</label>
                <Textarea placeholder={t("contact.form.messagePlaceholder")} rows={4} />
              </div>
              <Button className="w-full">{t("contact.form.submit")}</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
