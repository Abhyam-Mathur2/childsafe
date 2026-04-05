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
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.5rem",
    },
    media: [
      "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=2000", // Taj Mahal
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=2000", // Agra
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=2000", // Jaipur
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=2000", // Varanasi
    ],
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
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0rem",
    },
    media: [
      "https://images.unsplash.com/photo-1543783232-f79fef05aeba?auto=format&fit=crop&q=80&w=2000", // Madrid
      "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&q=80&w=2000", // Andalusia
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=2000", // Barcelona
      "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&q=80&w=2000", // Seville
    ],
    greeting: { text: "¡Hola!", flag: "🇪🇸" }
  },
  portugal: {
    id: "portugal",
    countryCode: "pt",
    name: "Portugal",
    colors: {
      primary: "#0ea5e9",
      background: "#0a0a0a",
      backgroundAlt: "rgba(15, 15, 15, 0.7)",
      surface: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      glow: "rgba(14, 165, 233, 0.2)",
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.75rem",
    },
    media: [
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&q=80&w=2000", // Porto
      "https://images.unsplash.com/photo-1585208798174-6cedd862099b?auto=format&fit=crop&q=80&w=2000", // Lisbon
      "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&q=80&w=2000", // Algarve
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=2000", // Sintra
    ],
    greeting: { text: "Olá", flag: "🇵🇹" }
  },
  italy: {
    id: "italy",
    countryCode: "it",
    name: "Italy",
    colors: {
      primary: "#10b981",
      background: "#0a0a0a",
      backgroundAlt: "rgba(15, 15, 15, 0.7)",
      surface: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      glow: "rgba(16, 185, 129, 0.2)",
    },
    typography: {
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "1rem",
    },
    media: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=2000", // Venice
      "https://images.unsplash.com/photo-1520175480921-4edfa0683001?auto=format&fit=crop&q=80&w=2000", // Tuscany
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=2000", // Cinque Terre
      "https://images.unsplash.com/photo-1529260839382-36521ca9b5fe?auto=format&fit=crop&q=80&w=2000", // Rome
    ],
    greeting: { text: "Ciao", flag: "🇮🇹" }
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
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.25rem",
    },
    media: [
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&q=80&w=2000", // NYC
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=80&w=2000", // SF
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000", // Nature
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80&w=2000", // Golden Gate
    ],
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
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
    personality: {
      borderRadius: "0.75rem",
    },
    media: ["/assets/auth-bg.mp4"],
    greeting: { text: "Welcome", flag: "🌍" }
  }
};

export const getThemeByCountryCode = (code) => {
  if (!code) return themes.default;
  const lowerCode = code.toLowerCase();
  const themeKey = Object.keys(themes).find(k => themes[k].countryCode === lowerCode);
  return themes[themeKey] || themes.default;
};
