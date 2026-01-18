import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

import { TotalDrawer } from "@/components/modals/total-drawer";
import { WorkshopModal } from "@/components/modals/workshop-modal";
import { PresetListModal } from "@/components/modals/preset-list-modal";

interface ButtonGroupTotalProps {
  compareMode?: boolean;
  onToggleCompare?: (enabled: boolean) => void;
}

export function ButtonGroupTotal({
  compareMode = false,
  onToggleCompare,
}: ButtonGroupTotalProps) {
  return (
    <ButtonGroup>
      <TotalDrawer
        compareMode={compareMode}
        onToggleCompare={onToggleCompare}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="pl-2!">
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-sm">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <WorkshopModal variant="ghost" />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <PresetListModal variant="ghost" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
