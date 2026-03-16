"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const YEAR_START = 1900;
const YEAR_END = 2100;
const YEAR_OPTIONS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, index) =>
  String(YEAR_START + index),
);

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
  const [displayMonth, setDisplayMonth] = React.useState<Date>(
    () =>
      new Date(
        (selectedDate ?? new Date()).getFullYear(),
        (selectedDate ?? new Date()).getMonth(),
        1,
      ),
  );

  React.useEffect(() => {
    const baseDate = selectedDate ?? new Date();
    setDisplayMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
  }, [selectedDate]);

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
          <div className="border-border/70 flex items-center justify-between border-b px-3 py-2">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
              Jump To Year
            </p>
            <Select
              value={String(displayMonth.getFullYear())}
              onValueChange={(nextYear) => {
                setDisplayMonth(new Date(Number(nextYear), displayMonth.getMonth(), 1));
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-[6.5rem] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end" className="max-h-64">
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            className="mx-auto"
            mode="single"
            month={displayMonth}
            selected={selectedDate}
            fixedWeeks
            showOutsideDays
            formatters={{
              formatCaption: (date) => format(date, "MMMM"),
            }}
            onMonthChange={(month) => {
              setDisplayMonth(new Date(month.getFullYear(), month.getMonth(), 1));
            }}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
