import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Film, FileText, X, Download, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCleanUrl, isImageUrl, isVideoUrl, decodeFileMeta, getFileTypeLabel, formatFileSize } from "./fileUtils";

interface MediaGalleryProps {
  /** All image_url values from messages in this conversation */
  mediaUrls: string[];
  open: boolean;
  onClose: () => void;
}

export function MediaGallery({ mediaUrls, open, onClose }: MediaGalleryProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const images: string[] = [];
  const videos: string[] = [];
  const files: string[] = [];

  mediaUrls.forEach(url => {
    const clean = getCleanUrl(url);
    if (isImageUrl(clean)) images.push(url);
    else if (isVideoUrl(clean)) videos.push(url);
    else files.push(url);
  });

  const totalCount = images.length + videos.length + files.length;

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-background border border-border rounded-xl w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-heading text-sm tracking-wider uppercase text-foreground">
                Shared Media ({totalCount})
              </h3>
              <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <Tabs defaultValue="images" className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-4 mt-3 mb-0 w-fit">
                <TabsTrigger value="images" className="gap-1.5 text-xs">
                  <Image size={12} /> Images ({images.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-1.5 text-xs">
                  <Film size={12} /> Videos ({videos.length})
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-1.5 text-xs">
                  <FileText size={12} /> Files ({files.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="images" className="flex-1 min-h-0 m-0">
                <ScrollArea className="h-full max-h-[50vh] p-4">
                  {images.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-8">No images shared yet</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((url, i) => {
                        const clean = getCleanUrl(url);
                        return (
                          <button
                            key={i}
                            onClick={() => setPreview(clean)}
                            className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                          >
                            <img src={clean} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="videos" className="flex-1 min-h-0 m-0">
                <ScrollArea className="h-full max-h-[50vh] p-4">
                  {videos.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-8">No videos shared yet</p>
                  ) : (
                    <div className="space-y-3">
                      {videos.map((url, i) => {
                        const clean = getCleanUrl(url);
                        return (
                          <video
                            key={i}
                            src={clean}
                            controls
                            className="w-full max-h-48 rounded-lg border border-border"
                          />
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="files" className="flex-1 min-h-0 m-0">
                <ScrollArea className="h-full max-h-[50vh] p-4">
                  {files.length === 0 ? (
                    <p className="text-center text-muted-foreground text-xs py-8">No files shared yet</p>
                  ) : (
                    <div className="space-y-2">
                      {files.map((url, i) => {
                        const { cleanUrl, size, name } = decodeFileMeta(url);
                        const typeLabel = getFileTypeLabel(cleanUrl);
                        const fileName = name || cleanUrl.split("/").pop() || "Document";
                        return (
                          <a
                            key={i}
                            href={cleanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="shrink-0 w-9 h-9 rounded-md bg-muted flex items-center justify-center">
                              <FileText size={18} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate text-foreground">{fileName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground font-mono">{typeLabel}</span>
                                {size && <span className="text-[10px] text-muted-foreground">· {formatFileSize(size)}</span>}
                              </div>
                            </div>
                            <Download size={14} className="shrink-0 text-muted-foreground/40" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Image preview lightbox */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={preview}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
