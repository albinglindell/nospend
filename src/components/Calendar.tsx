import { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { getSpendLevel, SPEND_COLORS } from "../utils/spendColor";
import { formatAmount, getDayTotal, SpendMap } from "../utils/spendEntry";
import "./Calendar.css";

type CalendarProps = {
  month: Dayjs;
  spends: SpendMap;
  onPrevMonthHandler: () => void;
  onNextMonthHandler: () => void;
  onSelectDateHandler: (date: Dayjs) => void;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = ({
  month,
  spends,
  onPrevMonthHandler,
  onNextMonthHandler,
  onSelectDateHandler,
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

  const monthTotal = useMemo(() => {
    const monthKeyPrefix = month.format("YYYY-MM");
    return Object.entries(spends).reduce((total, [key, entries]) => {
      if (!key.startsWith(monthKeyPrefix)) return total;
      return total + getDayTotal(entries);
    }, 0);
  }, [month, spends]);

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
