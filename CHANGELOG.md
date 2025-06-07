# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.7 - Jun 7, 2025

### Added

- Add `useBuilding` function in `building.ts`.
- Add `updateImageSrcByAlt` function in `building.ts`.
- Add `SA` in goodsUrlByEra in `constants.ts`.

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
