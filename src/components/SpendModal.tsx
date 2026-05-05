import { useEffect, useState } from "react";
import { Modal, InputNumber, Button, Space, List, Empty } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { getDayTotal, SpendEntry } from "../utils/spendEntry";

type SpendModalProps = {
  date: Dayjs | null;
  entries: SpendEntry[];
  onAddEntryHandler: (date: Dayjs, amount: number) => void;
  onRemoveEntryHandler: (date: Dayjs, entryId: string) => void;
  onCloseHandler: () => void;
};

const SpendModal = ({
  date,
  entries,
  onAddEntryHandler,
  onRemoveEntryHandler,
  onCloseHandler,
}: SpendModalProps) => {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (date) {
      setAmount(() => null);
    }
  }, [date]);

  const onAddClickHandler = () => {
    if (!date || amount === null || Number.isNaN(amount)) return;
    onAddEntryHandler(date, amount);
    setAmount(() => null);
  };

  const onRemoveClickHandler = (entryId: string) => {
    if (!date) return;
    onRemoveEntryHandler(date, entryId);
  };

  const total = getDayTotal(entries);

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
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {entries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No costs yet"
          />
        ) : (
          <List
            size="small"
            dataSource={entries}
            renderItem={(entry) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    danger
                    aria-label="Remove cost"
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveClickHandler(entry.id)}
                  />,
                ]}
              >
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  {entry.amount}
                </span>
              </List.Item>
            )}
            footer={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span>{total}</span>
              </div>
            }
          />
        )}

        <Space.Compact style={{ width: "100%" }}>
          <InputNumber
            value={amount ?? undefined}
            onChange={(value) =>
              setAmount(() => (typeof value === "number" ? value : null))
            }
            onPressEnter={onAddClickHandler}
            min={0}
            step={10}
            size="large"
            placeholder="Amount"
            style={{ width: "100%" }}
            inputMode="decimal"
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={onAddClickHandler}
            disabled={amount === null}
          >
            Add cost
          </Button>
        </Space.Compact>

        <Button block onClick={onCloseHandler}>
          Close
        </Button>
      </Space>
    </Modal>
  );
};

export default SpendModal;

export const formatModalDate = (date: Dayjs) => dayjs(date).format("YYYY-MM-DD");
