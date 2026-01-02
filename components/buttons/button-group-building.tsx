"use client";

import {
  ChevronDownIcon,
  ListCollapseIcon,
  ListTreeIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
        <DropdownMenu>
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
              <DropdownMenuItem variant="destructive" onClick={onDeleteAll}>
                <TrashIcon />
                Delete All
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </>
  );
}
