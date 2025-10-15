import { useState } from "react";
import { Plus, Type, Image, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface OverlayManagerProps {
  overlays: Overlay[];
  onOverlaysChange: () => void;
}

export const OverlayManager = ({ overlays, onOverlaysChange }: OverlayManagerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newOverlay, setNewOverlay] = useState({
    name: "",
    type: "text" as "text" | "logo",
    content: "",
    image_url: "",
    color: "#ffffff",
    font_size: 24,
  });

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create overlays");
      return;
    }

    const { error } = await supabase.from("overlays").insert({
      user_id: user.id,
      name: newOverlay.name,
      type: newOverlay.type,
      content: newOverlay.type === "text" ? newOverlay.content : null,
      image_url: newOverlay.type === "logo" ? newOverlay.image_url : null,
      position_x: 50,
      position_y: 50,
      width: 200,
      height: 100,
      font_size: newOverlay.font_size,
      color: newOverlay.color,
    });

    if (error) {
      toast.error("Failed to create overlay");
      return;
    }

    toast.success("Overlay created successfully");
    setIsCreating(false);
    setNewOverlay({ name: "", type: "text", content: "", image_url: "", color: "#ffffff", font_size: 24 });
    onOverlaysChange();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("overlays").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete overlay");
      return;
    }

    toast.success("Overlay deleted successfully");
    onOverlaysChange();
  };

  return (
    <Card className="glass-panel border-border">
      <CardHeader>
        <CardTitle className="text-gradient">Overlay Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Overlay
          </Button>
        ) : (
          <div className="space-y-4 glass-panel p-4 rounded-lg">
            <div>
              <Label htmlFor="name">Overlay Name</Label>
              <Input
                id="name"
                value={newOverlay.name}
                onChange={(e) => setNewOverlay({ ...newOverlay, name: e.target.value })}
                placeholder="Enter overlay name"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={newOverlay.type === "text" ? "default" : "outline"}
                onClick={() => setNewOverlay({ ...newOverlay, type: "text" })}
                className="flex-1"
              >
                <Type className="mr-2 h-4 w-4" />
                Text
              </Button>
              <Button
                variant={newOverlay.type === "logo" ? "default" : "outline"}
                onClick={() => setNewOverlay({ ...newOverlay, type: "logo" })}
                className="flex-1"
              >
                <Image className="mr-2 h-4 w-4" />
                Logo
              </Button>
            </div>

            {newOverlay.type === "text" ? (
              <>
                <div>
                  <Label htmlFor="content">Text Content</Label>
                  <Input
                    id="content"
                    value={newOverlay.content}
                    onChange={(e) => setNewOverlay({ ...newOverlay, content: e.target.value })}
                    placeholder="Enter text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={newOverlay.color}
                      onChange={(e) => setNewOverlay({ ...newOverlay, color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={newOverlay.font_size}
                      onChange={(e) => setNewOverlay({ ...newOverlay, font_size: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newOverlay.image_url}
                  onChange={(e) => setNewOverlay({ ...newOverlay, image_url: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              className="flex items-center justify-between p-3 glass-panel rounded-lg"
            >
              <div>
                <p className="font-medium">{overlay.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{overlay.type}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(overlay.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};