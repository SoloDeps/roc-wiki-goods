# RoC Wiki Goods

**RoC Wiki Goods** is a browser extension that enhances the user experience on the RoC Wiki.gg website. It displays item icons based on user information and adds a technical calculator directly to the wiki pages.

## Features

- **Item Icons:** After installation and configuration via the popup, wiki pages display icons instead of "primary", "secondary", and "tertiary" text.
- **Resource Calculation (Technology):**
  - On Technology table, a column of checkboxes allows you to select technologies and view the total resources needed.
  - Check the boxes to include each technology's resources in the total calculation.
- **Quantity Adjustment (Construction/Upgrade):**
  - In Construction and Upgrade tables, use the "+" and "-" buttons to modify quantities.
  - The data in the selected row updates automatically based on the chosen multiplier in the "Calculator" column.
- Preferences and selections are stored locally in your browser.

## Permissions

- `storage`: Used to locally store user preferences and selections within the extension.
- `activeTab`: Allows interaction with the active page to dynamically modify wiki tables.

## Usage

1.  Download the extension from your browser's store or load the unpacked directory in developer mode.
2.  Navigate to a page on the [RoC Wiki.gg](https://riseofcultures.wiki.gg/wiki/Rise_of_Cultures_Wiki) website.
3.  Open the extension popup.
4.  Use the dropdown menus to select the desired information (name of buildings).
5.  After filling all dropdowns, the extension reloads the page to display icons instead of text ("primary", "secondary", "tertiary") based on your input.

- Page for [Technology Table](https://riseofcultures.wiki.gg/wiki/Home_Cultures/Roman_Empire)
- Page for [Construction/Upgrade Table](https://riseofcultures.wiki.gg/wiki/Home_Cultures/Homes/Small_Home)

# Development

## Installation

Extract the zip folder and open a terminal in the folder.

### Steps

1. Install dependencies using pnpm:

```sh
pnpm install
```

2. Start the development server:

```sh
pnpm run dev
```

3. For build, run this command.

- Chrome:
```sh
pnpm run zip
```

- Firefox:
```sh
pnpm run zip:firefox
```

All folders generate with this command are in the `.output/`.

## Tech Stack + Features

### Frameworks

- [React](https://react.dev/) – The library for web and native user interfaces.
- [WXT](https://wxt.dev/) – An open source tool that makes web extension development faster than ever before.

---

## Support

For questions or suggestions, contact us via the extension's support page.