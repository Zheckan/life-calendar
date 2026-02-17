import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import {
  getDaysDots,
  getYearByMonthDots,
  getQuarterDots,
  getGoalDots,
  type CalendarView,
  type WeekStart,
  type DotState,
} from "@/lib/calendar-utils";

interface ThemeColors {
  bg: string;
  past: string;
  current: string;
  future: string;
  text: string;
  highlight: string;
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function isValidHex(color: string | null): color is string {
  return color !== null && HEX_COLOR_RE.test(color);
}

function isDarkColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r + g + b < 384;
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

  if (isValidHex(customAccent)) {
    base.current = customAccent;
    base.highlight = customAccent;
  }
  if (isValidHex(customBg)) {
    base.bg = customBg;
    // Auto-compute contrasting future dot color if not explicitly provided
    if (!isValidHex(customDot)) {
      base.future = isDarkColor(customBg) ? "#606060" : "#D1D5DB";
    }
  }
  if (isValidHex(customDot)) {
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

function renderLifeCalendar(
  birthday: string,
  width: number,
  height: number,
  colors: ThemeColors,
): React.ReactElement {
  const lifespan = 90;
  const bday = new Date(birthday);
  const today = new Date();
  const totalWeeksLived = Math.max(
    0,
    Math.floor((today.getTime() - bday.getTime()) / (7 * 24 * 60 * 60 * 1000)),
  );
  const totalWeeks = Math.ceil((lifespan * 365.25) / 7);
  const percentLived = Math.min(100, parseFloat(((totalWeeksLived / totalWeeks) * 100).toFixed(1)));

  // Dynamic column count based on image width (matches reference)
  const targetCellSize = 18;
  const gridWidth = width * 0.84;
  const cols = Math.floor(gridWidth / targetCellSize);
  const rows = Math.ceil(totalWeeks / cols);

  const cellSize = gridWidth / cols;
  const dotSize = Math.max(2, cellSize * 0.617);
  const gapSize = cellSize - dotSize;

  // Build flat grid: rows x cols
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
): React.ReactElement {
  const data = getDaysDots();
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
): React.ReactElement {
  const data = getYearByMonthDots(weekStart);
  const monthsPerRow = 3;

  const cellWidth = width * 0.85;
  const monthWidth = cellWidth / monthsPerRow;
  // Transposed: 7 columns (weekdays) x N rows (weeks)
  const dotSize = Math.max(4, Math.min((monthWidth * 0.7) / 7, 17 * scale));
  const gapSize = Math.max(3, dotSize * 0.88);
  const rowGap = dotSize * 0.88;
  // Fixed pitch per quarter row — gives uniform row spacing like the reference
  const quarterRowPitch = Math.round(8 * (dotSize + rowGap));
  const monthGap = Math.round(47 * scale);

  // Compute paddingTop that matches the centered position at scale=1,
  // then keep it fixed so the top stays anchored when scale changes.
  const basePad = height * 0.117;
  const baseDotSize = Math.max(4, Math.min((monthWidth * 0.7) / 7, 17));
  const baseRowGap = baseDotSize * 0.88;
  const baseQRP = Math.round(8 * (baseDotSize + baseRowGap));
  const lastRowMaxWeeks = Math.max(...data.months.slice(9, 12).map((m) => m.dots[0].length));
  const monthLabelHeight = 40; // fontSize 30px + marginBottom 10px
  const baseContentHeight =
    3 * baseQRP + monthLabelHeight + lastRowMaxWeeks * (baseDotSize + baseRowGap) + 82 + 36; // summary marginTop + fontSize
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
                    {/* Iterate weeks as visual rows */}
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
                        {/* Iterate weekdays as visual columns */}
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
): React.ReactElement {
  const data = getQuarterDots(weekStart);

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
        {/* 2 rows of 2 quarters */}
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
              const weekdayCount = quarter.dots.length; // 7
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
                    {/* Iterate weeks as visual rows */}
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
                        {/* Iterate weekdays as visual columns */}
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
  goalStart: string,
  goalEnd: string,
  goalTitle: string,
  width: number,
  height: number,
  colors: ThemeColors,
): React.ReactElement {
  const data = getGoalDots(new Date(goalStart), new Date(goalEnd));
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
        width: "100%",
        height: "100%",
        backgroundColor: colors.bg,
        fontFamily: "Inter",
        paddingTop: `${Math.round(height * 0.235)}px`,
      }}
    >
      <div
        style={{
          fontSize: `${Math.min(36, Math.max(16, Math.floor((width / goalTitle.length) * 1.2)))}px`,
          color: colors.text,
          marginBottom: "40px",
          maxWidth: `${width * 0.85}px`,
          textAlign: "center" as const,
          overflow: "hidden",
        }}
      >
        {goalTitle}
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
        <span style={{ color: colors.highlight }}>{data.daysLeft}d left</span>
        <span style={{ marginLeft: "14px", marginRight: "14px" }}>&middot;</span>
        <span>{data.percentElapsed}%</span>
      </div>
    </div>
  );
}

const interFont = fetch(
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest): Promise<ImageResponse | Response> {
  const { searchParams } = request.nextUrl;

  const rawWidth = searchParams.get("width");
  const rawHeight = searchParams.get("height");
  const width = rawWidth ? parseInt(rawWidth, 10) : NaN;
  const height = rawHeight ? parseInt(rawHeight, 10) : NaN;

  if (!rawWidth || !rawHeight || isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return new Response("Missing required parameters: width and height", { status: 400 });
  }

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

  const colors = getThemeColors(theme, accent, bg, dot);

  let content: React.ReactElement;

  switch (view) {
    case "life":
      content = renderLifeCalendar(birthday, width, height, colors);
      break;
    case "months":
      content = renderYearByMonth(weekStart, scale, width, height, colors);
      break;
    case "quarters":
      content = renderQuarterCalendar(weekStart, width, height, colors);
      break;
    case "goal":
      content = renderGoalCalendar(goalStart, goalEnd, goalTitle, width, height, colors);
      break;
    case "days":
    default:
      content = renderDaysCalendar(width, height, colors);
      break;
  }

  const interFontData = await interFont;

  return new ImageResponse(content, {
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
}
