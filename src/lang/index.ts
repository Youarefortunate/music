import { createI18n } from "vue-i18n";
import { useAppStoreHook } from "@/store/modules/app";
// 本地语言包
import enLocale from "./package/en";
import zhCnLocale from "./package/zh-cn";

// 凡是这种单文件非setup的，都需要这样做，否则报错
const appStore = useAppStoreHook();

const messages = {
  "zh-cn": {
    ...zhCnLocale,
  },
  en: {
    ...enLocale,
  },
};

const i18n = createI18n({
  legacy: false,
  // 当前语言
  locale: appStore.language,
  // 本地化的语言环境信息
  messages: messages,
  globalInjection: true,
});

export default i18n;
