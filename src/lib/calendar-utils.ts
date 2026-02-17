import {
  differenceInWeeks,
  differenceInDays,
  startOfYear,
  startOfWeek,
  endOfYear,
  getDay,
  getDaysInYear,
  getDaysInMonth,
  format,
  isLeapYear as dfnsIsLeapYear,
  startOfMonth,
  addDays,
  isBefore,
  startOfDay,
} from "date-fns";

export type CalendarView = "life" | "days" | "months" | "quarters" | "goal";
export type WeekStart = "monday" | "sunday";
export type DotState = "past" | "current" | "future";

export interface DotData {
  state: DotState;
}

export interface LifeWeeksResult {
  dots: DotData[][];
  currentWeek: number;
  currentYear: number;
  percentLived: number;
}

export interface DaysDotsResult {
  dots: DotData[][];
  daysElapsed: number;
  daysLeft: number;
  percentElapsed: number;
}

export interface MonthGrid {
  name: string;
  dots: (DotData | null)[][];
}

export interface YearByMonthResult {
  months: MonthGrid[];
  daysElapsed: number;
  daysLeft: number;
  percentElapsed: number;
}

export interface QuarterGrid {
  name: string;
  dots: (DotData | null)[][];
}

export interface QuarterResult {
  quarters: QuarterGrid[];
  daysElapsed: number;
  daysLeft: number;
  percentElapsed: number;
}

export interface GoalDotsResult {
  dots: DotData[][];
  daysLeft: number;
  percentElapsed: number;
}

export function isLeapYear(year: number): boolean {
  return dfnsIsLeapYear(new Date(year, 0, 1));
}

export function getDayOfYear(date: Date): number {
  const start = startOfYear(date);
  return differenceInDays(date, start) + 1;
}

export function getWeekNumber(date: Date, weekStart: WeekStart): number {
  const yearStart = startOfYear(date);
  const weekOptions = { weekStartsOn: (weekStart === "monday" ? 1 : 0) as 0 | 1 };
  const firstWeekStart = startOfWeek(yearStart, weekOptions);
  return Math.floor(differenceInDays(date, firstWeekStart) / 7);
}

function pct1(numerator: number, denominator: number): number {
  return Math.min(100, parseFloat(((numerator / denominator) * 100).toFixed(1)));
}

export function getLifeWeeks(birthday: Date, lifespan: number = 90): LifeWeeksResult {
  const today = startOfDay(new Date());
  const bday = startOfDay(birthday);
  const totalWeeksLived = Math.max(0, differenceInWeeks(today, bday));
  const currentYearIndex = Math.floor(totalWeeksLived / 52);
  const currentWeekInYear = totalWeeksLived % 52;
  const totalWeeks = lifespan * 52;
  const percentLived = pct1(totalWeeksLived, totalWeeks);

  const dots: DotData[][] = [];

  for (let year = 0; year < lifespan; year++) {
    const row: DotData[] = [];
    for (let week = 0; week < 52; week++) {
      const weekIndex = year * 52 + week;
      if (weekIndex < totalWeeksLived) {
        row.push({ state: "past" });
      } else if (weekIndex === totalWeeksLived) {
        row.push({ state: "current" });
      } else {
        row.push({ state: "future" });
      }
    }
    dots.push(row);
  }

  return {
    dots,
    currentWeek: currentWeekInYear,
    currentYear: currentYearIndex,
    percentLived,
  };
}

export function getDaysDots(): DaysDotsResult {
  const today = startOfDay(new Date());
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const totalDays = getDaysInYear(today);
  const daysElapsed = differenceInDays(today, yearStart);
  const daysLeft = differenceInDays(yearEnd, today);
  const percentElapsed = pct1(daysElapsed, totalDays);

  const cols = 15;
  const rows = Math.ceil(totalDays / cols);
  const dots: DotData[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: DotData[] = [];
    for (let c = 0; c < cols; c++) {
      const dayIndex = r * cols + c;
      if (dayIndex >= totalDays) break;
      const date = addDays(yearStart, dayIndex);
      if (isBefore(date, today)) {
        row.push({ state: "past" });
      } else if (differenceInDays(date, today) === 0) {
        row.push({ state: "current" });
      } else {
        row.push({ state: "future" });
      }
    }
    dots.push(row);
  }

  return { dots, daysElapsed, daysLeft, percentElapsed };
}

export function getYearByMonthDots(weekStart: WeekStart): YearByMonthResult {
  const today = startOfDay(new Date());
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const totalDays = getDaysInYear(today);
  const daysElapsed = differenceInDays(today, yearStart);
  const daysLeft = differenceInDays(yearEnd, today);
  const percentElapsed = pct1(daysElapsed, totalDays);

  const months: MonthGrid[] = [];

  for (let month = 0; month < 12; month++) {
    const monthStart = startOfMonth(new Date(today.getFullYear(), month, 1));
    const daysInMonth = getDaysInMonth(monthStart);
    const name = format(monthStart, "MMM");

    const weekOptions = { weekStartsOn: (weekStart === "monday" ? 1 : 0) as 0 | 1 };
    const firstWeekStart = startOfWeek(monthStart, weekOptions);
    const lastDayOfMonth = new Date(today.getFullYear(), month, daysInMonth);
    const totalCols = Math.ceil((differenceInDays(lastDayOfMonth, firstWeekStart) + 1) / 7);

    const dots: (DotData | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: totalCols }, () => null),
    );

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), month, day);
      const daysSinceFirstWeek = differenceInDays(date, firstWeekStart);
      const col = Math.floor(daysSinceFirstWeek / 7);
      const dayOfWeek = getDay(date);
      let row: number;
      if (weekStart === "monday") {
        row = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      } else {
        row = dayOfWeek;
      }

      if (row >= 0 && row < 7 && col >= 0 && col < totalCols) {
        if (isBefore(date, today)) {
          dots[row][col] = { state: "past" };
        } else if (differenceInDays(date, today) === 0) {
          dots[row][col] = { state: "current" };
        } else {
          dots[row][col] = { state: "future" };
        }
      }
    }

    months.push({ name, dots });
  }

  return { months, daysElapsed, daysLeft, percentElapsed };
}

const QUARTER_MONTHS: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
];

export function getQuarterDots(weekStart: WeekStart): QuarterResult {
  const today = startOfDay(new Date());
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);
  const totalDays = getDaysInYear(today);
  const daysElapsed = differenceInDays(today, yearStart);
  const daysLeft = differenceInDays(yearEnd, today);
  const percentElapsed = pct1(daysElapsed, totalDays);

  const quarters: QuarterGrid[] = QUARTER_MONTHS.map((monthIndices, qi) => {
    const name = `Q${qi + 1}`;
    const qStart = new Date(today.getFullYear(), monthIndices[0], 1);
    const lastMonth = monthIndices[2];
    const qEnd = new Date(
      today.getFullYear(),
      lastMonth,
      getDaysInMonth(new Date(today.getFullYear(), lastMonth, 1)),
    );

    const weekOptions = { weekStartsOn: (weekStart === "monday" ? 1 : 0) as 0 | 1 };
    const firstWeekStart = startOfWeek(qStart, weekOptions);
    const totalWeeks = Math.ceil((differenceInDays(qEnd, firstWeekStart) + 1) / 7);

    const dots: (DotData | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: totalWeeks }, () => null),
    );

    let currentDate = qStart;
    while (!isBefore(qEnd, currentDate)) {
      const daysSinceFirstWeek = differenceInDays(currentDate, firstWeekStart);
      const col = Math.floor(daysSinceFirstWeek / 7);
      const dayOfWeek = getDay(currentDate);
      let row: number;
      if (weekStart === "monday") {
        row = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      } else {
        row = dayOfWeek;
      }

      if (row >= 0 && row < 7 && col >= 0 && col < totalWeeks) {
        if (isBefore(currentDate, today)) {
          dots[row][col] = { state: "past" };
        } else if (differenceInDays(currentDate, today) === 0) {
          dots[row][col] = { state: "current" };
        } else {
          dots[row][col] = { state: "future" };
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    return { name, dots };
  });

  return { quarters, daysElapsed, daysLeft, percentElapsed };
}

export function getGoalDots(startDate: Date, deadline: Date): GoalDotsResult {
  const today = startOfDay(new Date());
  const start = startOfDay(startDate);
  const end = startOfDay(deadline);
  const totalDays = Math.max(1, differenceInDays(end, start) + 1);
  const daysElapsedRaw = differenceInDays(today, start);
  const daysElapsed = Math.max(0, Math.min(totalDays, daysElapsedRaw));
  const daysLeft = Math.max(0, differenceInDays(end, today));
  const percentElapsed = pct1(daysElapsed, totalDays);

  const cols = 15;
  const rows = Math.ceil(totalDays / cols);
  const dots: DotData[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: DotData[] = [];
    for (let c = 0; c < cols; c++) {
      const dayIndex = r * cols + c;
      if (dayIndex >= totalDays) break;
      const dotDate = addDays(start, dayIndex);
      if (isBefore(dotDate, today)) {
        row.push({ state: "past" });
      } else if (differenceInDays(dotDate, today) === 0) {
        row.push({ state: "current" });
      } else {
        row.push({ state: "future" });
      }
    }
    dots.push(row);
  }

  return { dots, daysLeft, percentElapsed };
}
