import { useEffect, useState } from "react";
import { Modal, InputNumber, Button, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";

type SpendModalProps = {
  date: Dayjs | null;
  initialAmount: number | undefined;
  onSaveHandler: (date: Dayjs, amount: number) => void;
  onDeleteHandler: (date: Dayjs) => void;
  onCloseHandler: () => void;
};

const SpendModal = ({
  date,
  initialAmount,
  onSaveHandler,
  onDeleteHandler,
  onCloseHandler,
}: SpendModalProps) => {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (date) {
      setAmount(() => initialAmount ?? 0);
    }
  }, [date, initialAmount]);

  const onSaveClickHandler = () => {
    if (!date || amount === null) return;
    onSaveHandler(date, amount);
  };

  const onDeleteClickHandler = () => {
    if (!date) return;
    onDeleteHandler(date);
  };

  return (
    <Modal
      open={date !== null}
      title={date ? date.format("dddd, MMMM D") : ""}
      onCancel={onCloseHandler}
      footer={null}
      centered
      destroyOnClose
      width={360}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <InputNumber
          autoFocus
          value={amount ?? undefined}
          onChange={(value) => setAmount(() => (typeof value === "number" ? value : 0))}
          min={0}
          step={10}
          size="large"
          placeholder="Amount spent"
          style={{ width: "100%" }}
          inputMode="decimal"
        />

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button
            danger
            onClick={onDeleteClickHandler}
            disabled={initialAmount === undefined}
          >
            Clear
          </Button>
          <Space>
            <Button onClick={onCloseHandler}>Cancel</Button>
            <Button type="primary" onClick={onSaveClickHandler}>
              Save
            </Button>
          </Space>
        </Space>
      </Space>
    </Modal>
  );
};

export default SpendModal;

export const formatModalDate = (date: Dayjs) => dayjs(date).format("YYYY-MM-DD");
