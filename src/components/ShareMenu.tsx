import { useState } from "react";
import { Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareMenuProps {
  url: string;
  text: string;
  className?: string;
}

const platforms = [
  {
    name: "WhatsApp",
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: "Telegram",
    getUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Facebook",
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "X / Twitter",
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: "Instagram",
    getUrl: () => null, // Instagram doesn't support web share links
  },
  {
    name: "LinkedIn",
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    getUrl: (url: string, text: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    name: "Email",
    getUrl: (url: string, text: string) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
];

export function ShareMenu({ url, text, className }: ShareMenuProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors ${className || ""}`}
          title="Share profile"
        >
          <Share2 size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {platforms.map((p) => {
          const shareUrl = p.getUrl(url, text);
          if (!shareUrl) return null;
          return (
            <DropdownMenuItem key={p.name} asChild>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-sm font-body"
              >
                {p.name}
              </a>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer text-sm font-body">
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
