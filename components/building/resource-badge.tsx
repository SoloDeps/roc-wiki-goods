import { memo, useState, useEffect } from "react";

export const ResourceBadge = memo(function ResourceBadge({
  icon,
  value,
  alt,
}: {
  icon: string;
  value: string;
  alt: string;
}) {
  const [src, setSrc] = useState(icon);

  useEffect(() => {
    setSrc(icon);
  }, [icon]);

  return (
    <div className="flex items-center justify-between px-2 rounded-md bg-background-100 border border-alpha-200 h-8 shrink-0">
      <img src={src} alt={alt} className="size-[25px] select-none" draggable={false} onError={() => setSrc("/goods/default.webp")} />
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
});
