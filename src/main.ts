import { createApp } from "vue";
// 导入路由
import router from "@/router";
import { setupStore } from "@/store";
import App from "./App.vue";
import * as globalMethods from '@/utils/globalMethods'

// 引入注册脚本, 本地SVG图标
import "virtual:svg-icons-register";

// 国际化
import i18n from "@/lang/index";

// 权限鉴定
import "@/permission";

// 样式
import "@/styles/index.scss";
// 引入UnoCSS, UnoCSS 是一个具有高性能且极具灵活性的即时原子化 CSS 引擎（1.安装，2.vite配置，3.main中引入）
import "uno.css";
import 'virtual:uno.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App);
// 全局方法
app.config.globalProperties.getRowClass = globalMethods.getRowClass;
app.config.globalProperties.TTUL = globalMethods.TTUL;
app.config.globalProperties.onTargetPage = globalMethods.onTargetPage;
// 全局注册 状态管理(store)
setupStore(app);

// 使用pinia、router
app.use(router).use(i18n).mount("#app");
