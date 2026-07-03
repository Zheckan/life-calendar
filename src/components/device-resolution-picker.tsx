"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  findScreenResolution,
  searchScreenResolutions,
  type ScreenResolution,
} from "@/lib/screen-resolutions";
import { cn } from "@/lib/utils";

interface DeviceResolutionPickerProps {
  value: string;
  onValueChange: (value: string) => void;
}

function getDeviceTypeLabel(deviceType: ScreenResolution["deviceType"]): string {
  switch (deviceType) {
    case "custom":
      return "Custom";
    case "phone":
    default:
      return "Phone";
  }
}

export function DeviceResolutionPicker({
  value,
  onValueChange,
}: DeviceResolutionPickerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = findScreenResolution(value);
  const results = useMemo(() => searchScreenResolutions(query), [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = (resolution: ScreenResolution): void => {
    onValueChange(resolution.name);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-input bg-input/30 hover:bg-input/30 dark:bg-input/30 dark:hover:bg-input/30 h-auto min-h-9 w-full justify-between rounded-md px-3 py-2 text-left font-normal shadow-xs focus-visible:ring-inset lg:w-[16rem]"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {selected?.name ?? "Select phone"}
            </span>
            {selected && (
              <span className="text-muted-foreground mt-0.5 block truncate font-mono text-xs">
                {selected.width} x {selected.height}
              </span>
            )}
          </span>
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="border-border/70 bg-popover/95 w-[min(calc(100vw-2rem),24rem)] rounded-xl p-0 shadow-2xl backdrop-blur-xl"
      >
        <div className="border-border/70 border-b p-3">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search phones or resolutions..."
              autoFocus
              className="pl-9"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {results.length > 0 ? (
            results.map((resolution) => {
              const selectedResult = resolution.name === value;
              return (
                <button
                  key={resolution.name}
                  type="button"
                  onClick={() => handleSelect(resolution)}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors outline-none",
                    selectedResult && "bg-accent/70",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{resolution.name}</span>
                    <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                      {resolution.category ?? getDeviceTypeLabel(resolution.deviceType)} ·{" "}
                      {getDeviceTypeLabel(resolution.deviceType)}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-right font-mono text-xs">
                    {resolution.width} x {resolution.height}
                  </span>
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {selectedResult && <Check className="h-4 w-4" />}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="text-muted-foreground px-3 py-8 text-center text-sm">
              No phones found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
