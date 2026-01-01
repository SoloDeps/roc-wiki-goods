import { useId } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SelectWikiTable({
  selectedTable,
  onTableChange,
}: {
  selectedTable: string;
  onTableChange: (value: string) => void;
}) {
  const id = useId();

  const items = [
    { label: "Construction", value: "construction" },
    { label: "Upgrade", value: "upgrade" },
  ];

  return (
    <fieldset className="space-y-4 pb-4">
      <legend className="text-sm font-medium text-foreground">
        Wiki table type
      </legend>

      <RadioGroup
        value={selectedTable}
        onValueChange={onTableChange}
        className="flex gap-2"
      >
        {items.map((item) => (
          <label
            key={`${id}-${item.value}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "has-data-[state=checked]:bg-primary",
              "has-data-[state=checked]:text-primary-foreground",
              "has-data-[state=checked]:border-primary",
              "has-data-[state=checked]:hover:bg-primary!",
              "has-data-[state=checked]:hover:text-primary-foreground!",
              "has-data-[state=checked]:hover:opacity-100!"
            )}
          >
            <RadioGroupItem
              id={`${id}-${item.value}`}
              value={item.value}
              className="sr-only after:absolute after:inset-0"
            />
            <span className="text-sm font-medium">{item.label}</span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
