import { Upload } from "lucide-react";

export function DropZoneOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg pointer-events-none">
      <div className="flex flex-col items-center gap-2 text-primary">
        <Upload size={32} className="animate-bounce" />
        <p className="text-sm font-medium">Drop file to upload</p>
        <p className="text-xs text-muted-foreground">Images, videos, documents up to 20MB</p>
      </div>
    </div>
  );
}
