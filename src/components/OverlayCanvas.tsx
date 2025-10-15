import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricText, FabricImage } from "fabric";

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

interface OverlayCanvasProps {
  overlays: Overlay[];
  onOverlayUpdate?: (id: string, updates: Partial<Overlay>) => void;
}

export const OverlayCanvas = ({ overlays, onOverlayUpdate }: OverlayCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1280,
      height: 720,
      backgroundColor: "transparent",
      selection: true,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();

    overlays.forEach((overlay) => {
      if (overlay.type === "text" && overlay.content) {
        const text = new FabricText(overlay.content, {
          left: overlay.position_x,
          top: overlay.position_y,
          fontSize: overlay.font_size || 16,
          fill: overlay.color || "#ffffff",
          selectable: true,
          hasControls: true,
        });

        text.on("modified", () => {
          if (onOverlayUpdate) {
            onOverlayUpdate(overlay.id, {
              position_x: text.left || 0,
              position_y: text.top || 0,
              width: text.width || 100,
              height: text.height || 100,
            });
          }
        });

        fabricCanvas.add(text);
      } else if (overlay.type === "logo" && overlay.image_url) {
        FabricImage.fromURL(overlay.image_url).then((img) => {
          img.set({
            left: overlay.position_x,
            top: overlay.position_y,
            scaleX: overlay.width / (img.width || 100),
            scaleY: overlay.height / (img.height || 100),
            selectable: true,
            hasControls: true,
          });

          img.on("modified", () => {
            if (onOverlayUpdate) {
              onOverlayUpdate(overlay.id, {
                position_x: img.left || 0,
                position_y: img.top || 0,
                width: (img.width || 100) * (img.scaleX || 1),
                height: (img.height || 100) * (img.scaleY || 1),
              });
            }
          });

          fabricCanvas.add(img);
        });
      }
    });
  }, [overlays, fabricCanvas, onOverlayUpdate]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full pointer-events-auto" />
    </div>
  );
};