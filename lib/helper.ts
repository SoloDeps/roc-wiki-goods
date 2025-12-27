import { itemsUrl } from "./constants";

type ItemUrlKey = keyof typeof itemsUrl;

export function getItemIcon(type: string): string {
  if (type in itemsUrl) {
    return itemsUrl[type as ItemUrlKey];
  }
  return itemsUrl.default;
}
