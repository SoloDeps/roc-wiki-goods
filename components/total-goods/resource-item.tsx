import { memo } from "react";
import { questsFormatNumber } from "@/lib/utils";

interface ResourceItemProps {
  icon?: string;
  name?: string;
  amount?: number;
  difference?: number;
  compareMode?: boolean;
}

export const ResourceItem = memo(
  ({
    icon,
    name,
    amount,
    difference,
    compareMode = false,
  }: ResourceItemProps) => {
    if (!icon && !name && amount === undefined) return null;

    const displayAmount =
      compareMode && difference !== undefined ? difference : amount;
    const isPositive = compareMode && (displayAmount ?? 0) >= 0;
    const isNegative = compareMode && (displayAmount ?? 0) < 0;

    return (
      <div className="flex items-center h-[60px] gap-2 px-2 py-1.5">
        {icon && (
          <img
            src={icon}
            alt={name || ""}
            className="size-8 select-none"
            draggable={false}
          />
        )}
        <div className="flex flex-col min-w-0">
          {name && (
            <span className="text-[10px] font-medium leading-tight uppercase">
              {name}
            </span>
          )}
          {displayAmount !== undefined && (
            <span
              className={`text-sm font-bold leading-tight ${
                compareMode
                  ? isPositive
                    ? "text-green-500"
                    : isNegative
                      ? "text-red-500"
                      : ""
                  : ""
              }`}
            >
              {compareMode && displayAmount > 0 ? "+" : ""}
              {questsFormatNumber(displayAmount)}
            </span>
          )}
        </div>
      </div>
    );
  },
);
