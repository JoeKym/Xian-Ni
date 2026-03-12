import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];
const ALL_ALLOWED = [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOC_TYPES];
const MAX_SIZE = 20 * 1024 * 1024;

export interface FileMeta {
  url: string;
  size: number;
  name: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_LABELS: Record<string, string> = {
  pdf: "PDF", doc: "Word", docx: "Word", xls: "Excel", xlsx: "Excel",
  csv: "CSV", txt: "Text", mp4: "Video", webm: "Video", mov: "Video",
  jpg: "Image", jpeg: "Image", png: "Image", gif: "GIF", webp: "Image",
};

export function getFileTypeLabel(url: string): string {
  const ext = getCleanUrl(url).split(".").pop()?.toLowerCase() || "";
  return EXT_LABELS[ext] || "File";
}

export function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(getCleanUrl(url));
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(getCleanUrl(url));
}

export function isDocUrl(url: string): boolean {
  return !isImageUrl(url) && !isVideoUrl(url);
}

/** Strip #meta=... from URL */
export function getCleanUrl(url: string): string {
  return url.split("#")[0];
}

/** Encode file metadata into URL hash */
export function encodeFileMeta(url: string, size: number, name: string): string {
  return `${url}#meta=${encodeURIComponent(JSON.stringify({ size, name }))}`;
}

/** Decode file metadata from URL hash */
export function decodeFileMeta(url: string): { cleanUrl: string; size?: number; name?: string } {
  const [cleanUrl, hash] = url.split("#");
  if (!hash?.startsWith("meta=")) return { cleanUrl };
  try {
    const meta = JSON.parse(decodeURIComponent(hash.slice(5)));
    return { cleanUrl, size: meta.size, name: meta.name };
  } catch {
    return { cleanUrl };
  }
}

export function getFileNameFromUrl(url: string): string {
  const clean = getCleanUrl(url);
  const segments = clean.split("/");
  return decodeURIComponent(segments[segments.length - 1] || "Document");
}

/** Shared upload function for button and drag-and-drop */
export async function uploadFile(
  file: File,
  userId: string
): Promise<FileMeta | null> {
  if (!ALL_ALLOWED.includes(file.type)) {
    toast.error("Unsupported file type. Supported: images, videos, PDF, Word, Excel, TXT, CSV");
    return null;
  }
  if (file.size > MAX_SIZE) {
    toast.error("File must be under 20MB");
    return null;
  }
  const ext = file.name.split(".").pop() || "bin";
  const filePath = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("dm-media").upload(filePath, file);
  if (error) {
    toast.error("Upload failed");
    return null;
  }
  const { data: urlData } = supabase.storage.from("dm-media").getPublicUrl(filePath);
  return {
    url: encodeFileMeta(urlData.publicUrl, file.size, file.name),
    size: file.size,
    name: file.name,
  };
}

export { ALL_ALLOWED, MAX_SIZE };
