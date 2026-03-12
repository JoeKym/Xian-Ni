import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Shield, BookOpen, Users, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const faqItems = [
  {
    q: "How do I create a community?",
    a: "Navigate to the Communities page and click 'Create Community'. Fill in the name, description, and category to get started.",
  },
  {
    q: "How do I change my profile picture?",
    a: "Go to your Profile page, hover over your avatar, and click the camera icon to upload a new image.",
  },
  {
    q: "Why was my account suspended?",
    a: "Accounts can be suspended for violating community guidelines. You can submit an appeal from the Suspended page to request a review.",
  },
  {
    q: "How do I report a user?",
    a: "In any community, click the flag icon next to a member's name to submit a report. Leaders and admins will review it.",
  },
  {
    q: "Can I delete my account?",
    a: "Currently, account deletion is handled by admins. Please contact us via email to request account removal.",
  },
  {
    q: "How do I upload images to posts?",
    a: "When creating a post in a community, click the image icon to attach a screenshot or fan art (max 5MB).",
  },
];

export default function Support() {
  return (
    <Layout>
      <div className="py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Support</h1>
              <p className="text-muted-foreground font-body text-sm">Get help and find answers</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link to="/contact" className="gradient-card border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-heading text-sm text-foreground">Contact Us</p>
              <p className="text-[10px] text-muted-foreground">Send a message</p>
            </Link>
            <Link to="/communities" className="gradient-card border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-heading text-sm text-foreground">Community</p>
              <p className="text-[10px] text-muted-foreground">Ask fellow cultivators</p>
            </Link>
            <Link to="/guide" className="gradient-card border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-heading text-sm text-foreground">Reading Guide</p>
              <p className="text-[10px] text-muted-foreground">Get started</p>
            </Link>
          </div>

          {/* FAQ */}
          <div className="gradient-card border border-border rounded-lg p-8">
            <h2 className="font-heading text-lg text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {faqItems.map((item, i) => (
                <div key={i} className="border-b border-border/50 pb-4 last:border-0">
                  <h3 className="font-heading text-sm text-foreground mb-1">{item.q}</h3>
                  <p className="font-body text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
