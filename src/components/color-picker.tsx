"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";

import { Button } from "@/components/ui/button";

const COLOR_SWATCHES = [
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#84CC16",
  "#EAB308",
  "#F59E0B",
  "#94A3B8",
  "#111827",
] as const;

interface DesktopColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

interface ColorChannelSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  style?: CSSProperties;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toHexChannel(value: number): string {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, "0");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hueToRgb(channelA: number, channelB: number, hue: number): number {
  if (hue < 0) {
    return hueToRgb(channelA, channelB, hue + 1);
  }
  if (hue > 1) {
    return hueToRgb(channelA, channelB, hue - 1);
  }
  if (hue < 1 / 6) {
    return channelA + (channelB - channelA) * 6 * hue;
  }
  if (hue < 1 / 2) {
    return channelB;
  }
  if (hue < 2 / 3) {
    return channelA + (channelB - channelA) * (2 / 3 - hue) * 6;
  }

  return channelA;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;

  if (s === 0) {
    const gray = l * 255;
    return `#${toHexChannel(gray)}${toHexChannel(gray)}${toHexChannel(gray)}`.toUpperCase();
  }

  const channelB = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const channelA = 2 * l - channelB;
  const red = hueToRgb(channelA, channelB, h + 1 / 3) * 255;
  const green = hueToRgb(channelA, channelB, h) * 255;
  const blue = hueToRgb(channelA, channelB, h - 1 / 3) * 255;

  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`.toUpperCase();
}

function hexToHsl(hex: string): HslColor {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function ColorChannelSlider({ label, value, min, max, onChange, style }: ColorChannelSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
          {label}
        </span>
        <span className="text-foreground/80 font-mono text-xs">{Math.round(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={Math.round(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="border-input bg-muted/70 h-2 w-full cursor-pointer appearance-none rounded-full border"
        style={style}
      />
    </div>
  );
}

export function DesktopColorPicker({ label, value, onChange }: DesktopColorPickerProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const current = useMemo(() => hexToHsl(value), [value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const setChannel = (partial: Partial<HslColor>) => {
    const next = { ...current, ...partial };
    onChange(hslToHex(next.h, next.s, next.l));
  };

  return (
    <div ref={popoverRef} className="relative hidden md:block">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`${label} color picker`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="dark:bg-input/30 border-input bg-input/30"
      >
        <span
          className="block h-5 w-5 rounded-full border border-white/10 shadow-inner"
          style={{ backgroundColor: value }}
        />
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="bg-popover/96 border-border absolute top-full right-0 z-30 mt-2 w-72 rounded-2xl border p-3 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.55)] backdrop-blur"
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className="border-input h-11 w-11 rounded-xl border shadow-inner"
              style={{ backgroundColor: value }}
            />
            <div className="min-w-0">
              <p id={titleId} className="text-sm font-medium">
                {label}
              </p>
              <p className="text-muted-foreground font-mono text-xs">{value}</p>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_SWATCHES.map((swatch) => {
              const selected = swatch === value;
              return (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Use ${swatch} for ${label}`}
                  onClick={() => onChange(swatch)}
                  className={`h-8 rounded-lg border transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden ${
                    selected
                      ? "border-foreground ring-2 ring-offset-1"
                      : "border-border ring-0 ring-offset-0"
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            <ColorChannelSlider
              label="Hue"
              value={current.h}
              min={0}
              max={360}
              onChange={(nextHue) => setChannel({ h: nextHue })}
              style={{
                background:
                  "linear-gradient(90deg, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)",
              }}
            />
            <ColorChannelSlider
              label="Saturation"
              value={current.s}
              min={0}
              max={100}
              onChange={(nextSaturation) => setChannel({ s: nextSaturation })}
              style={{
                background: `linear-gradient(90deg, ${hslToHex(current.h, 0, current.l)} 0%, ${hslToHex(current.h, 100, current.l)} 100%)`,
              }}
            />
            <ColorChannelSlider
              label="Lightness"
              value={current.l}
              min={0}
              max={100}
              onChange={(nextLightness) => setChannel({ l: nextLightness })}
              style={{
                background: `linear-gradient(90deg, ${hslToHex(current.h, current.s, 0)} 0%, ${hslToHex(current.h, current.s, 50)} 50%, ${hslToHex(current.h, current.s, 100)} 100%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
