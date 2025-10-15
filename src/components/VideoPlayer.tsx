import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  streamUrl: string;
  overlays?: React.ReactNode;
}

export const VideoPlayer = ({ streamUrl, overlays }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError("Failed to load stream. Please check the URL.");
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else {
      setError("HLS is not supported in this browser");
    }
  }, [streamUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
      />
      
      {overlays}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-destructive text-center px-4">{error}</p>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 glass-panel p-4">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="text-foreground hover:text-primary"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-2 flex-1 max-w-32">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="text-foreground hover:text-primary"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};