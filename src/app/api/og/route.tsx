import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest): NextResponse | Response {
  const { searchParams } = request.nextUrl;

  const rawWidth = searchParams.get("width");
  const rawHeight = searchParams.get("height");

  if (!rawWidth || !rawHeight) {
    return new Response("Missing required parameters: width and height", { status: 400 });
  }

  const width = parseInt(rawWidth, 10);
  const height = parseInt(rawHeight, 10);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return new Response("Invalid width or height", { status: 400 });
  }

  // Build new URL: /og/WIDTHxHEIGHT?remaining_params
  const remaining = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key !== "width" && key !== "height") {
      remaining.set(key, value);
    }
  }

  const queryPart = remaining.toString();
  const newPath = `/og/${width}x${height}${queryPart ? `?${queryPart}` : ""}`;

  return NextResponse.redirect(new URL(newPath, request.url), 308);
}
