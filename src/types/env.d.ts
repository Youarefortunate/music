/// <reference types="vite/client" />

// ts识别.vue文件
declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'lodash'

// 环境变量TS的智能提示
interface ImportMetaEnv {
  /**
   * 标题
   */
  VITE_APP_TITLE: string;
  /**
   * 端口号
   */
  VITE_APP_PORT: string;
  /**
   * API基础路径（反向代理）
   */
  VITE_APP_BASE_API: string;
}

// 将env环境变量设置为只读，不可修改
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
