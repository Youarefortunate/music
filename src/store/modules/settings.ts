import { defineStore } from "pinia";
import defaultSettings from "@/settings";
import type { TransitionType } from "@/settings";
import { useStorage } from "@vueuse/core";

export const useSettingsStore = defineStore("setting", () => {
  // state
  // 是否启用多标签页导航
  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);
  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const sidebarLogo = ref<boolean>(defaultSettings.sidebarLogo);
  // 页面是否出现滚动条
  const isScrollbar = ref<boolean>(false);

  const fixedHeader = useStorage<boolean>(
    "fixedHeader",
    defaultSettings.fixedHeader
  );
  // 主题颜色
  const themeColor = useStorage<string>(
    "themeColor",
    defaultSettings.themeColor
  );
  // 主题模式
  const theme = useStorage<string>("theme", defaultSettings.theme);
  const layout = useStorage<string>("layout", defaultSettings.layout);
  const fontBold = useStorage<boolean>("fontBold", defaultSettings.fontBold);
  const transitionType = useStorage<TransitionType>("transitionType", defaultSettings.transitionType);

  const settingsMap: Record<string, Ref<any>> = {
    showSettings,
    fixedHeader,
    tagsView,
    sidebarLogo,
    layout,
    themeColor,
    theme,
  };

  // actions
  // 修改设置
  function changeSetting({ key, value }: { key: string; value: any }) {
    const setting = settingsMap[key];
    if (setting !== undefined) {
      setting.value = value;
      if (key === "theme" && value === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }
  return {
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo,
    layout,
    isScrollbar,
    theme,
    themeColor,
    fontBold,
    transitionType,
    changeSetting,
  };
});
