const indiaMedia = {
  before: [
    "https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&q=60&w=1200", // Delhi Smog
    "https://images.unsplash.com/photo-1793311411451-b480f627d6a8?auto=format&fit=crop&q=60&w=1200", // Burning Trash
    "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=60&w=1200", // Urban Fatigue
    "https://images.unsplash.com/photo-1765867197306-c8b338ebe1ae?auto=format&fit=crop&q=60&w=1200", // Smoggy Skyline
    "https://images.unsplash.com/photo-1758187948084-2346aed52a37?auto=format&fit=crop&q=60&w=1200", // Hazy Cityscape
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=60&w=1200", // Garbage/Waste
    "https://images.unsplash.com/photo-1793371382356-efbc528d643b?auto=format&fit=crop&q=60&w=1200", // Polluted Water
    "https://images.unsplash.com/photo-1554511491-0f21bacd5ba0?auto=format&fit=crop&q=60&w=1200", // City Fog
    "https://images.unsplash.com/photo-1686179225818-c07909cd2911?auto=format&fit=crop&q=60&w=1200", // Foggy Skyline
    "https://images.unsplash.com/photo-1736323276259-ee5c153f9f81?auto=format&fit=crop&q=60&w=1200", // Garbage Pile
    "https://images.unsplash.com/photo-1532300481631-0bc14f3b7699?auto=format&fit=crop&q=60&w=1200", // Hazy Skyline
    "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=60&w=1200", // Crisis Environment
  ],
  after: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=60&w=1200", // Yoga in Nature
    "https://images.unsplash.com/photo-1534276975702-50d67c27f8b7?auto=format&fit=crop&q=60&w=1200", // Forest Trees
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=60&w=1200", // Clean Mountains
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=60&w=1200", // Lush Forest
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=60&w=1200", // Pristine Water
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=60&w=1200", // Sustainable Green
    "https://images.unsplash.com/photo-1628705250580-80b96d4657f6?auto=format&fit=crop&q=60&w=1200", // Family Outdoors
    "https://images.unsplash.com/photo-1622610607501-32ac9c927216?auto=format&fit=crop&q=60&w=1200", // Sunset Walk
    "https://images.unsplash.com/photo-1592711491694-e85f60a7773a?auto=format&fit=crop&q=60&w=1200", // Green Fields
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=60&w=1200", // Vibrant Garden
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=60&w=1200", // Strength
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=60&w=1200", // Health Ritual
  ]
};

const commonMedia = {
  before: [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=60&w=1200", // Drought
    "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&q=60&w=1200", // Flood
    "https://images.unsplash.com/photo-1463740839922-2d3b7e426a56?auto=format&fit=crop&q=60&w=1200", // Industrial Smoke
  ],
  after: [
    "https://images.unsplash.com/photo-1539920951450-2b2d59cff66d?auto=format&fit=crop&q=60&w=1200", // Forest Walk
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=60&w=1200", // Serene Coast
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=60&w=1200", // Pure Nature
  ]
};

// Aggregated Global Collection
const allBefore = Array.from(new Set([...indiaMedia.before, ...commonMedia.before]));
const allAfter = Array.from(new Set([...indiaMedia.after, ...commonMedia.after]));

const globalMedia = {
  before: allBefore,
  after: allAfter
};

export const themes = {
  india: {
    id: "india",
    countryCode: "in",
    name: "India",
    colors: {
      primary: "#f59e0b",
      background: "#0a0a0a",
      backgroundAlt: "rgba(15, 15, 15, 0.7)",
      surface: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      glow: "rgba(245, 158, 11, 0.2)",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.5rem",
    },
    media: indiaMedia,
    greeting: { text: "Namaste", flag: "🇮🇳" }
  },
  spain: {
    id: "spain",
    countryCode: "es",
    name: "Spain",
    colors: {
      primary: "#ef4444",
      background: "#0a0a0a",
      backgroundAlt: "rgba(15, 15, 15, 0.7)",
      surface: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      glow: "rgba(239, 68, 68, 0.2)",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0rem",
    },
    media: {
      before: [commonMedia.before[0], indiaMedia.before[1], indiaMedia.before[2]],
      after: [commonMedia.after[0], indiaMedia.after[2], indiaMedia.after[4]]
    },
    greeting: { text: "¡Hola!", flag: "🇪🇸" }
  },
  usa: {
    id: "usa",
    countryCode: "us",
    name: "USA",
    colors: {
      primary: "#3b82f6",
      background: "#0a0a0a",
      backgroundAlt: "rgba(15, 15, 15, 0.7)",
      surface: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      glow: "rgba(59, 130, 246, 0.2)",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.25rem",
    },
    media: {
      before: [commonMedia.before[2], indiaMedia.before[3], indiaMedia.before[6]],
      after: [commonMedia.after[2], indiaMedia.after[4], indiaMedia.after[10]]
    },
    greeting: { text: "Hello", flag: "🇺🇸" }
  },
  default: {
    id: "default",
    countryCode: "default",
    name: "Global",
    colors: {
      primary: "#10b981",
      background: "#020617",
      backgroundAlt: "rgba(15, 23, 42, 0.6)",
      surface: "rgba(255, 255, 255, 0.03)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#e2e8f0",
      textMuted: "#94a3b8",
      glow: "rgba(16, 185, 129, 0.2)",
    },
    typography: {
      headingFont: "'Plus Jakarta Sans', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.75rem",
    },
    media: globalMedia,
    greeting: { text: "Welcome", flag: "🌍" }
  }
};

export const getThemeByCountryCode = (code) => {
  if (!code) return themes.default;
  const lowerCode = code.toLowerCase();
  const themeKey = Object.keys(themes).find(k => themes[k].countryCode === lowerCode);
  return themes[themeKey] || themes.default;
};
