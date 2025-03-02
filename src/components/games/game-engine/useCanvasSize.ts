import { useEffect, useState, useCallback } from "react";

interface CanvasSize {
  width: number;
  height: number;
}

export const useCanvasSize = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isExpanded: boolean
) => {
  const [size, setSize] = useState<CanvasSize>({ width: 800, height: 400 });

  const updateSize = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Calculate new size while maintaining aspect ratio
    let width = rect.width;
    let height = rect.height;

    if (isExpanded) {
      // In expanded mode, maintain 16:9 aspect ratio
      const aspectRatio = 16 / 9;
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    // Update canvas size with DPI scaling
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Update context scale for DPI
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    setSize({ width, height });
  }, [canvasRef, isExpanded]);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [updateSize]);

  return { ...size, updateSize };
};
