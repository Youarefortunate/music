import type { App } from "vue";
import { createPinia } from "pinia";

const store = createPinia();

// 全局注册store
/**
 * @param {Element} app vue中的createApp函数返回的实例对象
 */ 
export function setupStore(app: App<Element>) {
  app.use(store);
}


export { store };
