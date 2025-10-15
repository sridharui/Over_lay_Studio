import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "@/components/VideoPlayer";
import { OverlayCanvas } from "@/components/OverlayCanvas";
import { OverlayManager } from "@/components/OverlayManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Play } from "lucide-react";
import { toast } from "sonner";

interface Overlay {
  id: string;
  name: string;
  type: "text" | "logo";
  content?: string;
  image_url?: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  font_size?: number;
  color?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [activeStreamUrl, setActiveStreamUrl] = useState("");
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchOverlays();
    }
  }, [user]);

  const fetchOverlays = async () => {
    const { data, error } = await supabase
      .from("overlays")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch overlays");
      return;
    }

    setOverlays((data || []) as Overlay[]);
  };

  const handleOverlayUpdate = async (id: string, updates: Partial<Overlay>) => {
    const { error } = await supabase
      .from("overlays")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update overlay");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleLoadStream = () => {
    if (!streamUrl.trim()) {
      toast.error("Please enter a valid stream URL");
      return;
    }
    setActiveStreamUrl(streamUrl);
    toast.success("Stream loaded successfully");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2 animate-fade-in">
              StreamOverlay
            </h1>
            <p className="text-muted-foreground">Professional livestream overlay management</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-border hover:border-primary"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="glass-panel p-6 rounded-lg space-y-4">
          <Label htmlFor="streamUrl" className="text-lg font-semibold">
            Stream URL (HLS)
          </Label>
          <p className="text-sm text-muted-foreground">
            Enter an HLS stream URL (.m3u8). For testing, you can use services like{" "}
            <a
              href="https://www.wowza.com/developer/tools/hls-test-stream"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Wowza Test Streams
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              id="streamUrl"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://example.com/stream.m3u8"
              className="flex-1"
            />
            <Button onClick={handleLoadStream} className="bg-primary hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" />
              Load Stream
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="relative animate-fade-in">
              {activeStreamUrl ? (
                <VideoPlayer
                  streamUrl={activeStreamUrl}
                  overlays={
                    <OverlayCanvas
                      overlays={overlays}
                      onOverlayUpdate={handleOverlayUpdate}
                    />
                  }
                />
              ) : (
                <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center glass-panel">
                  <p className="text-muted-foreground text-center px-4">
                    Enter a stream URL above and click Load Stream to begin
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="animate-fade-in">
            <OverlayManager overlays={overlays} onOverlaysChange={fetchOverlays} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;