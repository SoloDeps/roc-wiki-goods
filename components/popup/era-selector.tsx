import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eras } from "@/lib/constants";
import { useEraSelector } from "@/hooks/useEraSelector";

export function EraSelector() {
  const { eraSelected, handleChange } = useEraSelector();

  return (
    <div className="pt-3">
      <h2 className="block text-xs font-medium mb-1">Your current era</h2>

      <Select value={eraSelected?.abbr ?? ""} onValueChange={handleChange}>
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue placeholder="Select your current era" />
        </SelectTrigger>

        <SelectContent>
          {eras.map((era) => (
            <SelectItem key={era.abbr} value={era.abbr} className="text-xs">
              {era.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}