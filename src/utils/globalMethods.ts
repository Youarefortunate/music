import type { CellStyle } from "element-plus";
import router from "@/router";
import { useUserStoreHook } from "@/store/modules/user";
import { ElMessage } from "element-plus";

const userStore = useUserStoreHook();

// 是否为暗夜模式
const isDark = useDark();

/**
 * 全局自定义el-table第一行表头样式
 */
export function getRowClass(scope: {
  rowIndex: number;
  columnIndex: number;
}): CellStyle<any> | undefined {
  const style: CellStyle<any> = {
    height: "50px",
  };
  if (scope.rowIndex == 0) {
    Object.assign(style, {
      fontWeight: 500,
      color: !isDark.value ? "var(--el-color-black)" : "var(--el-color-white)",
      backgroundColor: !isDark.value ? "rgb(250,250,250)" : 'rgba(255,255,255,.1)',
    });
    return style;
  }
}

/**
 * 就一个消息提示
 */
export function TTUL(msg?: string) {
  ElMessage.error(msg || "暂未实现功能，以后再说咯！😂");
}

/**
 * 全局跳转方法
 * @param {Number} path 跳转的页面路径
 * @param {Object} options 携带的参数
 */
export function onTargetPage(path?: string, options?: any) {
  router.push({
    path: path || "/",
    query: options,
  });
}
