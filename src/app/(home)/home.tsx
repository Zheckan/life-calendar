"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { DesktopColorPicker } from "@/components/color-picker";
import { DatePickerField } from "@/components/date-picker-field";
import { DeviceResolutionPicker } from "@/components/device-resolution-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Copy, Check, Github, Loader2, RotateCcw } from "lucide-react";
import { SetupGuide } from "@/components/setup-guide";
import type { CalendarView, WeekStart } from "@/lib/calendar-utils";
import { getAutoDotColor, normalizeHexColor } from "@/lib/colors";
import {
  findScreenResolution,
  getOrientedResolution,
  type DeviceOrientation,
} from "@/lib/screen-resolutions";
import { getPreviewImageTransform } from "@/lib/og-layout";
import {
  buildAbsoluteWallpaperUrl,
  buildAdjustedWallpaperQueryString,
  buildWallpaperImagePath,
  DEFAULT_IMAGE_ADJUSTMENT,
  type ImageAdjustment,
} from "@/lib/wallpaper-url";
import { cn } from "@/lib/utils";

const VIEW_OPTIONS: { value: CalendarView; label: string; description: string }[] = [
  { value: "days", label: "Days", description: "All days of the year" },
  { value: "months", label: "Months", description: "All days of the year grouped by months" },
  { value: "quarters", label: "Quarters", description: "All days of the year grouped by quarters" },
  { value: "life", label: "Life", description: "Weeks of your life" },
  { value: "goal", label: "Goal", description: "Days until a goal deadline" },
];

const WEEK_START_VIEWS: CalendarView[] = ["months", "quarters"];
const GITHUB_URL = "https://github.com/Zheckan/life-calendar";
const DEFAULT_DEVICE_NAME = "iPhone 15 / 15 Pro / 16";
const POSITION_OFFSET_RANGE = { min: -20, max: 20, step: 1 };
const IMAGE_SCALE_RANGE = { min: 80, max: 140, step: 5 };
const FADE_VARIANTS = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" as const },
};

function resolvePickerColor(value: string, fallback: string): string {
  return normalizeHexColor(value) ?? fallback;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createDefaultImageAdjustments(): Record<DeviceOrientation, ImageAdjustment> {
  return {
    portrait: { ...DEFAULT_IMAGE_ADJUSTMENT },
    landscape: { ...DEFAULT_IMAGE_ADJUSTMENT },
  };
}

interface ColorControlProps {
  id: string;
  label: string;
  pickerValue: string;
  textPlaceholder: string;
  textValue: string;
  onPickerChange: (value: string) => void;
  onTextChange: (value: string) => void;
}

function ColorControl({
  id,
  label,
  pickerValue,
  textPlaceholder,
  textValue,
  onPickerChange,
  onTextChange,
}: ColorControlProps): React.ReactElement {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-muted-foreground text-xs">
        {label}
      </Label>
      <div className="flex gap-1.5">
        <label className="border-input bg-input/30 relative block h-9 w-9 shrink-0 overflow-hidden rounded-md border md:hidden">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onPickerChange(e.target.value)}
            aria-label={`${label} color picker`}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <span
            className="pointer-events-none block h-full w-full rounded-[inherit] border border-white/10"
            style={{ backgroundColor: pickerValue }}
          />
        </label>
        <DesktopColorPicker label={label} value={pickerValue} onChange={onPickerChange} />
        <Input
          id={id}
          type="text"
          placeholder={textPlaceholder}
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-w-0 font-mono text-xs"
        />
      </div>
    </div>
  );
}

export default function Home(): React.ReactElement {
  const [view, setView] = useState<CalendarView>("days");
  const [birthday, setBirthday] = useState("1990-01-15");
  const [weekStart, setWeekStart] = useState<WeekStart>("monday");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [deviceModel, setDeviceModel] = useState(DEFAULT_DEVICE_NAME);
  const [tabletOrientation, setTabletOrientation] = useState<DeviceOrientation>("portrait");
  const [width, setWidth] = useState(1179);
  const [height, setHeight] = useState(2556);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalStart, setGoalStart] = useState("2026-01-01");
  const [goalEnd, setGoalEnd] = useState("2026-12-31");
  const [accentColor, setAccentColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [dotColor, setDotColor] = useState("");
  const [imageAdjustments, setImageAdjustments] = useState(createDefaultImageAdjustments);
  const [copied, setCopied] = useState(false);
  const [loadedImageSrc, setLoadedImageSrc] = useState("");
  const [origin, setOrigin] = useState("");
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    frameWidth: number;
    frameHeight: number;
  } | null>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const showWeekStart = WEEK_START_VIEWS.includes(view);
  const selectedDevice = useMemo(() => findScreenResolution(deviceModel), [deviceModel]);
  const isTabletPreview = selectedDevice?.deviceType === "tablet";
  const activeAdjustmentOrientation: DeviceOrientation = isTabletPreview
    ? tabletOrientation
    : "portrait";
  const imageAdjustment = imageAdjustments[activeAdjustmentOrientation];

  const baseQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("view", view);
    params.set("theme", theme);

    if (showWeekStart) {
      params.set("weekStart", weekStart);
    }
    if (view === "life") {
      params.set("birthday", birthday);
    }
    if (view === "goal") {
      params.set("goalStart", goalStart);
      params.set("goalEnd", goalEnd);
      if (goalTitle) params.set("goalTitle", goalTitle);
    }
    if (accentColor) params.set("accent", accentColor);
    if (bgColor) params.set("bg", bgColor);
    if (dotColor) params.set("dot", dotColor);

    return params.toString();
  }, [
    view,
    birthday,
    weekStart,
    theme,
    goalStart,
    goalEnd,
    goalTitle,
    showWeekStart,
    accentColor,
    bgColor,
    dotColor,
  ]);

  const queryString = useMemo(() => {
    return buildAdjustedWallpaperQueryString(baseQueryString, imageAdjustment);
  }, [baseQueryString, imageAdjustment]);

  const previewImageSrc = buildWallpaperImagePath(width, height, baseQueryString);
  const wallpaperImageSrc = buildWallpaperImagePath(width, height, queryString);
  const apiUrl = buildAbsoluteWallpaperUrl(origin, wallpaperImageSrc);
  const hasAbsoluteApiUrl = apiUrl.length > 0;
  const tabletWallpaperUrls = useMemo(() => {
    if (!origin || !selectedDevice || selectedDevice.deviceType !== "tablet") {
      return null;
    }

    const portraitResolution = getOrientedResolution(selectedDevice, "portrait");
    const landscapeResolution = getOrientedResolution(selectedDevice, "landscape");
    const portraitQueryString = buildAdjustedWallpaperQueryString(
      baseQueryString,
      imageAdjustments.portrait,
    );
    const landscapeQueryString = buildAdjustedWallpaperQueryString(
      baseQueryString,
      imageAdjustments.landscape,
    );

    return {
      portrait: buildAbsoluteWallpaperUrl(
        origin,
        buildWallpaperImagePath(
          portraitResolution.width,
          portraitResolution.height,
          portraitQueryString,
        ),
      ),
      landscape: buildAbsoluteWallpaperUrl(
        origin,
        buildWallpaperImagePath(
          landscapeResolution.width,
          landscapeResolution.height,
          landscapeQueryString,
        ),
      ),
    };
  }, [baseQueryString, imageAdjustments, origin, selectedDevice]);
  const previewDeviceLabel = deviceModel === "Custom" ? "Custom Resolution" : deviceModel;
  const selectedViewOption = VIEW_OPTIONS.find((option) => option.value === view);
  const hasLoadedPreview = loadedImageSrc.length > 0;
  const imageRefreshing = hasLoadedPreview && loadedImageSrc !== previewImageSrc;
  const defaultAccentColor = theme === "light" ? "#F97316" : "#F56B3F";
  const defaultBgColor = theme === "light" ? "#F5F5F7" : "#1A1A1A";
  const autoDotColor = getAutoDotColor(theme, bgColor);
  const accentPickerColor = resolvePickerColor(accentColor, defaultAccentColor);
  const bgPickerColor = resolvePickerColor(bgColor, defaultBgColor);
  const dotPickerColor = resolvePickerColor(dotColor, autoDotColor);
  const previewImageTransform = getPreviewImageTransform({
    x: imageAdjustment.offsetX,
    y: imageAdjustment.offsetY,
    scale: imageAdjustment.scale,
  });

  useEffect(() => {
    const previewImage = previewImageRef.current;
    if (
      previewImage?.complete &&
      previewImage.naturalWidth > 0 &&
      previewImage.getAttribute("src") === previewImageSrc
    ) {
      setLoadedImageSrc(previewImageSrc);
    }
  }, [previewImageSrc]);

  const handleDeviceChange = (value: string) => {
    setDeviceModel(value);
    const preset = findScreenResolution(value);
    if (!preset || preset.deviceType === "custom") {
      return;
    }

    const nextOrientation = preset.deviceType === "tablet" ? "portrait" : tabletOrientation;
    const nextResolution = getOrientedResolution(preset, nextOrientation);
    setTabletOrientation(nextOrientation);
    setWidth(nextResolution.width);
    setHeight(nextResolution.height);
  };

  const handleTabletOrientationChange = (orientation: DeviceOrientation) => {
    setTabletOrientation(orientation);

    if (!selectedDevice || selectedDevice.deviceType !== "tablet") {
      return;
    }

    const nextResolution = getOrientedResolution(selectedDevice, orientation);
    setWidth(nextResolution.width);
    setHeight(nextResolution.height);
  };

  const handleCopy = async () => {
    if (!hasAbsoluteApiUrl) {
      return;
    }

    await navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCustomColors = !!(accentColor || bgColor || dotColor);
  const hasImageAdjustments =
    imageAdjustment.offsetX !== 0 || imageAdjustment.offsetY !== 0 || imageAdjustment.scale !== 100;
  const updateImageAdjustment = (partial: Partial<ImageAdjustment>) => {
    setImageAdjustments((currentAdjustments) => {
      const currentAdjustment = currentAdjustments[activeAdjustmentOrientation];
      const nextAdjustment = { ...currentAdjustment, ...partial };

      if (
        currentAdjustment.offsetX === nextAdjustment.offsetX &&
        currentAdjustment.offsetY === nextAdjustment.offsetY &&
        currentAdjustment.scale === nextAdjustment.scale
      ) {
        return currentAdjustments;
      }

      return {
        ...currentAdjustments,
        [activeAdjustmentOrientation]: nextAdjustment,
      };
    });
  };
  const handlePreviewPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const frame = event.currentTarget;
    const rect = frame.getBoundingClientRect();
    dragStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: imageAdjustment.offsetX,
      offsetY: imageAdjustment.offsetY,
      frameWidth: rect.width,
      frameHeight: rect.height,
    };
    try {
      frame.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events used by tests may not have an active pointer capture target.
    }
  };

  const handlePreviewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    const nextX = clampNumber(
      Math.round(
        dragStart.offsetX + ((event.clientX - dragStart.startX) / dragStart.frameWidth) * 100,
      ),
      POSITION_OFFSET_RANGE.min,
      POSITION_OFFSET_RANGE.max,
    );
    const nextY = clampNumber(
      Math.round(
        dragStart.offsetY + ((event.clientY - dragStart.startY) / dragStart.frameHeight) * 100,
      ),
      POSITION_OFFSET_RANGE.min,
      POSITION_OFFSET_RANGE.max,
    );

    updateImageAdjustment({ offsetX: nextX, offsetY: nextY });
  };

  const handlePreviewPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current?.pointerId === event.pointerId) {
      dragStartRef.current = null;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-dynamic-screen relative">
        {/* Background dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0 md:fixed" />
        <div className="from-background/0 via-background/60 to-background pointer-events-none absolute inset-0 bg-gradient-to-b md:fixed" />

        {/* Hero */}
        <motion.header
          className="relative px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto max-w-2xl">
            <h1 className="font-mono text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Life Calendar
            </h1>
            <div className="bg-primary mx-auto mt-5 h-0.5 w-10 rounded-full" />
            <p className="text-muted-foreground mx-auto mt-5 max-w-md text-base md:text-lg">
              Visualize your life in dots. Generate dynamic calendar wallpapers that update daily.
            </p>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div
            className={cn(
              "grid gap-8 lg:items-stretch lg:gap-10",
              isTabletPreview
                ? "lg:grid-cols-[minmax(28rem,34rem)_minmax(0,1fr)] xl:grid-cols-[minmax(30rem,36rem)_minmax(0,1fr)]"
                : "lg:grid-cols-[minmax(19.5rem,22.5rem)_minmax(0,1fr)] xl:grid-cols-[minmax(20rem,23rem)_minmax(0,1fr)]",
            )}
          >
            {/* Preview */}
            <motion.div
              className="order-2 flex justify-center lg:sticky lg:top-8 lg:order-1 lg:self-start"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <section
                className={cn(
                  "glass relative w-full max-w-none overflow-hidden rounded-[2rem] p-4 sm:p-5 lg:p-5",
                  isTabletPreview
                    ? "lg:max-w-[34rem] lg:rounded-[1.75rem] xl:max-w-[36rem]"
                    : "lg:max-w-[22.5rem] lg:rounded-[2.25rem] xl:max-w-[23rem]",
                )}
              >
                <div className="from-primary/12 via-primary/[0.05] pointer-events-none absolute inset-x-8 top-0 h-28 bg-gradient-to-b to-transparent blur-3xl" />
                <div className="relative mb-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="section-label">Wallpaper Preview</p>
                    <p className="text-foreground/90 mt-1 truncate text-sm font-medium">
                      {previewDeviceLabel}
                    </p>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                      {width} x {height}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!hasAbsoluteApiUrl}
                    className="h-8 rounded-full px-3 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-3.5 w-3.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative flex justify-center">
                  <div
                    className={cn(
                      "border-border/70 relative w-full cursor-grab touch-none overflow-hidden border bg-black shadow-[0_30px_90px_-45px_rgba(0,0,0,0.95)] select-none active:cursor-grabbing",
                      isTabletPreview
                        ? "max-w-[min(100%,30rem)] rounded-[1.5rem] lg:max-w-[27rem] xl:max-w-[29rem]"
                        : "max-w-[min(100%,20.5rem)] rounded-[2rem] lg:max-w-[19.75rem] xl:max-w-[20rem]",
                    )}
                    style={{
                      aspectRatio: `${width} / ${height}`,
                      backgroundColor: bgPickerColor,
                    }}
                    onPointerDown={handlePreviewPointerDown}
                    onPointerMove={handlePreviewPointerMove}
                    onPointerUp={handlePreviewPointerEnd}
                    onPointerCancel={handlePreviewPointerEnd}
                  >
                    {!hasLoadedPreview && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
                        <div className="max-w-[15rem] space-y-2">
                          <p className="text-foreground/90 text-sm font-medium">Live preview</p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Your wallpaper preview appears here and updates after you change the
                            settings.
                          </p>
                        </div>
                      </div>
                    )}
                    <AnimatePresence>
                      {imageRefreshing && (
                        <motion.div
                          className="bg-muted/50 absolute inset-0 z-10 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <img
                      ref={previewImageRef}
                      src={previewImageSrc}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="absolute inset-0 block h-full w-full object-cover"
                      style={{
                        transform: previewImageTransform,
                        transformOrigin: "center",
                      }}
                      fetchPriority="high"
                      loading="eager"
                      onLoad={() => setLoadedImageSrc(previewImageSrc)}
                      onError={() => setLoadedImageSrc(previewImageSrc)}
                    />
                  </div>
                </div>

                <div className="mt-4 lg:hidden">
                  <p className="section-label mb-2">Wallpaper Link</p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={apiUrl}
                      placeholder="Preparing absolute URL..."
                      className="min-w-0 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      aria-label="Copy wallpaper link"
                      disabled={!hasAbsoluteApiUrl}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </section>
            </motion.div>

            {/* Configuration */}
            <motion.div
              className="order-1 space-y-5 lg:order-2 lg:flex lg:h-full lg:flex-col lg:justify-between lg:gap-5 lg:space-y-0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Calendar Type */}
              <section className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Calendar Type</p>
                <Select value={view} onValueChange={(v) => setView(v as CalendarView)}>
                  <SelectTrigger className="w-full sm:w-fit">
                    <SelectValue>{selectedViewOption?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {VIEW_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {opt.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground max-w-md pt-2 text-sm">
                  {selectedViewOption?.description}. The preview and wallpaper link update
                  instantly.
                </p>

                <AnimatePresence mode="wait">
                  {view === "life" && (
                    <motion.div
                      key="life"
                      className="overflow-hidden"
                      variants={FADE_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.2 }}
                    >
                      <DatePickerField
                        id="birthday"
                        label="Birthday"
                        value={birthday}
                        onChange={setBirthday}
                        className="pt-4"
                      />
                    </motion.div>
                  )}

                  {view === "goal" && (
                    <motion.div
                      key="goal"
                      className="overflow-hidden"
                      variants={FADE_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid gap-3 pt-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
                        <div className="space-y-2 lg:min-w-0">
                          <Label htmlFor="goalTitle">Goal Title</Label>
                          <Input
                            id="goalTitle"
                            type="text"
                            placeholder="e.g. New York City Marathon"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-3 lg:contents">
                          <DatePickerField
                            id="goalStart"
                            label="Start Date"
                            value={goalStart}
                            onChange={setGoalStart}
                            className="lg:min-w-0"
                          />
                          <DatePickerField
                            id="goalEnd"
                            label="End Date"
                            value={goalEnd}
                            onChange={setGoalEnd}
                            className="lg:min-w-0"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Appearance */}
              <section className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Appearance</p>

                <div className={`grid gap-4 ${showWeekStart ? "grid-cols-2" : "grid-cols-1"}`}>
                  {showWeekStart && (
                    <div className="space-y-2">
                      <Label>Week Start</Label>
                      <Select value={weekStart} onValueChange={(v) => setWeekStart(v as WeekStart)}>
                        <SelectTrigger className="w-full sm:w-fit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={(v) => setTheme(v as "dark" | "light")}>
                      <SelectTrigger className="w-full sm:w-fit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Custom Colors</Label>
                    <div className="flex min-h-7 min-w-[4.75rem] items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasCustomColors}
                        tabIndex={hasCustomColors ? 0 : -1}
                        aria-hidden={!hasCustomColors}
                        className={`h-7 gap-1 text-xs transition-opacity ${
                          hasCustomColors ? "opacity-100" : "pointer-events-none opacity-0"
                        }`}
                        onClick={() => {
                          setAccentColor("");
                          setBgColor("");
                          setDotColor("");
                        }}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ColorControl
                      id="accentColor"
                      label="Accent"
                      pickerValue={accentPickerColor}
                      textPlaceholder={defaultAccentColor}
                      textValue={accentColor}
                      onPickerChange={setAccentColor}
                      onTextChange={setAccentColor}
                    />
                    <ColorControl
                      id="backgroundColor"
                      label="Background"
                      pickerValue={bgPickerColor}
                      textPlaceholder={defaultBgColor}
                      textValue={bgColor}
                      onPickerChange={setBgColor}
                      onTextChange={setBgColor}
                    />
                    <ColorControl
                      id="dotColor"
                      label="Dots"
                      pickerValue={dotPickerColor}
                      textPlaceholder="auto"
                      textValue={dotColor}
                      onPickerChange={setDotColor}
                      onTextChange={setDotColor}
                    />
                  </div>
                </div>
              </section>

              {/* Display */}
              <section className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Display</p>
                <div className="space-y-3">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,16rem)_1fr] lg:items-end lg:gap-6">
                    <div className="space-y-2">
                      <Label>Device</Label>
                      <DeviceResolutionPicker
                        value={deviceModel}
                        onValueChange={handleDeviceChange}
                      />
                    </div>
                    <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-end">
                      <p className="text-muted-foreground text-sm">Output resolution</p>
                      <p className="text-foreground/85 font-mono text-lg leading-none">
                        {width} x {height}
                      </p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isTabletPreview && (
                      <motion.div
                        className="overflow-hidden"
                        variants={FADE_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-2 pt-1">
                          <Label>Orientation</Label>
                          <div className="border-input bg-input/30 inline-flex w-full rounded-md border p-1 shadow-xs sm:w-fit">
                            {(["portrait", "landscape"] as const).map((orientation) => (
                              <Button
                                key={orientation}
                                type="button"
                                variant={tabletOrientation === orientation ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => handleTabletOrientationChange(orientation)}
                                className="flex-1 capitalize sm:flex-none"
                              >
                                {orientation}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between gap-3">
                      <Label>Image Position</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!hasImageAdjustments}
                        tabIndex={hasImageAdjustments ? 0 : -1}
                        aria-hidden={!hasImageAdjustments}
                        className={cn(
                          "h-7 gap-1 text-xs transition-opacity",
                          hasImageAdjustments ? "opacity-100" : "pointer-events-none opacity-0",
                        )}
                        onClick={() => {
                          updateImageAdjustment(DEFAULT_IMAGE_ADJUSTMENT);
                        }}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Size</span>
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">
                            {imageAdjustment.scale}%
                          </span>
                        </div>
                        <Slider
                          min={IMAGE_SCALE_RANGE.min}
                          max={IMAGE_SCALE_RANGE.max}
                          step={IMAGE_SCALE_RANGE.step}
                          value={[imageAdjustment.scale]}
                          onValueChange={([value]) => updateImageAdjustment({ scale: value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Horizontal</span>
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">
                            {imageAdjustment.offsetX > 0 ? "+" : ""}
                            {imageAdjustment.offsetX}%
                          </span>
                        </div>
                        <Slider
                          min={POSITION_OFFSET_RANGE.min}
                          max={POSITION_OFFSET_RANGE.max}
                          step={POSITION_OFFSET_RANGE.step}
                          value={[imageAdjustment.offsetX]}
                          onValueChange={([value]) => updateImageAdjustment({ offsetX: value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">Vertical</span>
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">
                            {imageAdjustment.offsetY > 0 ? "+" : ""}
                            {imageAdjustment.offsetY}%
                          </span>
                        </div>
                        <Slider
                          min={POSITION_OFFSET_RANGE.min}
                          max={POSITION_OFFSET_RANGE.max}
                          step={POSITION_OFFSET_RANGE.step}
                          value={[imageAdjustment.offsetY]}
                          onValueChange={([value]) => updateImageAdjustment({ offsetY: value })}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm lg:hidden">
                    Output resolution:{" "}
                    <span className="text-foreground/85 font-mono">
                      {width} x {height}
                    </span>
                  </p>
                </div>

                <AnimatePresence>
                  {deviceModel === "Custom" && (
                    <motion.div
                      className="overflow-hidden"
                      variants={FADE_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="width">Width</Label>
                          <Input
                            id="width"
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* API URL */}
              <section className="glass hidden rounded-2xl p-5 lg:block">
                <p className="section-label mb-3">Your Wallpaper URL</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={apiUrl}
                    placeholder="Preparing absolute URL..."
                    className="min-w-0 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    aria-label="Copy wallpaper link"
                    disabled={!hasAbsoluteApiUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </section>
            </motion.div>
          </div>

          {/* Setup Guide */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <SetupGuide apiUrl={apiUrl} tabletWallpaperUrls={tabletWallpaperUrls} />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-border/50 relative mt-12 border-t">
          <div className="via-primary/45 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
          <div
            className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 pt-6 text-center"
            style={{ paddingBottom: "calc(1.75rem + var(--safe-area-bottom))" }}
          >
            <p className="text-foreground text-sm font-medium">Life Calendar</p>
            <p className="text-muted-foreground text-sm">
              Dynamic wallpapers that stay in sync with your timeline.
            </p>
            <p className="text-muted-foreground max-w-md text-sm">
              This is an open-source project{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border/70 bg-background/55 text-foreground hover:bg-accent inline-flex translate-y-[-0.04em] items-center gap-1 rounded-full border px-2 py-0.5 align-middle text-[0.8125rem] font-medium transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
              , where you can browse the code, report issues, or contribute improvements.
            </p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
