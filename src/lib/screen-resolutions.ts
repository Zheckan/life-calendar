export interface ScreenResolution {
  name: string;
  width: number;
  height: number;
  category?: string;
}

export const SCREEN_RESOLUTIONS: ScreenResolution[] = [
  // Apple
  { name: "iPhone 13 mini", width: 1080, height: 2340, category: "Apple" },
  { name: "iPhone 13 / 14 / 14 Pro", width: 1170, height: 2532, category: "Apple" },
  { name: "iPhone 13 Pro Max / 14 Plus", width: 1284, height: 2778, category: "Apple" },
  { name: "iPhone 15 / 15 Pro / 16", width: 1179, height: 2556, category: "Apple" },
  { name: "iPhone 15 Plus / 15 Pro Max / 16 Plus", width: 1290, height: 2796, category: "Apple" },
  { name: "iPhone 16 Pro", width: 1206, height: 2622, category: "Apple" },
  { name: "iPhone 16 Pro Max", width: 1320, height: 2868, category: "Apple" },

  // Samsung
  { name: "Samsung Galaxy S24", width: 1080, height: 2340, category: "Samsung" },
  { name: "Samsung Galaxy S24+ / Ultra", width: 1440, height: 3120, category: "Samsung" },

  // Google
  { name: "Google Pixel 9", width: 1080, height: 2424, category: "Google" },
  { name: "Google Pixel 9 Pro", width: 1280, height: 2856, category: "Google" },

  // Custom
  { name: "Custom", width: 1179, height: 2556, category: "Custom" },
];
