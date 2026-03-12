import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Privacy Policy</h1>
          </div>

          <div className="gradient-card border border-border rounded-lg p-8 space-y-6 font-body text-foreground/85 text-sm leading-relaxed">
            <p className="text-muted-foreground text-xs">Last updated: March 8, 2026</p>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">1. Information We Collect</h2>
              <p>When you create an account, we collect your email address, display name, and optional profile information (bio, avatar, reading progress). We also collect usage data such as page views and session information to improve the site experience.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide and maintain your account and community features</li>
                <li>To display your profile to other community members</li>
                <li>To send notifications about community activity</li>
                <li>To analyze site traffic and improve user experience</li>
                <li>To moderate content and enforce community guidelines</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">3. Data Storage</h2>
              <p>Your data is stored securely using industry-standard encryption. Uploaded images and media are stored in secure cloud storage. We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">4. Cookies & Analytics</h2>
              <p>We use session-based identifiers to track page views and active visitors. These are stored locally in your browser session and are not used for advertising or tracking across other websites.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">5. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access and update your profile information at any time</li>
                <li>Delete your account by contacting an administrator</li>
                <li>Request a copy of your stored data</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">6. Third-Party Services</h2>
              <p>We use third-party services for authentication and data storage. These services have their own privacy policies which we encourage you to review.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg text-foreground mb-2">7. Contact</h2>
              <p>For privacy-related inquiries, please contact us at <a href="mailto:mail.jkyme@gmail.com" className="text-primary hover:underline">mail.jkyme@gmail.com</a>.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
