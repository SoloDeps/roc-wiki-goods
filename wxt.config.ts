import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  outDirTemplate: '{{browser}}-mv{{manifestVersion}}',
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss() as any],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
  }),
  manifest: {
    version: "1.2.8",
    name: "RoC Wiki Goods",
    description: "Show item icons based on user info and tech calculator on RoC Wiki.gg",
    permissions: ["storage", "activeTab"],
  },
});
