import { useRef, useState } from "react";
import { Paperclip, X, Loader2, FileText, Film } from "lucide-react";
import { uploadFile, getCleanUrl, isImageUrl, isVideoUrl, type FileMeta } from "./fileUtils";

interface MediaUploadProps {
  userId: string;
  onUpload: (url: string) => void;
  pendingUrl: string | null;
  onClear: () => void;
}

export function MediaUpload({ userId, onUpload, pendingUrl, onClear }: MediaUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file, userId);
    if (result) onUpload(result.url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const cleanUrl = pendingUrl ? getCleanUrl(pendingUrl) : null;
  const isImage = cleanUrl && isImageUrl(cleanUrl);
  const isVideo = cleanUrl && isVideoUrl(cleanUrl);

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {pendingUrl ? (
        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border flex items-center justify-center bg-muted/30">
          {isImage ? (
            <img src={cleanUrl!} alt="Upload" className="w-full h-full object-cover" />
          ) : isVideo ? (
            <Film size={24} className="text-primary" />
          ) : (
            <FileText size={24} className="text-primary" />
          )}
          <button
            onClick={onClear}
            className="absolute top-0 right-0 p-0.5 bg-background/80 rounded-bl text-muted-foreground hover:text-destructive"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
          title="Attach file"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
        </button>
      )}
    </div>
  );
}

export function getFileIcon(url: string) {
  const ext = getCleanUrl(url).split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov"].includes(ext)) return <Film size={20} className="text-primary" />;
  if (["pdf", "doc", "docx", "xls", "xlsx", "txt", "csv"].includes(ext)) return <FileText size={20} className="text-primary" />;
  return null;
}
