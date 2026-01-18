import { MinusIcon, PlusIcon } from "lucide-react";
import { memo } from "react";
import { Button, Group, NumberField } from "react-aria-components";

interface BuildingCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

function BuildingCounter({ value, onChange, min = 1, max = 999, disabled = false }: BuildingCounterProps) {
  return (
    <NumberField value={value} onChange={onChange} minValue={min} maxValue={max} isDisabled={disabled} aria-label="Building quantity">
      <Group className="relative inline-flex h-8 items-center overflow-hidden whitespace-nowrap rounded-sm border border-input text-sm shadow-sm">
        <Button
          slot="decrement"
          className="flex aspect-square h-[inherit] items-center justify-center border-r border-input bg-background-100 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <MinusIcon aria-hidden="true" size={16} />
        </Button>

        <div className="flex items-center justify-center size-8 px-2 bg-background-100 text-center font-medium tabular-nums select-none">
          {value}
        </div>

        <Button
          slot="increment"
          className="flex aspect-square h-[inherit] items-center justify-center border-l border-input bg-background-100 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <PlusIcon aria-hidden="true" size={16} />
        </Button>
      </Group>
    </NumberField>
  );
}

export default memo(BuildingCounter);