import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";

export default function TermsOfService() {
  return (
    <Layout>
      <div className="py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ScrollText className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Terms of Service</h1>
          </div>

          <div className="gradient-card border border-border rounded-lg p-8 space-y-6 font-body text-foreground/85 text-sm leading-relaxed">
            <p className="text-muted-foreground text-xs">Last updated: March 8, 2026</p>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>By accessing and using Renegade Immortal (仙逆), you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">2. User Accounts</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide a valid email address to create an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>One account per person; duplicate accounts may be removed</li>
                <li>You must be at least 13 years old to use this site</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">3. Content Guidelines</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not post offensive, hateful, or illegal content</li>
                <li>Respect other community members and their opinions</li>
                <li>Do not spam, advertise, or post misleading content</li>
                <li>Fan art and screenshots must respect original creators' rights</li>
                <li>Uploaded media must not exceed size limits (5MB per file)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">4. Intellectual Property</h2>
              <p>All lore content is based on the original novel "Renegade Immortal" (仙逆) by Er Gen. This is a fan-made encyclopedia and is not affiliated with the original author or publishers. All original content you post remains yours, but you grant us a license to display it on the platform.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">5. Moderation & Enforcement</h2>
              <p>We reserve the right to suspend or ban accounts that violate these terms. Suspended users may appeal through the built-in appeals system. Admin decisions are final.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">6. Limitation of Liability</h2>
              <p>This site is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the site, including data loss or service interruptions.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">7. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
