"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function parseDateValue(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  className,
}: DatePickerFieldProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const selectedDate = React.useMemo(() => parseDateValue(value), [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "border-input bg-input/30 hover:bg-input/30 dark:bg-input/30 dark:hover:bg-input/30 h-9 w-full justify-between rounded-md px-3 text-left font-normal shadow-xs focus-visible:ring-inset",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {selectedDate ? format(selectedDate, "d MMM yyyy") : "Pick a date"}
            </span>
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="border-border/70 bg-popover/95 w-[18rem] rounded-xl p-0 shadow-2xl backdrop-blur-xl"
        >
          <Calendar
            className="mx-auto"
            mode="single"
            selected={selectedDate}
            fixedWeeks
            showOutsideDays
            onSelect={(date) => {
              if (!date) {
                return;
              }

              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
