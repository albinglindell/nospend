import { useEffect, useState } from "react";
import { Modal, InputNumber, Button, Space } from "antd";

type GoalModalProps = {
  monthLabel: string | null;
  initialGoal: number | undefined;
  maxDays: number;
  onSaveHandler: (goal: number) => void;
  onRemoveHandler: () => void;
  onCloseHandler: () => void;
};

const GoalModal = ({
  monthLabel,
  initialGoal,
  maxDays,
  onSaveHandler,
  onRemoveHandler,
  onCloseHandler,
}: GoalModalProps) => {
  const [goal, setGoal] = useState<number | null>(null);

  useEffect(() => {
    if (monthLabel !== null) {
      setGoal(() => initialGoal ?? null);
    }
  }, [monthLabel, initialGoal]);

  const onSaveClickHandler = () => {
    if (goal === null || Number.isNaN(goal)) return;
    onSaveHandler(goal);
  };

  return (
    <Modal
      open={monthLabel !== null}
      title={monthLabel ? `No-spend goal · ${monthLabel}` : ""}
      onCancel={onCloseHandler}
      footer={null}
      centered
      destroyOnClose
      width={360}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <InputNumber
          autoFocus
          value={goal ?? undefined}
          onChange={(value) =>
            setGoal(() => (typeof value === "number" ? value : null))
          }
          onPressEnter={onSaveClickHandler}
          min={1}
          max={maxDays}
          step={1}
          size="large"
          placeholder="No-spend days target"
          style={{ width: "100%" }}
          inputMode="numeric"
        />

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button
            danger
            onClick={onRemoveHandler}
            disabled={initialGoal === undefined}
          >
            Remove
          </Button>
          <Space>
            <Button onClick={onCloseHandler}>Cancel</Button>
            <Button
              type="primary"
              onClick={onSaveClickHandler}
              disabled={goal === null}
            >
              Save
            </Button>
          </Space>
        </Space>
      </Space>
    </Modal>
  );
};

export default GoalModal;
