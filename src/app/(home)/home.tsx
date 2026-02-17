"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Copy, Check, Loader2 } from "lucide-react";
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
    params.set("width", String(width));
    params.set("height", String(height));

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

  const imageSrc = `/api/og?${queryString}`;
  const apiUrl = `${origin}/api/og?${queryString}`;

  const handlePhoneChange = useCallback((value: string) => {
    setPhoneModel(value);
    if (value !== "Custom") {
      const preset = SCREEN_RESOLUTIONS.find((r) => r.name === value);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
      }
    }
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [apiUrl]);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">Life Calendar</h1>
          <p className="text-muted-foreground mt-2">Minimalist wallpapers for mindful living.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Calendar Type</Label>
                <Select value={view} onValueChange={(v) => setView(v as CalendarView)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIEW_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {view === "life" && (
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
              )}

              {view === "goal" && (
                <div className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
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
              )}

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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Custom Colors</Label>
                  {(accentColor || bgColor || dotColor) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAccentColor("");
                        setBgColor("");
                        setDotColor("");
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Accent</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={accentColor || "#F56B3F"}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer p-1"
                      />
                      <Input
                        type="text"
                        placeholder="#F56B3F"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Background</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={bgColor || "#1A1A1A"}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer p-1"
                      />
                      <Input
                        type="text"
                        placeholder="#1A1A1A"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dots</Label>
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={dotColor || "#404040"}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer p-1"
                      />
                      <Input
                        type="text"
                        placeholder="auto"
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {view === "months" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Dot Scale</Label>
                    <span className="text-muted-foreground text-sm">{scale.toFixed(1)}x</span>
                  </div>
                  <Slider
                    min={0.8}
                    max={2}
                    step={0.1}
                    value={[scale]}
                    onValueChange={([v]) => setScale(v)}
                  />
                </div>
              )}

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

              {phoneModel === "Custom" && (
                <div className="grid grid-cols-2 gap-4">
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
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-border relative mx-auto overflow-hidden rounded-[2rem] border-2"
                style={{ aspectRatio: `${width} / ${height}`, maxHeight: "500px" }}
              >
                {imageLoading && (
                  <div className="bg-muted/50 absolute inset-0 z-10 flex items-center justify-center">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                  </div>
                )}
                <img
                  src={imageSrc}
                  alt="Calendar preview"
                  className="h-full w-full object-contain"
                  onLoadStart={() => setImageLoading(true)}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>

              <div className="space-y-2">
                <Label>API URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={apiUrl} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <SetupGuide apiUrl={apiUrl} />
        </div>

        <footer className="text-muted-foreground mt-12 text-center text-sm">Made with care</footer>
      </div>
    </div>
  );
}
