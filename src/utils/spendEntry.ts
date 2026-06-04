export type SpendEntry = {
  id: string;
  amount: number;
};

export type SpendMap = Record<string, SpendEntry[]>;

export const createEntryId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const getDayTotal = (entries: SpendEntry[] | undefined): number => {
  if (!entries || entries.length === 0) return 0;
  return entries.reduce((total, entry) => total + entry.amount, 0);
};

export const formatAmount = (amount: number): string => `${amount} kr`;

export const getMonthTotal = (spends: SpendMap, monthKey: string): number => {
  let total = 0;
  for (const [key, entries] of Object.entries(spends)) {
    if (!key.startsWith(monthKey)) continue;
    if (!entries || entries.length === 0) continue;
    total += getDayTotal(entries);
  }
  return total;
};

export type LowestMonthRecord = {
  monthKey: string;
  total: number;
};

export const getLowestPastMonth = (
  spends: SpendMap,
  excludeMonthKey: string
): LowestMonthRecord | null => {
  const totalsByMonth = new Map<string, number>();

  for (const [key, entries] of Object.entries(spends)) {
    if (!entries || entries.length === 0) continue;
    const monthKey = key.slice(0, 7);
    if (monthKey === excludeMonthKey) continue;
    totalsByMonth.set(
      monthKey,
      (totalsByMonth.get(monthKey) ?? 0) + getDayTotal(entries)
    );
  }

  if (totalsByMonth.size === 0) return null;

  let lowest: LowestMonthRecord | null = null;
  for (const [monthKey, total] of totalsByMonth) {
    if (lowest === null || total < lowest.total) {
      lowest = { monthKey, total };
    }
  }

  return lowest;
};

export const migrateSpendMap = (raw: unknown): SpendMap => {
  if (!raw || typeof raw !== "object") return {};
  const result: SpendMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number") {
      result[key] = [{ id: createEntryId(), amount: value }];
      continue;
    }
    if (Array.isArray(value)) {
      const entries = value
        .filter(
          (entry): entry is SpendEntry =>
            !!entry &&
            typeof entry === "object" &&
            typeof (entry as SpendEntry).id === "string" &&
            typeof (entry as SpendEntry).amount === "number"
        )
        .map((entry) => ({ id: entry.id, amount: entry.amount }));
      if (entries.length > 0) result[key] = entries;
    }
  }
  return result;
};
