# RoC Wiki Goods

**RoC Wiki Goods** is a browser extension that enhances the user experience on the RoC Wiki.gg website. It displays item icons based on user information and adds a technical calculator directly to the wiki pages.

## Key Features

- Display of item icons based on user data.
  - The extension replaces "primary", "secondary", and "tertiary" text with icons based on user selections.
- Addition of a calculator to Technology and resource tables.
  - Calculator for technology tables to sum the necessary resources.
  - "+" and "-" buttons to adjust quantities in construction/upgrade tables.
- Easy selection and multiplication of quantities in tables.
- Integrated and intuitive interface, using React and TailwindCSS for a modern experience.

## Permissions

- `storage`: Used to locally store user preferences and selections within the extension.
- `activeTab`: Allows interaction with the active page to dynamically modify wiki tables.

## Installation

1.  Download the extension from your browser's store or load the unpacked directory in developer mode.
2.  Navigate to a page on the RoC Wiki.gg website.
3.  Open the extension popup.
4.  Use the dropdown menus to select the desired information (name of buildings).
5.  After filling all dropdowns, the extension reloads the page to display icons instead of text ("primary", "secondary", "tertiary") based on your input.

## Usage

- **Item Icons:** After installation and configuration via the popup, wiki pages display icons instead of "primary", "secondary", and "tertiary" text.
- **Resource Calculation (Technologies):**
  - On technology pages, a column of checkboxes allows you to select technologies and view the total resources needed.
  - Check the boxes to include each technology's resources in the total calculation.
- **Quantity Adjustment (Construction/Upgrade):**
  - In construction and upgrade tables, use the "+" and "-" buttons to modify quantities.
  - The data in the selected row updates automatically based on the chosen multiplier in the "Calculator" column.
- Preferences and selections are stored locally in your browser.

## Support

For questions or suggestions, contact us via the extension's support page or on Discord (Shiin).

## Development

This extension is developed using React within the WXT framework.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
