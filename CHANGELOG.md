# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec2.0.0.html).

## v1.2.6 - Dec 18, 2025

### Added

- Add option page
- Add anti-FOUC
- Add dark mode
- Create popup header component

### Changed

- Update popup design
- Update app.tsx for popup
- Update era selector in popup with shadcn ui
- Update building selector in popup with shadcn ui

## v1.2.4 - Dec 17, 2025

### Fixed

- Fix fallback task for events questlines

## v1.2.3 - Dec 16, 2025

### Fixed

- Fix era selector warning in popup

### Changed

- Update wxt config + imports
- Upgrade dependencies to latest version (wxt 0.20.11)
- Add override for dotenv

## v1.2.2 - Nov 15, 2025

### Added

- Add unitsData in `questsData.ts`

### Changed

- Update `questlines.ts` to handle units
- Replace `heavy` by `heavyinfantry` in `questlines.ts`

## v1.2.1 - Nov 10, 2025

### Fixed

- Fix era selector in popup
- Fix url for replaceImage function in utils

## v1.2.0 - Nov 9, 2025

### Added

- Add era selector in popup
- Add itemsUrl in utils (images url)
- Add questsFormatNumber function in utils

### Changed

- Refactor al structure of the project
- Refactor goodsUrlByEra in constants
- Add alias import in tsconfig.json
- Update design of the popup

### Fixed

- Update updateImageSrcByAlt function in building.ts

## v1.1.3 - Oct 27, 2025

### Changed

- Update limit buildings for EG era in `constants.ts`.
- Update PR text in `wonders.ts`.

### Fixed

- Update extractGoods function in `wonders.ts`.

## v1.1.2 - Oct 11, 2025

### Added

- Add `size` column in skipColumns constants in `constants.ts`.

### Changed

- Update `limitBuildingsByEra` constants for construction and upgrade tables (home_cultures and allied_cultures pages) in `constants.ts`.

## v1.1.1 - Sep 17, 2025

### Added

- Add `filterTables` function in `utils.ts`.
- Add `TableInfo` interface in `upgrade.ts`.
- Add `detectEraRow` function in `upgrade.ts`.
- Add `skipBuildingLimit` constants in `constants.ts`.
- Add `limitBuildingsByEra` constants for construction and upgrade tables (home_cultures and allied_cultures pages) in `constants.ts`.

### Changed

- Remove `findTimeTable` function in `upgrade.ts`.
- Remove `primaryWorkshop` logic for workshops in `upgrade.ts` and `content.ts`.
- Update `getMaxQty` function in `upgrade.ts` to handle limit buildings by era.
- Update `addMultiplicatorColumn` function in `upgrade.ts`.
- Update `useUpgrade` function in `upgrade.ts`.
- Add h3 support in `findPreviousH2SpanWithId` function in `utils.ts` to handle allied_cultures pages.

### Fixed

- Fix min max select sync in `wonders.ts`.

## v1.1.0 - Aug 11, 2025

### Added

- Add wonders part
- Add Early Gothic era in popup

### Changed

- Move `updateTotal` function outside of `useTechno` function in `techno.ts`.

## v1.0.7 - Jun 13, 2025

### Added

- Add `useBuilding` function in `building.ts`.
- Add `updateImageSrcByAlt` function in `building.ts`.
- Add `SA` in goodsUrlByEra in `constants.ts`.
- Add images for Early Gothic in `constants.ts`.

### Changed

- Update error message in `popup.tsx`.
- Add redirect to wiki in `popup.tsx`.

## v1.0.6 - May 18, 2025

### Added

- Add warning text in popup.
- Add `getTitlePage` function in `upgrade.ts` for "home_cultures" & "allied_cultures" pages only.
- Add `counterSelection` span in total row in `techno.ts`.
- Add `updateCounterSelection` function in `techno.ts`.

## v1.0.5 - May 8, 2025

### Added

- Add reset button in popup.

### Changed

- Update unwatch function in content.ts.

### Fixed

- Replace `getTablesAfterSections` by `findPreviousH2SpanWithId` in constant.ts.

## v1.0.5 - May 8, 2025

### Added

- Add reset button in popup.

### Changed

- Update unwatch function in content.ts.

### Fixed

- Replace `getTablesAfterSections` by `findPreviousH2SpanWithId` in constant.ts.

## v1.0.4 - May 2, 2025

Reroll on Chrome Web Store after bug with `getTablesAfterSections` function in content.ts.

## v1.0.3 - May 2, 2025

### Added

- Add `getTablesAfterSections` function for get all tables based on id element in `content.ts`.
- Add `changelog.md`

### Changed

- Update `readme.md` for installation (dev part).

## v1.0.2 - Apr 30, 2025

### Added

- Add `select-none` & `pointer-event-none` classes on img in the popup.

### Changed

- Replace Tertiary input by a div with an input style. More secure against vulnerability.

### Fixed

- Fix input height in the popup.
- Fix limit on workshops/cultures pages.

## v1.0.1 - Apr 22, 2025

### Added

- Add Upgrade part
- Add text in the input for increase lisibility
- Add images in dropdowns for each building names

### Changed

- Update display goods in total row with a filter (one column = one era)

### Fixed

- Remove all innerHtml & insertAdjacentHtml. More secure against vulnerability.

## v1.0.0 - Mar 31, 2025

### Added

- Original extension code for RoC Display Goods. Techno part only.
