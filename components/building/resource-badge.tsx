import { memo } from "react";

export const ResourceBadge = memo(function ResourceBadge({
  icon,
  value,
  alt,
}: {
  icon: string;
  value: string;
  alt: string;
}) {
  return (
    <div className="flex items-center justify-between px-2 rounded-md bg-background-100 border border-alpha-200 h-8 shrink-0">
      <img src={icon} alt={alt} className="size-[25px] select-none" draggable={false} />
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
});
