const indiaMedia = {
  before: [
    "https://images.unsplash.com/photo-1528164344705-4754268799af?auto=format&fit=crop&q=60&w=1200", // Heavy Smog Delhi
    "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=60&w=1200", // Person in mask/coughing
    "https://images.unsplash.com/photo-1499914485622-a88fac536bb7?auto=format&fit=crop&q=60&w=1200", // Tired/Restless person
    "https://images.unsplash.com/photo-1610123598195-2004246830d6?auto=format&fit=crop&q=60&w=1200", // Industrial Smoke
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=60&w=1200", // River Waste
    "https://images.unsplash.com/photo-1599052026135-e698889163e7?auto=format&fit=crop&q=60&w=1200", // Grey Urban Heat
    "https://images.unsplash.com/photo-1510619962283-005119641772?auto=format&fit=crop&q=60&w=1200", // Gridlock Pollution
    "https://images.unsplash.com/photo-1509043231366-23be53856891?auto=format&fit=crop&q=60&w=1200", // Crowded Housing
    "https://images.unsplash.com/photo-1493238792000-811347057630?auto=format&fit=crop&q=60&w=1200", // Burning Refuse
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=60&w=1200", // Construction Dust
    "https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&q=60&w=1200", // Urban Struggle
    "https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=60&w=1200", // Masked Portrait
  ],
  after: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=60&w=1200", // Yoga in Himalayas
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=60&w=1200", // Yoga/Health in Park
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=60&w=1200", // Athletic Workout
    "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=60&w=1200", // Serene Dawn
    "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=60&w=1200", // Clean Environment
    "https://images.unsplash.com/photo-1582510003544-2d09566f030e?auto=format&fit=crop&q=60&w=1200", // Vibrant Green Sanctuary
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=60&w=1200", // Pristine Coastal
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=60&w=1200", // Sustainable Farm
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=60&w=1200", // Mountain Lake
    "https://images.unsplash.com/photo-1470252649358-96759a803972?auto=format&fit=crop&q=60&w=1200", // Morning Light
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=60&w=1200", // Healthy Living
    "https://images.unsplash.com/photo-1502086223501-7ea2443f84fd?auto=format&fit=crop&q=60&w=1200", // Nature Child
  ]
};

const commonMedia = {
  before: [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=60&w=1200", // Drought
    "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&q=60&w=1200", // Wildfire
    "https://images.unsplash.com/photo-1616038242814-a6eac7845d88?auto=format&fit=crop&q=60&w=1200", // Flood
    "https://images.unsplash.com/photo-1463740839922-2d3b7e426a56?auto=format&fit=crop&q=60&w=1200", // Smoke
  ],
  after: [
    "https://images.unsplash.com/photo-1543783232-f79fef05aeba?auto=format&fit=crop&q=60&w=1200", // Clean City
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=60&w=1200", // Serene Water
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=60&w=1200", // Pure Nature
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=60&w=1200", // Clear Sky
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
      before: [commonMedia.before[3], indiaMedia.before[2], indiaMedia.before[6]],
      after: [commonMedia.after[2], commonMedia.after[3], indiaMedia.after[10]]
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
