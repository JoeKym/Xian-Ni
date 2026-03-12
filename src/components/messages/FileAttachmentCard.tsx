import { FileText, Film, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { decodeFileMeta, getFileNameFromUrl, getFileTypeLabel, formatFileSize, getCleanUrl, isVideoUrl } from "./fileUtils";

interface FileAttachmentCardProps {
  url: string;
  isOwnMessage: boolean;
}

export function FileAttachmentCard({ url, isOwnMessage }: FileAttachmentCardProps) {
  const { cleanUrl, size, name } = decodeFileMeta(url);
  const displayName = name || getFileNameFromUrl(cleanUrl);
  const typeLabel = getFileTypeLabel(cleanUrl);
  const isVid = isVideoUrl(cleanUrl);
  const Icon = isVid ? Film : FileText;

  return (
    <a
      href={cleanUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 mb-1.5 p-2.5 rounded-lg border transition-colors ${
        isOwnMessage
          ? "border-primary-foreground/20 hover:bg-primary-foreground/10"
          : "border-border hover:bg-muted"
      }`}
    >
      <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${
        isOwnMessage ? "bg-primary-foreground/10" : "bg-muted"
      }`}>
        <Icon size={18} className={isOwnMessage ? "text-primary-foreground/80" : "text-primary"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-mono ${
            isOwnMessage ? "border-primary-foreground/30 text-primary-foreground/70" : ""
          }`}>
            {typeLabel}
          </Badge>
          {size && (
            <span className={`text-[9px] ${
              isOwnMessage ? "text-primary-foreground/50" : "text-muted-foreground"
            }`}>
              {formatFileSize(size)}
            </span>
          )}
        </div>
      </div>
      <Download size={14} className={`shrink-0 ${
        isOwnMessage ? "text-primary-foreground/40" : "text-muted-foreground/40"
      }`} />
    </a>
  );
}
