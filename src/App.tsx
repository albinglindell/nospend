import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ConfigProvider, theme } from "antd";
import Calendar from "./components/Calendar";
import SpendModal from "./components/SpendModal";
import GoalModal from "./components/GoalModal";
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
const GOALS_STORAGE_KEY = "nospend.goals.v1";

type GoalMap = Record<string, number>;

const formatKey = (date: Dayjs) => date.format("YYYY-MM-DD");
const formatMonthKey = (date: Dayjs) => date.format("YYYY-MM");

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

const loadInitialGoals = (): GoalMap => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(GOALS_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return {};
    const result: GoalMap = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "number" && value > 0) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
};

const App = () => {
  const [spends, setSpends] = useState<SpendMap>(() => loadInitialSpends());
  const [goals, setGoals] = useState<GoalMap>(() => loadInitialGoals());
  const [month, setMonth] = useState<Dayjs>(() => dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [editingGoalMonth, setEditingGoalMonth] = useState<Dayjs | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spends));
    } catch {
      /* noop */
    }
  }, [spends]);

  useEffect(() => {
    try {
      window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch {
      /* noop */
    }
  }, [goals]);

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

  const onEditGoalHandler = () => {
    setEditingGoalMonth(() => month);
  };

  const onCloseGoalModalHandler = () => {
    setEditingGoalMonth(() => null);
  };

  const onSaveGoalHandler = (goal: number) => {
    if (!editingGoalMonth) return;
    const key = formatMonthKey(editingGoalMonth);
    setGoals((current) => ({ ...current, [key]: goal }));
    setEditingGoalMonth(() => null);
  };

  const onRemoveGoalHandler = () => {
    if (!editingGoalMonth) return;
    const key = formatMonthKey(editingGoalMonth);
    setGoals((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setEditingGoalMonth(() => null);
  };

  const selectedEntries = selectedDate ? spends[formatKey(selectedDate)] ?? [] : [];
  const currentGoal = goals[formatMonthKey(month)];
  const editingGoalKey = editingGoalMonth ? formatMonthKey(editingGoalMonth) : null;
  const editingInitialGoal = editingGoalKey ? goals[editingGoalKey] : undefined;

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
          goal={currentGoal}
          onPrevMonthHandler={onPrevMonthHandler}
          onNextMonthHandler={onNextMonthHandler}
          onSelectDateHandler={onSelectDateHandler}
          onEditGoalHandler={onEditGoalHandler}
        />

        <ul className="app__legend" aria-label="Color legend">
          <li>
            <span
              className="app__legend-dot"
              style={{ background: SPEND_COLORS.zero }}
            />
            0 kr
          </li>
          <li>
            <span
              className="app__legend-dot"
              style={{ background: SPEND_COLORS.low }}
            />
            &lt; {YELLOW_THRESHOLD} kr
          </li>
          <li>
            <span
              className="app__legend-dot"
              style={{ background: SPEND_COLORS.high }}
            />
            &gt; {YELLOW_THRESHOLD} kr
          </li>
        </ul>

        <SpendModal
          date={selectedDate}
          entries={selectedEntries}
          onAddEntryHandler={onAddEntryHandler}
          onRemoveEntryHandler={onRemoveEntryHandler}
          onCloseHandler={onCloseModalHandler}
        />

        <GoalModal
          monthLabel={
            editingGoalMonth ? editingGoalMonth.format("MMMM YYYY") : null
          }
          initialGoal={editingInitialGoal}
          maxDays={editingGoalMonth ? editingGoalMonth.daysInMonth() : 31}
          onSaveHandler={onSaveGoalHandler}
          onRemoveHandler={onRemoveGoalHandler}
          onCloseHandler={onCloseGoalModalHandler}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
