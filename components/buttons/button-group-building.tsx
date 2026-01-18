import { useState } from "react";
import {
  ChevronDownIcon,
  ListCollapseIcon,
  ListTreeIcon,
  TrashIcon,
  Filter,
  EyeOff,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddBuildingSheet } from "../add-building-sheet";
import {
  hideAllBuildings,
  showAllBuildings,
  hideAllTechnos,
  showAllTechnos,
} from "@/lib/overview/storage";

interface ButtonGroupBuildingProps {
  onFiltersChange?: (filters: any) => void;
  filters?: any;
  activeFiltersCount?: number;
  onToggleFilters?: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onDeleteAll?: () => void;
}

export function ButtonGroupBuilding({
  activeFiltersCount = 0,
  onToggleFilters,
  onExpandAll,
  onCollapseAll,
  onDeleteAll,
}: ButtonGroupBuildingProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDeleteAll = () => {
    onDeleteAll?.();
    setDropdownOpen(false);
  };

  const handleHideAll = async () => {
    await hideAllBuildings();
    await hideAllTechnos();
    setDropdownOpen(false);
  };

  const handleShowAll = async () => {
    await showAllBuildings();
    await showAllTechnos();
    setDropdownOpen(false);
  };

  return (
    <>
      <ButtonGroup className="block xl:hidden">
        <AddBuildingSheet />
      </ButtonGroup>

      <ButtonGroup className="hidden md:block">
        <Button variant="outline" size="sm" onClick={onCollapseAll}>
          Collapse All
        </Button>
        <Button variant="outline" size="sm" onClick={onExpandAll}>
          Expand All
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden xl:block">
        <Button variant="outline" size="sm" onClick={handleHideAll}>
          Hide All
        </Button>
        <Button variant="outline" size="sm" onClick={handleShowAll}>
          Show All
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="flex items-center gap-2"
        >
          <Filter className="size-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="pl-2!">
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="rounded-sm">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCollapseAll} className="lg:hidden">
                <ListCollapseIcon />
                Collapse All
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onExpandAll} className="lg:hidden">
                <ListTreeIcon />
                Expand All
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleHideAll} className="lg:hidden">
                <EyeOff />
                Hide All
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleShowAll} className="lg:hidden">
                <Eye />
                Show All
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="lg:hidden" />

            <DropdownMenuGroup>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <TrashIcon />
                    Delete All
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-background-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-neutral-400">
                      This action cannot be <b>undone</b>.<br />
                      This will permanently{" "}
                      <b>delete all buildings and technologies</b>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </>
  );
}
