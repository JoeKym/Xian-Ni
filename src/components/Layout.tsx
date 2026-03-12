import { ReactNode, useEffect, useState } from "react";
import { FeedbackReviews } from "./FeedbackReviews";
import { useLocation, Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { NotificationBell } from "./NotificationBell";
import { VisitorCounter } from "./VisitorCounter";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { Shield, Wrench, Clock } from "lucide-react";
import githubIcon from "@/assets/socials/github.svg";
import linktreeIcon from "@/assets/socials/linktree.svg";
import instagramIcon from "@/assets/socials/instagram.svg";
import facebookIcon from "@/assets/socials/facebook.svg";
import twitterIcon from "@/assets/socials/twitter.svg";
import tiktokIcon from "@/assets/socials/tiktok.svg";
import youtubeIcon from "@/assets/socials/youtube.svg";
import spotifyIcon from "@/assets/socials/spotify.svg";
import pinterestIcon from "@/assets/socials/pinterest.svg";
import redditIcon from "@/assets/socials/reddit.svg";
import whatsappIcon from "@/assets/socials/whatsapp.svg";
import emailIcon from "@/assets/socials/email.svg";

function SvgIcon({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" className={className} />;
}

function MaintenanceCountdown({ eta }: { eta: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(eta).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Any moment now...");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eta]);

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock size={16} />
        <span className="font-body text-sm">Estimated time remaining</span>
      </div>
      <span className="font-heading text-2xl text-primary tracking-wider">{timeLeft}</span>
    </div>
  );
}
type SocialLink = {
  name: string;
  url: string;
  svgSrc?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const socialLinks: SocialLink[] = [
  { name: "Linktree", url: "https://linktr.ee/Joekym07", svgSrc: linktreeIcon },
  { name: "Instagram", url: "https://www.instagram.com/ky.money223", svgSrc: instagramIcon },
  { name: "Facebook", url: "https://www.facebook.com/ky.money223", svgSrc: facebookIcon },
  { name: "Twitter / X", url: "https://x.com/JoeKym07", svgSrc: twitterIcon },
  { name: "TikTok", url: "https://www.tiktok.com/@joekym07", svgSrc: tiktokIcon },
  { name: "YouTube", url: "https://www.youtube.com/@%E3%82%B8%E3%83%A7%E3%83%BC%E3%82%AD%E3%83%A0%E3%82%BC%E3%83%AD%E3%83%8A%E3%83%8A", svgSrc: youtubeIcon },
  { name: "Spotify", url: "https://open.spotify.com/user/3175pawgep7gxnrd6ve5vkdfmpdy?si=0aef054eb4ef4f9a", svgSrc: spotifyIcon },
  { name: "Pinterest", url: "https://www.pinterest.com/Joekym07", svgSrc: pinterestIcon },
  { name: "GitHub", url: "https://github.com/JoeKym", svgSrc: githubIcon },
  { name: "Reddit", url: "https://www.reddit.com/user/New_Region_381/", svgSrc: redditIcon },
  { name: "WhatsApp", url: "https://wa.me/254117412271?text=Hi%21%20I%E2%80%99d%20like%20to%20get%20in%20touch%20with%20you.", svgSrc: whatsappIcon },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAdmin } = useAdminCheck();
  const { maintenance, maintenanceEta } = useMaintenanceMode();

  useEffect(() => {
    let sessionId = sessionStorage.getItem("pv_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("pv_session", sessionId);
    }
    supabase.from("page_views").insert({
      page_path: location.pathname,
      session_id: sessionId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-15 pointer-events-none"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-0 bg-background/70 pointer-events-none" />

      <Navbar />
      {maintenance && !isAdmin ? (
        <main className="pt-[60px] relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <Wrench className="h-16 w-16 text-primary mb-6 animate-pulse" />
            <h1 className="font-heading text-3xl text-foreground mb-3 tracking-wider">Under Maintenance</h1>
            <p className="font-body text-muted-foreground max-w-md mb-6">
              We're performing scheduled maintenance to improve your experience. Please check back shortly.
            </p>
            {maintenanceEta && <MaintenanceCountdown eta={maintenanceEta} />}
          </div>
        </main>
      ) : (
        <main className="pt-[60px] relative z-10">{children}</main>
      )}

      {/* Floating Notification Bell */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/admin"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-card/90 backdrop-blur-lg border border-border shadow-lg shadow-primary/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200"
              >
                <Shield size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Admin Dashboard
            </TooltipContent>
          </Tooltip>
        )}
        <div className="bg-card/90 backdrop-blur-lg border border-border rounded-full p-1 shadow-lg shadow-primary/10">
          <NotificationBell />
        </div>
      </div>

      <FeedbackReviews pagePath={location.pathname} />

      <footer className="border-t border-border py-12 mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="font-heading text-primary text-lg tracking-wider mb-2">仙逆 · Renegade Immortal</p>
            <p className="text-muted-foreground font-body text-sm">
              A fan-made lore encyclopedia for Er Gen's Renegade Immortal (Xian Ni)
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="font-heading text-foreground text-sm uppercase tracking-widest mb-4">Community</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 text-xs font-body hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                    >
                      {link.svgSrc ? (
                        <SvgIcon src={link.svgSrc} className="h-4 w-4" />
                      ) : link.icon ? (
                        <link.icon className="h-3.5 w-3.5" />
                      ) : null}
                      {link.name}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Visit {link.name}
                  </TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="mailto:mail.jkyme@gmail.com"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-200 text-xs font-body hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                  >
                    <SvgIcon src={emailIcon} className="h-4 w-4" />
                    Email
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Send an email
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs font-body">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>

          <div className="flex items-center justify-center gap-4 mb-3">
            <VisitorCounter />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground/50 font-body text-xs">
              All lore content based on the original novel by Er Gen
            </p>
            <p className="text-muted-foreground font-body text-xs mt-3">
              Created by{" "}
              <a
                href="https://joekymlabs.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                JoeKym Labs™
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}