export interface ScreenResolution {
  name: string;
  width: number;
  height: number;
  deviceType: "phone" | "custom";
  category?: string;
  keywords?: string[];
}

export const SCREEN_RESOLUTIONS: ScreenResolution[] = [
  // Apple
  { name: "iPhone 13 mini", width: 1080, height: 2340, category: "Apple", deviceType: "phone" },
  {
    name: "iPhone 13 / 14 / 14 Pro",
    width: 1170,
    height: 2532,
    category: "Apple",
    deviceType: "phone",
  },
  {
    name: "iPhone 13 Pro Max / 14 Plus",
    width: 1284,
    height: 2778,
    category: "Apple",
    deviceType: "phone",
  },
  {
    name: "iPhone 15 / 15 Pro / 16",
    width: 1179,
    height: 2556,
    category: "Apple",
    deviceType: "phone",
  },
  {
    name: "iPhone 15 Plus / 15 Pro Max / 16 Plus",
    width: 1290,
    height: 2796,
    category: "Apple",
    deviceType: "phone",
  },
  { name: "iPhone 16 Pro", width: 1206, height: 2622, category: "Apple", deviceType: "phone" },
  {
    name: "iPhone 16 Pro Max",
    width: 1320,
    height: 2868,
    category: "Apple",
    deviceType: "phone",
  },
  // Samsung
  {
    name: "Samsung Galaxy S24",
    width: 1080,
    height: 2340,
    category: "Samsung",
    deviceType: "phone",
  },
  {
    name: "Samsung Galaxy S24+ / Ultra",
    width: 1440,
    height: 3120,
    category: "Samsung",
    deviceType: "phone",
  },

  // Google
  { name: "Google Pixel 9", width: 1080, height: 2424, category: "Google", deviceType: "phone" },
  {
    name: "Google Pixel 9 Pro",
    width: 1280,
    height: 2856,
    category: "Google",
    deviceType: "phone",
  },

  // Custom
  { name: "Custom", width: 1179, height: 2556, category: "Custom", deviceType: "custom" },
];

export function findScreenResolution(name: string): ScreenResolution | undefined {
  return SCREEN_RESOLUTIONS.find((resolution) => resolution.name === name);
}

export function searchScreenResolutions(query: string): ScreenResolution[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return SCREEN_RESOLUTIONS;
  }

  return SCREEN_RESOLUTIONS.filter((resolution) => {
    const searchable = [
      resolution.name,
      resolution.category,
      resolution.deviceType,
      `${resolution.width}`,
      `${resolution.height}`,
      `${resolution.width}x${resolution.height}`,
      `${resolution.width} x ${resolution.height}`,
      ...(resolution.keywords ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return terms.every((term) => searchable.includes(term));
  });
}
