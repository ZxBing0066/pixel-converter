import { useState, useCallback, useRef, useEffect } from "react";
import shuffle from "z-shuffle";

export interface PixelSettings {
  precision: number;
  shadowGap: number;
  shadowRadius: number;
  dropTransparent: boolean;
  dropWhite: boolean;
  dropAlpha: boolean;
  textShadow: boolean;
  shadowText: string;
  shadowTextSize: number;
  animeMode: boolean;
}

export const defaultSettings: PixelSettings = {
  precision: 50,
  shadowGap: 0,
  shadowRadius: 0,
  dropTransparent: true,
  dropWhite: false,
  dropAlpha: false,
  textShadow: false,
  shadowText: "@",
  shadowTextSize: 1,
  animeMode: false,
};

export interface PixelOutput {
  blockSize: string;
  borderRadius: string;
  shadow: string;
  animeShadow: string;
  width: string;
  height: string;
  fontSize: string;
}

function rgbToHex(r: number, g: number, b: number) {
  if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export function usePixelConverter() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<PixelSettings>(defaultSettings);
  const [output, setOutput] = useState<PixelOutput | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(640);
  const [ratio, setRatio] = useState(1);

  const imageRef = useRef<HTMLImageElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined" && !offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (e.target?.result) {
        setFileUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const processShadow = useCallback(
    (offscreenCtx: CanvasRenderingContext2D, size: number, r: number, random: boolean = false) => {
      const shadowArr = [];
      const { precision, dropTransparent, dropWhite, dropAlpha, textShadow } = settings;
      const h = Math.round(precision * r);

      let allPair: [number, number][] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < precision; x++) {
          allPair.push([x, y]);
        }
      }

      if (random) {
        allPair = textShadow ? shuffle([...allPair]) : [allPair[0], ...shuffle(allPair.slice(1))];
      }

      // Optimize: Get all pixel data at once
      const imageData = offscreenCtx.getImageData(0, 0, precision, h).data;

      let i = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < precision; x++) {
          const cord = random ? allPair[i++] : [x, y];
          const _x = cord[0],
            _y = cord[1];

          const pixelIndex = (y * precision + x) * 4;
          const rColor = imageData[pixelIndex];
          const gColor = imageData[pixelIndex + 1];
          const bColor = imageData[pixelIndex + 2];
          const aColor = imageData[pixelIndex + 3];

          if (dropTransparent && aColor === 0) continue;
          if (dropWhite && aColor !== 0 && rColor === 255 && gColor === 255 && bColor === 255) continue;

          const color = dropAlpha
            ? "#" + rgbToHex(rColor, gColor, bColor)
            : `rgba(${rColor},${gColor},${bColor},${+(aColor / 255).toFixed(3)})`;

          shadowArr.push(
            `${color} ${_x * size}px ${_y * size}px` +
              (!textShadow && _y === 0 && _x === 0 ? ` 0 ${size}px inset` : "")
          );
        }
      }
      return shadowArr.join(",");
    },
    [settings]
  );

  const updateOutput = useCallback(
    (r: number, cw: number) => {
      if (!offscreenCanvasRef.current) return;
      const offscreenCtx = offscreenCanvasRef.current.getContext("2d");
      if (!offscreenCtx) return;

      const size = Math.floor(cw / settings.precision) || 1;
      const blockSize = Math.max(size - settings.shadowGap, 1) + "px";
      const h = Math.round(settings.precision * r);

      const shadow = processShadow(offscreenCtx, size, r, false);
      const animeShadow = settings.animeMode ? processShadow(offscreenCtx, size, r, true) : "none";

      const height = size * h + "px";
      const width = size * settings.precision + "px";
      const borderRadius = settings.shadowRadius + "%";
      const fontSize = Math.max(size - settings.shadowGap, 1) * (1 + (settings.shadowTextSize - 1) / 5) + "px";

      setOutput({
        blockSize,
        borderRadius,
        shadow,
        animeShadow,
        width,
        height,
        fontSize,
      });
    },
    [settings, processShadow]
  );

  const processImage = useCallback(() => {
    if (!imageRef.current || !offscreenCanvasRef.current) return;
    const img = imageRef.current;
    if (!img.naturalWidth || !img.naturalHeight) return;

    const r = img.naturalHeight / img.naturalWidth;
    setRatio(r);
    const newCanvasWidth = Math.min(640, img.naturalWidth, typeof window !== "undefined" ? window.innerWidth - 40 : 640);
    setCanvasWidth(newCanvasWidth);

    const offscreen = offscreenCanvasRef.current;
    offscreen.width = settings.precision;
    offscreen.height = Math.round(settings.precision * r);
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      // Draw actual image scaled down to precision size
      ctx.imageSmoothingEnabled = true; // Use smoothing for down-sampling so it averages colors beautifully
      ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
      updateOutput(r, newCanvasWidth);

      // Restore drawing to main visible canvas
      const mainCanvas = mainCanvasRef.current;
      if (mainCanvas) {
        mainCanvas.width = newCanvasWidth;
        mainCanvas.height = newCanvasWidth * r;
        const mainCtx = mainCanvas.getContext("2d");
        if (mainCtx) {
          mainCtx.imageSmoothingEnabled = false; // Nearest neighbor up-scaling
          // cast to any for older browser compat aliases if strictly needed, but JS handles it
          (mainCtx as any).mozImageSmoothingEnabled = false;
          (mainCtx as any).webkitImageSmoothingEnabled = false;
          (mainCtx as any).msImageSmoothingEnabled = false;
          mainCtx.drawImage(offscreen, 0, 0, newCanvasWidth, newCanvasWidth * r);
        }
      }
    }
  }, [settings.precision, updateOutput]);

  useEffect(() => {
    if (fileUrl && imageRef.current && imageRef.current.complete) {
      if (offscreenCanvasRef.current && offscreenCanvasRef.current.width !== settings.precision) {
         processImage();
      } else {
         updateOutput(ratio, canvasWidth);
      }
    }
  }, [settings, fileUrl, processImage, updateOutput, ratio, canvasWidth]);

  return {
    fileUrl,
    handleFileUpload,
    settings,
    setSettings,
    output,
    imageRef,
    mainCanvasRef,
    canvasWidth,
    ratio,
    processImage,
  };
}
