"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ListCollapseIcon,
  ListTreeIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { AddBuildingSheet } from "../add-building-sheet";

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
  onFiltersChange,
  filters,
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
  return (
    <>
      <ButtonGroup>
        <AddBuildingSheet />
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
              <DropdownMenuItem onClick={onCollapseAll}>
                <ListCollapseIcon />
                Collapse All
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onExpandAll}>
                <ListTreeIcon />
                Expand All
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

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
                      <b>replace the current selections</b>.
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
