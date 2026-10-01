/**
 * DigitalBoost Studio
 * Trading Islands — Visual DNA
 *
 * PHASE 1
 *
 * Design principles:
 *
 * PRECISION
 * CONTROL
 * SPEED
 * DEPTH
 * PREMIUM
 * TECHNOLOGY
 *
 * Trading Islands is intentionally independent from
 * PULSE UI, PULSE governance and PULSE runtime.
 *
 * These tokens describe presentation only.
 * They contain no execution authority.
 */

export const TRADING_VISUAL_DNA_VERSION =
  "trading-islands-visual-dna-v1" as const;

export const tradingColors = {
  background: {
    void: "#030609",
    base: "#05090e",
    raised: "#08101a",
    workspace: "#07101a",
  },

  surface: {
    primary: "#0a131d",
    secondary: "#0d1823",
    elevated: "#101d29",
    interactive: "#122230",
    hover: "#152938",
    selected: "#102b3b",
  },

  border: {
    subtle: "rgba(143, 174, 199, 0.10)",
    default: "rgba(143, 174, 199, 0.16)",
    strong: "rgba(102, 173, 219, 0.28)",
    active: "rgba(48, 191, 255, 0.48)",
  },

  text: {
    primary: "#f1f6fa",
    secondary: "#afbfca",
    muted: "#718493",
    faint: "#50616d",
    inverse: "#041018",
  },

  accent: {
    blue: "#278ef5",
    blueStrong: "#1477df",
    cyan: "#32c8f4",
    cyanSoft: "#7bdcf5",
  },

  semantic: {
    positive: "#26c281",
    negative: "#ef5b68",
    warning: "#e5b84b",
    info: "#4ca8f5",
  },

  chart: {
    grid: "rgba(139, 166, 184, 0.08)",
    axis: "#607482",
    candleUp: "#26c281",
    candleDown: "#ef5b68",
    volumeUp: "rgba(38, 194, 129, 0.38)",
    volumeDown: "rgba(239, 91, 104, 0.38)",
    crosshair: "rgba(183, 204, 218, 0.42)",
    indicatorPrimary: "#48b6f2",
    indicatorSecondary: "#b99cf4",
    indicatorTertiary: "#e5b84b",
  },
} as const;

export const tradingSpacing = {
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
} as const;

export const tradingRadius = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
} as const;

export const tradingTypography = {
  family: {
    ui:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    numeric:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },

  size: {
    micro: "9px",
    xs: "10px",
    sm: "11px",
    md: "12px",
    lg: "14px",
    xl: "18px",
    title: "24px",
  },

  weight: {
    regular: 400,
    medium: 520,
    semibold: 620,
    bold: 720,
  },
} as const;

export const tradingMotion = {
  fast: "110ms",
  standard: "160ms",
  deliberate: "220ms",

  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export const tradingDensity = {
  topbarHeight: "54px",
  sidebarWidth: "212px",
  sidebarCompactWidth: "58px",
  inspectorWidth: "284px",
  consoleHeight: "38px",

  controlHeight: {
    compact: "28px",
    standard: "32px",
    comfortable: "36px",
  },

  tableRowHeight: {
    dense: "30px",
    standard: "36px",
  },
} as const;

export type TradingVisualState =
  | "default"
  | "hover"
  | "active"
  | "selected"
  | "disabled"
  | "loading"
  | "success"
  | "warning"
  | "error"
  | "running"
  | "paused"
  | "stopped";

export const tradingStateSemantics: Record<
  TradingVisualState,
  {
    tone:
      | "neutral"
      | "info"
      | "positive"
      | "warning"
      | "negative";

    animated: boolean;
  }
> = {
  default: {
    tone: "neutral",
    animated: false,
  },

  hover: {
    tone: "neutral",
    animated: false,
  },

  active: {
    tone: "info",
    animated: false,
  },

  selected: {
    tone: "info",
    animated: false,
  },

  disabled: {
    tone: "neutral",
    animated: false,
  },

  loading: {
    tone: "neutral",
    animated: true,
  },

  success: {
    tone: "positive",
    animated: false,
  },

  warning: {
    tone: "warning",
    animated: false,
  },

  error: {
    tone: "negative",
    animated: false,
  },

  running: {
    tone: "positive",
    animated: true,
  },

  paused: {
    tone: "warning",
    animated: false,
  },

  stopped: {
    tone: "negative",
    animated: false,
  },
};

export const tradingVisualDNA = {
  version: TRADING_VISUAL_DNA_VERSION,

  principles: [
    "precision",
    "control",
    "speed",
    "depth",
    "premium",
    "technology",
  ],

  colors: tradingColors,
  spacing: tradingSpacing,
  radius: tradingRadius,
  typography: tradingTypography,
  motion: tradingMotion,
  density: tradingDensity,
  states: tradingStateSemantics,
} as const;

export default tradingVisualDNA;
