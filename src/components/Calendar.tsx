import { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { getSpendLevel, SPEND_COLORS } from "../utils/spendColor";
import { formatAmount, getDayTotal, SpendMap } from "../utils/spendEntry";
import "./Calendar.css";

type CalendarProps = {
  month: Dayjs;
  spends: SpendMap;
  goal: number | undefined;
  onPrevMonthHandler: () => void;
  onNextMonthHandler: () => void;
  onSelectDateHandler: (date: Dayjs) => void;
  onEditGoalHandler: () => void;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = ({
  month,
  spends,
  goal,
  onPrevMonthHandler,
  onNextMonthHandler,
  onSelectDateHandler,
  onEditGoalHandler,
}: CalendarProps) => {
  const days = useMemo(() => {
    const startOfMonth = month.startOf("month");
    const endOfMonth = month.endOf("month");
    const offset = (startOfMonth.day() + 6) % 7;
    const gridStart = startOfMonth.subtract(offset, "day");
    const totalCells = Math.ceil((offset + endOfMonth.date()) / 7) * 7;
    return Array.from({ length: totalCells }, (_, index) =>
      gridStart.add(index, "day")
    );
  }, [month]);

  const { monthTotal, noSpendDays } = useMemo(() => {
    const monthKeyPrefix = month.format("YYYY-MM");
    let total = 0;
    let zeroDays = 0;
    for (const [key, entries] of Object.entries(spends)) {
      if (!key.startsWith(monthKeyPrefix)) continue;
      if (!entries || entries.length === 0) continue;
      const dayTotal = getDayTotal(entries);
      total += dayTotal;
      if (dayTotal === 0) zeroDays += 1;
    }
    return { monthTotal: total, noSpendDays: zeroDays };
  }, [month, spends]);

  const goalProgress =
    goal !== undefined && goal > 0
      ? Math.min(100, Math.round((noSpendDays / goal) * 100))
      : 0;

  const today = dayjs();

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button
          type="button"
          className="calendar__nav"
          aria-label="Previous month"
          onClick={onPrevMonthHandler}
        >
          ‹
        </button>
        <div className="calendar__title-group">
          <h2 className="calendar__title">{month.format("MMMM YYYY")}</h2>
          <p
            className="calendar__total"
            aria-label={`Total spent ${formatAmount(monthTotal)}`}
          >
            Total: {formatAmount(monthTotal)}
          </p>
        </div>
        <button
          type="button"
          className="calendar__nav"
          aria-label="Next month"
          onClick={onNextMonthHandler}
        >
          ›
        </button>
      </div>

      <button
        type="button"
        className="calendar__goal"
        onClick={onEditGoalHandler}
        aria-label={
          goal === undefined
            ? "Set no-spend goal"
            : `Edit no-spend goal: ${noSpendDays} of ${goal} days`
        }
      >
        {goal === undefined ? (
          <span className="calendar__goal-empty">+ Set no-spend goal</span>
        ) : (
          <>
            <span className="calendar__goal-label">
              No-spend {noSpendDays} / {goal} days
            </span>
            <span
              className="calendar__goal-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={goal}
              aria-valuenow={noSpendDays}
            >
              <span
                className="calendar__goal-bar-fill"
                style={{ width: `${goalProgress}%` }}
              />
            </span>
          </>
        )}
      </button>

      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar__weekday">
            {label}
          </div>
        ))}
      </div>

      <div className="calendar__grid">
        {days.map((day) => {
          const key = day.format("YYYY-MM-DD");
          const entries = spends[key];
          const hasEntries = entries !== undefined && entries.length > 0;
          const dayTotal = hasEntries ? getDayTotal(entries) : undefined;
          const level = getSpendLevel(dayTotal);
          const isCurrentMonth = day.month() === month.month();
          const isToday = day.isSame(today, "day");

          return (
            <button
              key={key}
              type="button"
              tabIndex={0}
              aria-label={`${day.format("MMMM D, YYYY")}${
                dayTotal !== undefined ? `, spent ${formatAmount(dayTotal)}` : ""
              }`}
              className={[
                "calendar__cell",
                !isCurrentMonth && "calendar__cell--muted",
                isToday && "calendar__cell--today",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                level === "none" || !isCurrentMonth
                  ? undefined
                  : { backgroundColor: SPEND_COLORS[level] }
              }
              onClick={() => onSelectDateHandler(day)}
            >
              <span className="calendar__date-number">{day.date()}</span>
              {dayTotal !== undefined && (
                <span className="calendar__amount">{formatAmount(dayTotal)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
