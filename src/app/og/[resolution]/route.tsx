import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { isValid, parseISO, startOfDay } from "date-fns";
import {
  getDaysDots,
  getYearByMonthDots,
  getQuarterDots,
  getGoalDots,
  type CalendarView,
  type WeekStart,
  type DotState,
} from "@/lib/calendar-utils";
import { getAutoDotColor, isValidHexColor } from "@/lib/colors";

interface ThemeColors {
  bg: string;
  past: string;
  current: string;
  future: string;
  text: string;
  highlight: string;
}

function getThemeColors(
  theme: string,
  customAccent: string | null,
  customBg: string | null,
  customDot: string | null,
): ThemeColors {
  const base: ThemeColors =
    theme === "light"
      ? {
          bg: "#F5F5F7",
          past: "#1A1A1A",
          current: "#F97316",
          future: "#D1D5DB",
          text: "#6B7280",
          highlight: "#F97316",
        }
      : {
          bg: "#1A1A1A",
          past: "#FFFFFF",
          current: "#F56B3F",
          future: "#404040",
          text: "#888888",
          highlight: "#F56B3F",
        };

  if (isValidHexColor(customAccent)) {
    base.current = customAccent;
    base.highlight = customAccent;
  }
  if (isValidHexColor(customBg)) {
    base.bg = customBg;
    if (!isValidHexColor(customDot)) {
      base.future = getAutoDotColor(theme, customBg);
    }
  }
  if (isValidHexColor(customDot)) {
    base.future = customDot;
  }

  return base;
}

function getDotColor(state: DotState, colors: ThemeColors): string {
  switch (state) {
    case "past":
      return colors.past;
    case "current":
      return colors.current;
    case "future":
      return colors.future;
  }
}

function parseDateParam(value: string, fallback: string): Date {
  const parsed = parseISO(value);
  if (isValid(parsed)) {
    return parsed;
  }

  return parseISO(fallback);
}

function isValidTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getCurrentDayKeyInTimeZone(timeZone: string): string | null {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function resolveCurrentDate(request: NextRequest): {
  today: Date;
  todayKey: string;
  timeZone: string | null;
} {
  const requestedTimeZone = request.nextUrl.searchParams.get("tz");
  const headerTimeZone = request.headers.get("x-vercel-ip-timezone");
  const timeZone =
    [requestedTimeZone, headerTimeZone].find(
      (value): value is string => !!value && isValidTimeZone(value),
    ) ?? null;

  if (!timeZone) {
    const today = startOfDay(new Date());
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    return { today, todayKey, timeZone: null };
  }

  const todayKey = getCurrentDayKeyInTimeZone(timeZone);
  if (!todayKey) {
    const today = startOfDay(new Date());
    const fallbackKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    return { today, todayKey: fallbackKey, timeZone: null };
  }

  return { today: parseISO(todayKey), todayKey, timeZone };
}

function appendVaryHeader(headers: Headers, value: string): void {
  const existing = headers.get("Vary");
  const varyValues = existing
    ? existing
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

  if (!varyValues.includes(value)) {
    varyValues.push(value);
  }

  headers.set("Vary", varyValues.join(", "));
}

function renderLifeCalendar(
  birthday: string,
  width: number,
  height: number,
  colors: ThemeColors,
  today: Date,
): React.ReactElement {
  const lifespan = 90;
  const bday = parseDateParam(birthday, "1990-01-15");
  const totalWeeksLived = Math.max(
    0,
    Math.floor((today.getTime() - bday.getTime()) / (7 * 24 * 60 * 60 * 1000)),
  );
  const totalWeeks = Math.ceil((lifespan * 365.25) / 7);
  const percentLived = Math.min(100, parseFloat(((totalWeeksLived / totalWeeks) * 100).toFixed(1)));

  const targetCellSize = 18;
  const gridWidth = width * 0.84;
  const cols = Math.floor(gridWidth / targetCellSize);
  const rows = Math.ceil(totalWeeks / cols);

  const cellSize = gridWidth / cols;
  const dotSize = Math.max(2, cellSize * 0.617);
  const gapSize = cellSize - dotSize;

  const grid: { state: "past" | "current" | "future" }[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: { state: "past" | "current" | "future" }[] = [];
    for (let c = 0; c < cols; c++) {
      const weekIndex = r * cols + c;
      if (weekIndex >= totalWeeks) break;
      if (weekIndex < totalWeeksLived) {
        row.push({ state: "past" });
      } else if (weekIndex === totalWeeksLived) {
        row.push({ state: "current" });
      } else {
        row.push({ state: "future" });
      }
    }
    grid.push(row);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        fontFamily: "Inter",
        paddingTop: `${Math.round(height * 0.275)}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {grid.map((row, y) => (
          <div
            key={y}
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: `${gapSize}px`,
            }}
          >
            {row.map((dot, x) => (
              <div
                key={x}
                style={{
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  borderRadius: "50%",
                  backgroundColor: getDotColor(dot.state, colors),
                  marginRight: `${gapSize}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "40px",
          fontSize: "28px",
          color: colors.text,
        }}
      >
        {percentLived}% to {lifespan}
      </div>
    </div>
  );
}

function renderDaysCalendar(
  width: number,
  height: number,
  colors: ThemeColors,
  today: Date,
): React.ReactElement {
  const data = getDaysDots(today);
  const cols = data.dots[0]?.length ?? 15;

  const gridWidth = width * 0.79;
  const cellSize = gridWidth / cols;
  const dotSize = Math.max(4, cellSize * 0.6);
  const gapSize = cellSize - dotSize;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        fontFamily: "Inter",
        paddingTop: `${Math.round(height * 0.155)}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {data.dots.map((row, y) => (
          <div
            key={y}
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: `${gapSize}px`,
            }}
          >
            {row.map((dot, x) => (
              <div
                key={x}
                style={{
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  borderRadius: "50%",
                  backgroundColor: getDotColor(dot.state, colors),
                  marginRight: `${gapSize}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "40px",
          fontSize: "36px",
          color: colors.text,
        }}
      >
        <span style={{ color: colors.highlight }}>{data.daysLeft}d left</span>
        <span style={{ marginLeft: "12px", marginRight: "12px" }}>&middot;</span>
        <span>{data.percentElapsed}%</span>
      </div>
    </div>
  );
}

function renderYearByMonth(
  weekStart: WeekStart,
  scale: number,
  width: number,
  height: number,
  colors: ThemeColors,
  today: Date,
): React.ReactElement {
  const data = getYearByMonthDots(weekStart, today);
  const monthsPerRow = 3;

  const cellWidth = width * 0.85;
  const monthWidth = cellWidth / monthsPerRow;
  const dotSize = Math.max(4, Math.min((monthWidth * 0.7) / 7, 17 * scale));
  const gapSize = Math.max(3, dotSize * 0.88);
  const rowGap = dotSize * 0.88;
  const quarterRowPitch = Math.round(8 * (dotSize + rowGap));
  const monthGap = Math.round(47 * scale);

  const basePad = height * 0.117;
  const baseDotSize = Math.max(4, Math.min((monthWidth * 0.7) / 7, 17));
  const baseRowGap = baseDotSize * 0.88;
  const baseQRP = Math.round(8 * (baseDotSize + baseRowGap));
  const lastRowMaxWeeks = Math.max(...data.months.slice(9, 12).map((m) => m.dots[0].length));
  const monthLabelHeight = 40;
  const baseContentHeight =
    3 * baseQRP + monthLabelHeight + lastRowMaxWeeks * (baseDotSize + baseRowGap) + 82 + 36;
  const paddingTop = Math.round(basePad + Math.max(0, (height - basePad - baseContentHeight) / 2));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        fontFamily: "Inter",
        paddingTop: `${paddingTop}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {Array.from({ length: 4 }, (_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: `${monthGap}px`,
              ...(rowIdx < 3 ? { height: `${quarterRowPitch}px` } : {}),
            }}
          >
            {data.months.slice(rowIdx * monthsPerRow, (rowIdx + 1) * monthsPerRow).map((month) => {
              const weekdayCount = month.dots.length;
              const weekCount = month.dots[0].length;
              return (
                <div
                  key={month.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      color: colors.text,
                      marginBottom: "10px",
                    }}
                  >
                    {month.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {Array.from({ length: weekCount }, (_, weekIdx) => (
                      <div
                        key={weekIdx}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: `${gapSize}px`,
                          marginBottom: `${rowGap}px`,
                        }}
                      >
                        {Array.from({ length: weekdayCount }, (_, dayIdx) => {
                          const dot = month.dots[dayIdx][weekIdx];
                          return (
                            <div
                              key={dayIdx}
                              style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                borderRadius: "50%",
                                backgroundColor: dot
                                  ? getDotColor(dot.state, colors)
                                  : "transparent",
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "82px",
          fontSize: "36px",
          color: colors.text,
        }}
      >
        <span style={{ color: colors.highlight }}>{data.daysLeft}d left</span>
        <span style={{ marginLeft: "14px", marginRight: "14px" }}>&middot;</span>
        <span>{data.percentElapsed}%</span>
      </div>
    </div>
  );
}

function renderQuarterCalendar(
  weekStart: WeekStart,
  width: number,
  height: number,
  colors: ThemeColors,
  today: Date,
): React.ReactElement {
  const data = getQuarterDots(weekStart, today);

  const cellWidth = width * 0.85;
  const quarterWidth = cellWidth / 2;
  const dotSize = Math.max(4, Math.min((quarterWidth * 0.7) / 7, 25));
  const gapSize = Math.max(2, dotSize * 0.88);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        fontFamily: "Inter",
        paddingTop: `${Math.round(height * 0.138)}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {Array.from({ length: 2 }, (_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: `${Math.round(dotSize * 3.2)}px`,
              ...(rowIdx < 1 ? { marginBottom: `${Math.round(dotSize * 1.6)}px` } : {}),
            }}
          >
            {data.quarters.slice(rowIdx * 2, (rowIdx + 1) * 2).map((quarter) => {
              const weekdayCount = quarter.dots.length;
              const weekCount = quarter.dots[0].length;
              return (
                <div
                  key={quarter.name}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      color: colors.text,
                      marginRight: "12px",
                      lineHeight: `${dotSize}px`,
                    }}
                  >
                    {quarter.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {Array.from({ length: weekCount }, (_, weekIdx) => (
                      <div
                        key={weekIdx}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: `${gapSize}px`,
                          marginBottom: `${gapSize}px`,
                        }}
                      >
                        {Array.from({ length: weekdayCount }, (_, dayIdx) => {
                          const dot = quarter.dots[dayIdx][weekIdx];
                          return (
                            <div
                              key={dayIdx}
                              style={{
                                width: `${dotSize}px`,
                                height: `${dotSize}px`,
                                borderRadius: "50%",
                                backgroundColor: dot
                                  ? getDotColor(dot.state, colors)
                                  : "transparent",
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "50px",
          fontSize: "36px",
          color: colors.text,
        }}
      >
        <span style={{ color: colors.highlight }}>{data.daysLeft}d left</span>
        <span style={{ marginLeft: "14px", marginRight: "14px" }}>&middot;</span>
        <span>{data.percentElapsed}%</span>
      </div>
    </div>
  );
}

function renderGoalCalendar(
  goalStart: Date,
  goalEnd: Date,
  goalTitle: string,
  width: number,
  colors: ThemeColors,
  today: Date,
): React.ReactElement {
  const data = getGoalDots(goalStart, goalEnd, today);
  const cols = data.dots[0]?.length ?? 15;
  const titleText = goalTitle.trim() || "Goal";

  const gridWidth = width * 0.79;
  const cellSize = gridWidth / cols;
  const dotSize = Math.max(4, cellSize * 0.6);
  const gapSize = cellSize - dotSize;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          fontSize: `${Math.min(36, Math.max(16, Math.floor((width / titleText.length) * 1.2)))}px`,
          color: colors.text,
          marginBottom: "40px",
          maxWidth: `${width * 0.85}px`,
          textAlign: "center" as const,
          overflow: "hidden",
        }}
      >
        {titleText}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {data.dots.map((row, y) => (
          <div
            key={y}
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: `${gapSize}px`,
            }}
          >
            {row.map((dot, x) => (
              <div
                key={x}
                style={{
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  borderRadius: "50%",
                  backgroundColor: getDotColor(dot.state, colors),
                  marginRight: `${gapSize}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "40px",
          fontSize: "36px",
          color: colors.text,
        }}
      >
        {data.status === "upcoming" ? (
          <span style={{ color: colors.highlight }}>{data.daysUntilStart}d to start</span>
        ) : (
          <>
            <span style={{ color: colors.highlight }}>{data.daysLeft}d left</span>
            <span style={{ marginLeft: "14px", marginRight: "14px" }}>&middot;</span>
            <span>{data.percentElapsed}%</span>
          </>
        )}
      </div>
    </div>
  );
}

const interFont = fetch(
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
).then((res) => res.arrayBuffer());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resolution: string }> },
): Promise<ImageResponse | Response> {
  const { resolution } = await params;
  const parts = resolution.split("x");

  if (parts.length !== 2) {
    return new Response("Invalid resolution format. Use WIDTHxHEIGHT (e.g., 1179x2556)", {
      status: 400,
    });
  }

  const width = parseInt(parts[0], 10);
  const height = parseInt(parts[1], 10);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return new Response("Invalid resolution. Width and height must be positive integers.", {
      status: 400,
    });
  }

  const { searchParams } = request.nextUrl;

  const view = (searchParams.get("view") || "days") as CalendarView;
  const birthday = searchParams.get("birthday") || "1990-01-15";
  const weekStart = (searchParams.get("weekStart") || "monday") as WeekStart;
  const goalStart = searchParams.get("goalStart") || "2026-01-01";
  const goalEnd = searchParams.get("goalEnd") || "2026-12-31";
  const goalTitle = searchParams.get("goalTitle") || "Goal";
  const theme = searchParams.get("theme") || "dark";
  const scale = parseFloat(searchParams.get("scale") || "1");
  const accent = searchParams.get("accent");
  const bg = searchParams.get("bg");
  const dot = searchParams.get("dot");
  const goalStartDate = parseDateParam(goalStart, "2026-01-01");
  const goalEndDate = parseDateParam(goalEnd, "2026-12-31");
  const { today, todayKey, timeZone } = resolveCurrentDate(request);

  const colors = getThemeColors(theme, accent, bg, dot);

  let content: React.ReactElement;

  switch (view) {
    case "life":
      content = renderLifeCalendar(birthday, width, height, colors, today);
      break;
    case "months":
      content = renderYearByMonth(weekStart, scale, width, height, colors, today);
      break;
    case "quarters":
      content = renderQuarterCalendar(weekStart, width, height, colors, today);
      break;
    case "goal":
      content = renderGoalCalendar(goalStartDate, goalEndDate, goalTitle, width, colors, today);
      break;
    case "days":
    default:
      content = renderDaysCalendar(width, height, colors, today);
      break;
  }

  const interFontData = await interFont;

  const response = new ImageResponse(content, {
    width,
    height,
    fonts: [
      {
        name: "Inter",
        data: interFontData,
        style: "normal",
        weight: 400,
      },
    ],
  });

  appendVaryHeader(response.headers, "X-Vercel-IP-Timezone");
  response.headers.set("X-Life-Calendar-Date", todayKey);

  if (timeZone) {
    response.headers.set("X-Life-Calendar-Timezone", timeZone);
  }

  return response;
}
