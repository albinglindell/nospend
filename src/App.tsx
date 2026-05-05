import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ConfigProvider, theme } from "antd";
import Calendar from "./components/Calendar";
import SpendModal from "./components/SpendModal";
import { SPEND_COLORS, YELLOW_THRESHOLD } from "./utils/spendColor";
import {
  createEntryId,
  migrateSpendMap,
  SpendEntry,
  SpendMap,
} from "./utils/spendEntry";
import "./App.css";

const STORAGE_KEY = "nospend.spends.v2";
const LEGACY_STORAGE_KEY = "nospend.spends.v1";

const formatKey = (date: Dayjs) => date.format("YYYY-MM-DD");

const loadInitialSpends = (): SpendMap => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return migrateSpendMap(JSON.parse(stored));
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = migrateSpendMap(JSON.parse(legacy));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  } catch {
    /* noop */
  }
  return {};
};

const App = () => {
  const [spends, setSpends] = useState<SpendMap>(() => loadInitialSpends());
  const [month, setMonth] = useState<Dayjs>(() => dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spends));
    } catch {
      /* noop */
    }
  }, [spends]);

  const onPrevMonthHandler = () => {
    setMonth((current) => current.subtract(1, "month"));
  };

  const onNextMonthHandler = () => {
    setMonth((current) => current.add(1, "month"));
  };

  const onSelectDateHandler = (date: Dayjs) => {
    setSelectedDate(() => date);
  };

  const onCloseModalHandler = () => {
    setSelectedDate(() => null);
  };

  const onAddEntryHandler = (date: Dayjs, amount: number) => {
    const key = formatKey(date);
    const newEntry: SpendEntry = { id: createEntryId(), amount };
    setSpends((current) => ({
      ...current,
      [key]: [...(current[key] ?? []), newEntry],
    }));
  };

  const onRemoveEntryHandler = (date: Dayjs, entryId: string) => {
    const key = formatKey(date);
    setSpends((current) => {
      const existing = current[key];
      if (!existing) return current;
      const remaining = existing.filter((entry) => entry.id !== entryId);
      const next = { ...current };
      if (remaining.length === 0) {
        delete next[key];
      } else {
        next[key] = remaining;
      }
      return next;
    });
  };

  const selectedEntries = selectedDate ? spends[formatKey(selectedDate)] ?? [] : [];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#22c55e",
          borderRadius: 10,
        },
      }}
    >
      <div className="app">
        <Calendar
          month={month}
          spends={spends}
          onPrevMonthHandler={onPrevMonthHandler}
          onNextMonthHandler={onNextMonthHandler}
          onSelectDateHandler={onSelectDateHandler}
        />

        <ul className="app__legend" aria-label="Color legend">
          <li>
            <span
              className="app__legend-dot"
              style={{ background: SPEND_COLORS.zero }}
            />
            0
          </li>
          <li>
            <span
              className="app__legend-dot"
              style={{ background: SPEND_COLORS.low }}
            />
            ≤ {YELLOW_THRESHOLD}
          </li>
          <li>
            <span
              className="app__legend-dot"
              style={{ background: SPEND_COLORS.high }}
            />
            &gt; {YELLOW_THRESHOLD}
          </li>
        </ul>

        <SpendModal
          date={selectedDate}
          entries={selectedEntries}
          onAddEntryHandler={onAddEntryHandler}
          onRemoveEntryHandler={onRemoveEntryHandler}
          onCloseHandler={onCloseModalHandler}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
