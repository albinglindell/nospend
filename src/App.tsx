import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ConfigProvider, theme } from "antd";
import Calendar from "./components/Calendar";
import SpendModal from "./components/SpendModal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { SPEND_COLORS, YELLOW_THRESHOLD } from "./utils/spendColor";
import "./App.css";

type SpendMap = Record<string, number>;

const STORAGE_KEY = "nospend.spends.v1";

const formatKey = (date: Dayjs) => date.format("YYYY-MM-DD");

const App = () => {
  const [spends, setSpends] = useLocalStorage<SpendMap>(STORAGE_KEY, {});
  const [month, setMonth] = useState<Dayjs>(() => dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

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

  const onSaveHandler = (date: Dayjs, amount: number) => {
    const key = formatKey(date);
    setSpends((current) => ({ ...current, [key]: amount }));
    setSelectedDate(() => null);
  };

  const onDeleteHandler = (date: Dayjs) => {
    const key = formatKey(date);
    setSpends((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSelectedDate(() => null);
  };

  const initialAmount = selectedDate ? spends[formatKey(selectedDate)] : undefined;

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
          initialAmount={initialAmount}
          onSaveHandler={onSaveHandler}
          onDeleteHandler={onDeleteHandler}
          onCloseHandler={onCloseModalHandler}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
