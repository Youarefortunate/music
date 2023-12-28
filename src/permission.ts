import router from "@/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { isEmptyObject } from "@/utils";
import { constantRoutes } from "@/router";
import { RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { usePermissionStore } from "@/store/modules/permission";
import { ElMessage } from 'element-plus'

// 进度条
NProgress.configure({ showSpinner: false });

const userStore = useUserStore();
const permissionStore = usePermissionStore();

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  // 是否登录
  if (userStore.isLogin) {
    if (permissionStore.routes.length === 0) {
      try {
        const accessRoutes = await permissionStore.generateRoutes();
        accessRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });
        // 如果 addRoute 并未完成，路由守卫会一层一层的执行执行，直到 addRoute 完成，找到对应的路由
        next({ ...to, replace: true });
      } catch (error) {
        console.log("动态路由报错==>", error);
        permissionStore.setRoutes([]);
        next({ path: "/", replace: true });
        ElMessage.error("动态路由加载失败，请刷新重试或者检查您的网络是否连接");
      }
    } else {
      next();
    }
  } else {
    permissionStore.reset();
    // 没有登录
    next();
  }
});

// 进度条结束
router.afterEach(() => {
  NProgress.done();
});
