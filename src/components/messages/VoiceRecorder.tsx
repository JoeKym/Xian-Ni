import { useState, useRef, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VoiceRecorderProps {
  userId: string;
  onRecorded: (audioUrl: string) => void;
}

export function VoiceRecorder({ userId, onRecorded }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) { toast.error("Recording too short"); return; }
        if (blob.size > 10 * 1024 * 1024) { toast.error("Recording too large (max 10MB)"); return; }

        setUploading(true);
        const fileName = `${userId}/${Date.now()}.webm`;
        const { error } = await supabase.storage.from("voice-messages").upload(fileName, blob, {
          contentType: "audio/webm",
          cacheControl: "3600",
        });

        if (error) {
          toast.error("Failed to upload voice message");
          setUploading(false);
          return;
        }

        const { data: urlData } = supabase.storage.from("voice-messages").getPublicUrl(fileName);
        onRecorded(urlData.publicUrl);
        setUploading(false);
        setDuration(0);
      };

      mediaRecorder.start(250);
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  }, [userId, onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (uploading) {
    return (
      <button type="button" disabled className="p-2 rounded text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
      </button>
    );
  }

  if (recording) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-[10px] text-destructive font-mono">{formatDuration(duration)}</span>
        <button
          type="button"
          onClick={stopRecording}
          className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          title="Stop recording"
        >
          <Square size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      className="p-2 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
      title="Record voice message"
    >
      <Mic size={18} />
    </button>
  );
}
