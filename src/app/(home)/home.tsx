"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
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

const FADE_VARIANTS = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" as const },
};

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
  const [imageLoading, setImageLoading] = useState(false);
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
  const apiUrl = `${origin}/og/${width}x${height}?${queryString}`;

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
    await navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCustomColors = !!(accentColor || bgColor || dotColor);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        {/* Background dot grid */}
        <div className="dot-grid pointer-events-none fixed inset-0" />
        <div className="from-background/0 via-background/60 to-background pointer-events-none fixed inset-0 bg-gradient-to-b" />

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
          <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:items-start lg:gap-12 xl:grid-cols-[380px_1fr]">
            {/* Phone preview */}
            <motion.div
              className="flex justify-center lg:sticky lg:top-8"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative">
                <div className="relative w-[260px] overflow-hidden rounded-[2.8rem] border border-white/10 bg-black/90 p-[3px] shadow-2xl sm:w-[280px]">
                  {/* Dynamic island */}
                  <div className="absolute top-3.5 left-1/2 z-20 h-[16px] w-[72px] -translate-x-1/2 rounded-full bg-black" />

                  {/* Screen */}
                  <div
                    className="relative overflow-hidden rounded-[2.6rem] bg-neutral-900"
                    style={{ aspectRatio: `${width} / ${height}`, maxHeight: "520px" }}
                  >
                    <AnimatePresence>
                      {imageLoading && (
                        <motion.div
                          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <img
                      src={imageSrc}
                      alt="Calendar preview"
                      className="h-full w-full object-contain"
                      onLoadStart={() => setImageLoading(true)}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                  </div>
                </div>

                {/* Ambient glow */}
                <div className="bg-primary/[0.04] absolute -inset-8 -z-10 rounded-[4rem] blur-3xl" />
              </div>
            </motion.div>

            {/* Configuration */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Calendar Type */}
              <section className="glass rounded-2xl p-5">
                <p className="section-label mb-4">Calendar Type</p>
                <Select value={view} onValueChange={(v) => setView(v as CalendarView)}>
                  <SelectTrigger>
                    <SelectValue>{VIEW_OPTIONS.find((o) => o.value === view)?.label}</SelectValue>
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
                        <div className="grid grid-cols-2 gap-3">
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
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Accent</Label>
                      <div className="flex gap-1.5">
                        <Input
                          type="color"
                          value={accentColor || "#F56B3F"}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="h-9 w-11 shrink-0 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          placeholder="#F56B3F"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="min-w-0 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Background</Label>
                      <div className="flex gap-1.5">
                        <Input
                          type="color"
                          value={bgColor || "#1A1A1A"}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-9 w-11 shrink-0 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          placeholder="#1A1A1A"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="min-w-0 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs">Dots</Label>
                      <div className="flex gap-1.5">
                        <Input
                          type="color"
                          value={dotColor || "#404040"}
                          onChange={(e) => setDotColor(e.target.value)}
                          className="h-9 w-11 shrink-0 cursor-pointer p-1"
                        />
                        <Input
                          type="text"
                          placeholder="auto"
                          value={dotColor}
                          onChange={(e) => setDotColor(e.target.value)}
                          className="min-w-0 font-mono text-xs"
                        />
                      </div>
                    </div>
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
                      <div className="space-y-2 pt-5">
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
                      <div className="grid grid-cols-2 gap-3 pt-4">
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
              <section className="glass rounded-2xl p-5">
                <p className="section-label mb-3">Your Wallpaper URL</p>
                <div className="flex gap-2">
                  <Input readOnly value={apiUrl} className="min-w-0 font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <SetupGuide apiUrl={apiUrl} />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-border/50 text-muted-foreground relative border-t py-8 text-center text-sm">
          Made with care
        </footer>
      </div>
    </MotionConfig>
  );
}
