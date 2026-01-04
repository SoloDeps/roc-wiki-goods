import { CircleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WarningBannerProps {
  title: string;
  description: string;
}

export default function WarningBanner({
  title,
  description,
}: WarningBannerProps) {
  return (
    <Alert variant="warning">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="whitespace-pre-line text-amber-700/90 dark:text-amber-400/95 text-sm">
        {description}
      </AlertDescription>
    </Alert>
  );
}
