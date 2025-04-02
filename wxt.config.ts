import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    version: "1.0.0",
    name: "RoC Wiki Goods",
    description: "Show item icons based on user info and tech calculator on RoC Wiki.gg",
    permissions: ["storage", "activeTab"],
  },
});
