import { memo } from "react";
import { questsFormatNumber } from "@/lib/utils";

interface ResourceItemProps {
  icon?: string;
  name?: string;
  amount?: number;
}

export const ResourceItem = memo(
  ({ icon, name, amount }: ResourceItemProps) => {
    if (!icon && !name && amount === undefined) return null;

    return (
      <div className="flex items-center h-[60px] gap-2 px-2 py-1.5">
        {icon && (
          <img
            src={icon}
            alt=""
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
          {amount !== undefined && (
            <span className="text-sm font-bold leading-tight">
              {questsFormatNumber(amount)}
            </span>
          )}
        </div>
      </div>
    );
  }
);
