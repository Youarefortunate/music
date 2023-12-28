import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      exclude: [
        "node_modules",
        ".git",
        ".gitlab",
        ".husky",
        ".vscode",
        "build",
        "dist",
        "mock",
        "public",
        "./stats.html",
      ],
    },
  },

  presets: [presetUno(), presetAttributify(), presetIcons()],
  shortcuts: [],
  rules: [],
});
