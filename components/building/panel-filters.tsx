import { useMemo, memo, useId } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PanelFiltersProps {
  onFilterChange: (filters: {
    tableType?: "construction" | "upgrade";
    location?: string;
    hideHidden?: boolean;
    hideTechnos?: boolean;
  }) => void;
  availableLocations: string[];
  availableTypes: ("construction" | "upgrade")[];
  currentFilters: {
    tableType?: "construction" | "upgrade";
    location?: string;
    hideHidden?: boolean;
    hideTechnos?: boolean;
  };
}

export default memo(function PanelFilters({
  onFilterChange,
  availableLocations,
  availableTypes,
  currentFilters,
}: PanelFiltersProps) {
  const hideHiddenId = useId();
  const hideTechnosId = useId();

  const tableType = currentFilters.tableType || "all";
  const location = currentFilters.location || "all";
  const hideHidden = currentFilters.hideHidden ?? false;
  const hideTechnos = currentFilters.hideTechnos ?? false;

  const locations = useMemo(
    () => ["all", ...availableLocations],
    [availableLocations],
  );
  const types = useMemo(() => ["all", ...availableTypes], [availableTypes]);

  const handleTypeChange = (type: "all" | "construction" | "upgrade") => {
    if (type !== "all" && !availableTypes.includes(type)) return;
    onFilterChange({
      tableType: type === "all" ? undefined : type,
      location: location === "all" ? undefined : location,
      hideHidden,
      hideTechnos,
    });
  };

  const handleLocationChange = (loc: string) => {
    if (loc !== "all" && !availableLocations.includes(loc)) return;
    onFilterChange({
      tableType: tableType === "all" ? undefined : tableType,
      location: loc === "all" ? undefined : loc,
      hideHidden,
      hideTechnos,
    });
  };

  const handleHideHiddenToggle = (value: string) => {
    const checked = value === "true";
    onFilterChange({
      tableType: tableType === "all" ? undefined : tableType,
      location: location === "all" ? undefined : location,
      hideHidden: checked,
      hideTechnos,
    });
  };

  const handleHideTechnosToggle = (value: string) => {
    const checked = value === "true";
    onFilterChange({
      tableType: tableType === "all" ? undefined : tableType,
      location: location === "all" ? undefined : location,
      hideHidden,
      hideTechnos: checked,
    });
  };

  const hasActiveFilters =
    tableType !== "all" || location !== "all" || hideHidden || hideTechnos;

  return (
    <div className="">
      <div className="w-full flex p-3 gap-6">
        {/* Left section - Main filters */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Building Type</h4>
            <div className="flex gap-2">
              {types.map((type) => (
                <Button
                  key={type}
                  variant={tableType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    handleTypeChange(type as "all" | "construction" | "upgrade")
                  }
                >
                  {type === "all"
                    ? "All"
                    : type === "construction"
                      ? "Construction"
                      : "Upgrade"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">City</h4>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Button
                  key={loc}
                  variant={location === loc ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLocationChange(loc)}
                >
                  {loc === "all" ? "All" : loc}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right section - Display options */}
        <div className="w-56 space-y-4 border-l pl-5">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Hide "hidden" cards</h4>
            <RadioGroup
              value={hideHidden.toString()}
              onValueChange={handleHideHiddenToggle}
              className="flex gap-2"
            >
              <label
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "has-data-[state=checked]:bg-primary",
                  "has-data-[state=checked]:text-primary-foreground",
                  "has-data-[state=checked]:border-primary",
                  "has-data-[state=checked]:hover:bg-primary!",
                  "has-data-[state=checked]:hover:text-primary-foreground!",
                  "has-data-[state=checked]:hover:opacity-100!",
                )}
              >
                <RadioGroupItem
                  id={`${hideHiddenId}-off`}
                  value="false"
                  className="sr-only after:absolute after:inset-0"
                />
                <span className="text-sm font-medium">Off</span>
              </label>

              <label
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "has-data-[state=checked]:bg-primary",
                  "has-data-[state=checked]:text-primary-foreground",
                  "has-data-[state=checked]:border-primary",
                  "has-data-[state=checked]:hover:bg-primary!",
                  "has-data-[state=checked]:hover:text-primary-foreground!",
                  "has-data-[state=checked]:hover:opacity-100!",
                )}
              >
                <RadioGroupItem
                  id={`${hideHiddenId}-on`}
                  value="true"
                  className="sr-only after:absolute after:inset-0"
                />
                <span className="text-sm font-medium">On</span>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Hide "Technologies"</h4>
            <RadioGroup
              value={hideTechnos.toString()}
              onValueChange={handleHideTechnosToggle}
              className="flex gap-2"
            >
              <label
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "has-data-[state=checked]:bg-primary",
                  "has-data-[state=checked]:text-primary-foreground",
                  "has-data-[state=checked]:border-primary",
                  "has-data-[state=checked]:hover:bg-primary!",
                  "has-data-[state=checked]:hover:text-primary-foreground!",
                  "has-data-[state=checked]:hover:opacity-100!",
                )}
              >
                <RadioGroupItem
                  id={`${hideTechnosId}-off`}
                  value="false"
                  className="sr-only after:absolute after:inset-0"
                />
                <span className="text-sm font-medium">Off</span>
              </label>

              <label
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "has-data-[state=checked]:bg-primary",
                  "has-data-[state=checked]:text-primary-foreground",
                  "has-data-[state=checked]:border-primary",
                  "has-data-[state=checked]:hover:bg-primary!",
                  "has-data-[state=checked]:hover:text-primary-foreground!",
                  "has-data-[state=checked]:hover:opacity-100!",
                )}
              >
                <RadioGroupItem
                  id={`${hideTechnosId}-on`}
                  value="true"
                  className="sr-only after:absolute after:inset-0"
                />
                <span className="text-sm font-medium">On</span>
              </label>
            </RadioGroup>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex gap-1.5 items-center py-2 px-3 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {tableType !== "all" && (
            <Badge variant="secondary" className="rounded-md h-6">
              {tableType === "construction" ? "Construction" : "Upgrade"}
            </Badge>
          )}
          {location !== "all" && (
            <Badge variant="secondary" className="rounded-md h-6">
              {location}
            </Badge>
          )}
          {hideHidden && (
            <Badge variant="secondary" className="rounded-md h-6">
              Hide Hidden
            </Badge>
          )}
          {hideTechnos && (
            <Badge variant="secondary" className="rounded-md h-6">
              Hide Technos
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => onFilterChange({})}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
});
