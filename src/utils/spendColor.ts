export type SpendLevel = "none" | "zero" | "low" | "high";

export const YELLOW_THRESHOLD = 200;

export const getSpendLevel = (amount: number | undefined): SpendLevel => {
  if (amount === undefined) return "none";
  if (amount === 0) return "zero";
  if (amount < YELLOW_THRESHOLD) return "low";
  return "high";
};

export const SPEND_COLORS: Record<SpendLevel, string> = {
  none: "transparent",
  zero: "#22c55e",
  low: "#eab308",
  high: "#ef4444",
};
