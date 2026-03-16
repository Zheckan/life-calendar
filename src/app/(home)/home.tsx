"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { DesktopColorPicker } from "@/components/color-picker";
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
import { Copy, Check, Loader2, RotateCcw } from "lucide-react";
import { SetupGuide } from "@/components/setup-guide";
import type { CalendarView, WeekStart } from "@/lib/calendar-utils";
import { SCREEN_RESOLUTIONS } from "@/lib/screen-resolutions";

const VIEW_OPTIONS: { value: CalendarView; label: string; description: string }[] = [
  { value: "days", label: "Days", description: "All days of the year" },
  { value: "months", label: "Months", description: "All days of the year grouped by months" },
  { value: "quarters", label: "Quarters", description: "All days of the year grouped by quarters" },
  { value: "life", label: "Life", description: "Weeks of your life" },
  { value: "goal", label: "Goal", description: "Days until a goal deadline" },
];

const WEEK_START_VIEWS: CalendarView[] = ["months", "quarters"];
const HEX_COLOR_RE = /^#[0-9A-F]{6}$/i;

const FADE_VARIANTS = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" as const },
};

function resolvePickerColor(value: string, fallback: string): string {
  return HEX_COLOR_RE.test(value) ? value.toUpperCase() : fallback;
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
  const [phoneModel, setPhoneModel] = useState("iPhone 15 / 15 Pro / 16");
  const [width, setWidth] = useState(1179);
  const [height, setHeight] = useState(2556);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalStart, setGoalStart] = useState("2026-01-01");
  const [goalEnd, setGoalEnd] = useState("2026-12-31");
  const [scale, setScale] = useState(1);
  const [accentColor, setAccentColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [dotColor, setDotColor] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadedImageSrc, setLoadedImageSrc] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const showWeekStart = WEEK_START_VIEWS.includes(view);

  const queryString = useMemo(() => {
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
    if (view === "months" && scale !== 1) {
      params.set("scale", String(scale));
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
    width,
    height,
    goalStart,
    goalEnd,
    goalTitle,
    showWeekStart,
    scale,
    accentColor,
    bgColor,
    dotColor,
  ]);

  const imageSrc = `/og/${width}x${height}?${queryString}`;
  const apiUrl = origin ? `${origin}${imageSrc}` : "";
  const hasAbsoluteApiUrl = apiUrl.length > 0;
  const previewDeviceLabel = phoneModel === "Custom" ? "Custom Resolution" : phoneModel;
  const selectedViewOption = VIEW_OPTIONS.find((option) => option.value === view);
  const imageLoading = loadedImageSrc !== imageSrc;
  const defaultAccentColor = theme === "light" ? "#F97316" : "#F56B3F";
  const defaultBgColor = theme === "light" ? "#F5F5F7" : "#1A1A1A";
  const defaultDotColor = theme === "light" ? "#D1D5DB" : "#404040";
  const accentPickerColor = resolvePickerColor(accentColor, defaultAccentColor);
  const bgPickerColor = resolvePickerColor(bgColor, defaultBgColor);
  const dotPickerColor = resolvePickerColor(dotColor, defaultDotColor);

  const handlePhoneChange = (value: string) => {
    setPhoneModel(value);
    if (value !== "Custom") {
      const preset = SCREEN_RESOLUTIONS.find((r) => r.name === value);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
      }
    }
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
          <div className="grid gap-8 lg:grid-cols-[minmax(19.5rem,22.5rem)_minmax(0,1fr)] lg:items-stretch lg:gap-10 xl:grid-cols-[minmax(20rem,23rem)_minmax(0,1fr)]">
            {/* Preview */}
            <motion.div
              className="order-2 flex justify-center lg:sticky lg:top-8 lg:order-1 lg:self-start"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <section className="glass relative w-full max-w-none overflow-hidden rounded-[2rem] p-4 sm:p-5 lg:max-w-[22.5rem] lg:rounded-[2.25rem] lg:p-5 xl:max-w-[23rem]">
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
                    className="border-border/70 relative w-full max-w-[min(100%,20.5rem)] overflow-hidden rounded-[2rem] border bg-black shadow-[0_30px_90px_-45px_rgba(0,0,0,0.95)] lg:max-w-[19.75rem] xl:max-w-[20rem]"
                    style={{ aspectRatio: `${width} / ${height}` }}
                  >
                    <AnimatePresence>
                      {imageLoading && (
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
                      src={imageSrc}
                      alt="Calendar preview"
                      className="absolute inset-0 block h-full w-full object-cover"
                      fetchPriority="high"
                      loading="eager"
                      onLoad={() => setLoadedImageSrc(imageSrc)}
                      onError={() => setLoadedImageSrc(imageSrc)}
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
                  <SelectTrigger>
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
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="birthday">Birthday</Label>
                        <Input
                          id="birthday"
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                        />
                      </div>
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
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="goalTitle">Goal Title</Label>
                          <Input
                            id="goalTitle"
                            type="text"
                            placeholder="e.g. New York City Marathon"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="goalStart">Start Date</Label>
                            <Input
                              id="goalStart"
                              type="date"
                              value={goalStart}
                              onChange={(e) => setGoalStart(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="goalEnd">End Date</Label>
                            <Input
                              id="goalEnd"
                              type="date"
                              value={goalEnd}
                              onChange={(e) => setGoalEnd(e.target.value)}
                            />
                          </div>
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
                        <SelectTrigger>
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
                      <SelectTrigger>
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
                    {hasCustomColors && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => {
                          setAccentColor("");
                          setBgColor("");
                          setDotColor("");
                        }}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </Button>
                    )}
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

                {/* Dot Scale */}
                <AnimatePresence>
                  {view === "months" && (
                    <motion.div
                      className="overflow-hidden"
                      variants={FADE_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-2 pt-5 pb-2">
                        <div className="flex items-center justify-between">
                          <Label>Dot Scale</Label>
                          <span className="text-muted-foreground text-sm tabular-nums">
                            {scale.toFixed(1)}x
                          </span>
                        </div>
                        <Slider
                          min={0.8}
                          max={2}
                          step={0.1}
                          value={[scale]}
                          onValueChange={([v]) => setScale(v)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Display */}
              <section className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Display</p>
                <div className="space-y-2">
                  <Label>Phone Model</Label>
                  <Select value={phoneModel} onValueChange={handlePhoneChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCREEN_RESOLUTIONS.map((r) => (
                        <SelectItem key={r.name} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground pt-2 text-sm">
                    Output resolution:{" "}
                    <span className="text-foreground/85 font-mono">
                      {width} x {height}
                    </span>
                  </p>
                </div>

                <AnimatePresence>
                  {phoneModel === "Custom" && (
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
            <SetupGuide apiUrl={apiUrl} />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-border/50 relative mt-12 border-t">
          <div className="via-primary/45 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
          <div
            className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 pt-6 text-center"
            style={{ paddingBottom: "calc(1.75rem + var(--safe-area-bottom))" }}
          >
            <p className="text-foreground text-sm font-medium">Life Calendar</p>
            <p className="text-muted-foreground text-sm">
              Dynamic wallpapers that stay in sync with your timeline.
            </p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
