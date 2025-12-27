"use client";

import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function LandingContact() {
  return (
    <section id="contact" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Get in Touch</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Us</h3>
                <p className="text-sm text-muted-foreground">info@rensights.com</p>
                <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea placeholder="Tell us how we can help..." rows={4} />
              </div>
              <Button className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

