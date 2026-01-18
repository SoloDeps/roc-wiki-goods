import {
  expandAllFeature,
  hotkeysCoreFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
  type TreeState,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import {
  CircleXIcon,
  FilterIcon,
  FolderIcon,
  FolderOpenIcon,
  LinkIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";
import { links, type Item } from "@/lib/data/links";
import { WIKI_URL } from "@/lib/constants";

const indent = 20;

export default function LinkTree({ selectedTable }: { selectedTable: string }) {
  // store the initial expanded items to reset when search is cleared
  const initialExpandedItems = [""];
  const [state, setState] = useState<Partial<TreeState<Item>>>({});
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tree = useTree<Item>({
    dataLoader: {
      getChildren: (itemId) => {
        const children = links[itemId].children ?? [];
        // sort children: technologies first, capital second, then alphabetically
        return children.sort((a, b) => {
          const itemA = links[a];
          const itemB = links[b];

          // Technologies always first
          if (itemA.name === "Technologies") return -1;
          if (itemB.name === "Technologies") return 1;

          // Capital always second
          if (itemA.name === "Capital") return -1;
          if (itemB.name === "Capital") return 1;

          // For children of Technologies, keep original order
          const parent = links[itemId];
          if (parent?.name === "Technologies") {
            return 0; // Don't sort, keep original order
          }

          // Otherwise alphabetical
          return itemA.name.localeCompare(itemB.name);
        });
      },
      getItem: (itemId) => links[itemId],
    },
    features: [
      syncDataLoaderFeature,
      hotkeysCoreFeature,
      selectionFeature,
      searchFeature,
      expandAllFeature,
    ],
    getItemName: (item) => item.getItemData().name,
    indent,
    initialState: {
      expandedItems: initialExpandedItems,
    },
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    rootItemId: "root",
    setState,
    state,
  });

  // Handle clearing the search
  const handleClearSearch = () => {
    setSearchValue("");

    // Manually trigger the tree's search onChange with an empty value
    // to ensure item.isMatchingSearch() is correctly updated.
    const searchProps = tree.getSearchInputElementProps();
    if (searchProps.onChange) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>; // Cast to the expected event type
      searchProps.onChange(syntheticEvent);
    }

    // restore initial expanded state
    setState((prevState) => ({
      ...prevState,
      expandedItems: initialExpandedItems,
    }));

    // clear custom filtered items
    setFilteredItems([]);

    if (inputRef.current) {
      inputRef.current.focus();
      // also clear the internal search input
      inputRef.current.value = "";
    }
  };

  // keep track of filtered items separately from the tree's internal search state
  const [filteredItems, setFilteredItems] = useState<string[]>([]);

  // This function determines if an item should be visible based on our custom filtering
  const shouldShowItem = (itemId: string) => {
    if (!searchValue || searchValue.length === 0) return true;
    return filteredItems.includes(itemId);
  };

  // update filtered items when search value changes
  useEffect(() => {
    if (!searchValue || searchValue.length === 0) {
      setFilteredItems([]);
      return;
    }

    // get all items
    const allItems = tree.getItems();

    // first, find direct matches
    const directMatches = allItems
      .filter((item) => {
        const name = item.getItemName().toLowerCase();
        return name.includes(searchValue.toLowerCase());
      })
      .map((item) => item.getId());

    // then, find all parent ids of matching items
    const parentIds = new Set<string>();
    for (const matchId of directMatches) {
      let item = tree.getItems().find((i) => i.getId() === matchId);

      while (item?.getParent?.()) {
        const parent = item.getParent();
        if (parent) {
          parentIds.add(parent.getId());
          item = parent;
        } else {
          break;
        }
      }
    }

    // Find all children of matching items
    const childrenIds = new Set<string>();
    for (const matchId of directMatches) {
      const item = tree.getItems().find((i) => i.getId() === matchId);

      if (item?.isFolder()) {
        const getDescendants = (itemId: string) => {
          const children = links[itemId]?.children || [];

          for (const childId of children) {
            childrenIds.add(childId);

            if (links[childId]?.children?.length) {
              getDescendants(childId);
            }
          }
        };

        getDescendants(item.getId());
      }
    }

    // combine direct matches, parents, and children
    setFilteredItems([
      ...directMatches,
      ...Array.from(parentIds),
      ...Array.from(childrenIds),
    ]);

    // keep all folders expanded during search to ensure all matches are visible
    // store current expanded state first
    const currentExpandedItems = tree.getState().expandedItems || [];

    // get folder ids that need to be expanded to show matches
    const folderIdsToExpand = allItems
      .filter((item) => item.isFolder())
      .map((item) => item.getId());

    // update expanded items in the tree state
    setState((prevState) => ({
      ...prevState,
      expandedItems: [
        ...new Set([...currentExpandedItems, ...folderIdsToExpand]),
      ],
    }));
  }, [searchValue, tree]);

  return (
    <div className="flex h-full flex-col gap-2 *:nth-2:grow">
      <div className="relative">
        <Input
          className="peer ps-9"
          onBlur={(e) => {
            // prevent default blur behavior
            e.preventDefault();

            // re-apply the search to ensure it stays active
            if (searchValue && searchValue.length > 0) {
              const searchProps = tree.getSearchInputElementProps();
              if (searchProps.onChange) {
                const syntheticEvent = {
                  target: { value: searchValue },
                } as React.ChangeEvent<HTMLInputElement>;
                searchProps.onChange(syntheticEvent);
              }
            }
          }}
          onChange={(e) => {
            const value = e.target.value;
            setSearchValue(value);

            // apply the search to the tree's internal state as well
            const searchProps = tree.getSearchInputElementProps();
            if (searchProps.onChange) {
              searchProps.onChange(e);
            }

            if (value.length > 0) {
              // if input has at least one character, expand all items
              tree.expandAll();
            } else {
              // if input is cleared, reset to initial expanded state
              setState((prevState) => ({
                ...prevState,
                expandedItems: initialExpandedItems,
              }));
              setFilteredItems([]);
            }
          }}
          placeholder="Filter links..."
          // prevent the internal search from being cleared on blur
          ref={inputRef}
          type="search"
          value={searchValue}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <FilterIcon aria-hidden="true" className="size-4" />
        </div>
        {searchValue && (
          <button
            aria-label="Clear search"
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleClearSearch}
            type="button"
          >
            <CircleXIcon aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      <Tree
        className="before:-ms-1 relative before:absolute before:inset-0 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
        indent={indent}
        tree={tree}
      >
        {searchValue && filteredItems.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm">
            No items found for "{searchValue}"
          </p>
        ) : (
          tree.getItems().map((item) => {
            const isVisible = shouldShowItem(item.getId());
            const anchor =
              selectedTable === "upgrade" ? "#Upgrade" : "#Construction";
            const finalHref =
              WIKI_URL +
              item.getItemData().href +
              (item.getItemData()?.useRawHref ? "" : anchor);

            return (
              <TreeItem
                asChild={!item.isFolder() && !!item.getItemData()?.href}
                className="data-[visible=false]:hidden"
                data-visible={isVisible || !searchValue}
                item={item}
                key={item.getId()}
              >
                {!item.isFolder() && item.getItemData()?.href ? (
                  <a target="_blank" href={finalHref}>
                    <TreeItemLabel className="before:-inset-y-0.5 before:-z-10 relative before:absolute before:inset-x-0 before:bg-background">
                      <span className="flex items-center gap-2">
                        <LinkIcon className="pointer-events-none size-4 text-muted-foreground" />
                        {item.getItemName()}
                      </span>
                    </TreeItemLabel>
                  </a>
                ) : (
                  <TreeItemLabel className="before:-inset-y-0.5 before:-z-10 relative before:absolute before:inset-x-0 before:bg-background">
                    <span className="flex items-center gap-2">
                      {item.isFolder() &&
                        (item.isExpanded() ? (
                          <FolderOpenIcon className="pointer-events-none size-4 text-muted-foreground" />
                        ) : (
                          <FolderIcon className="pointer-events-none size-4 text-muted-foreground" />
                        ))}
                      {item.getItemName()}
                    </span>
                  </TreeItemLabel>
                )}
              </TreeItem>
            );
          })
        )}
      </Tree>
    </div>
  );
}
