<script lang="ts" setup>
import { useRoute, RouteRecordRaw } from "vue-router";
import SidebarItem from "./SidebarItem.vue";
import { useAppStore } from "@/store/modules/app";
import variables from "@/styles/variables.module.scss";
import path from "path-browserify";
import { isExternal } from "@/utils/index";


const appStore = useAppStore();
// 路由对象
const currRoute = useRoute();
const props = defineProps({
  menuList: {
    required: true,
    default: () => {
      return [];
    },
    type: Array<any>,
  },
  basePath: {
    type: String,
    required: true,
  },
});

const activeMenu = computed<string>(() => {
  const { meta, path } = currRoute;
  // 如果设置了路径，则侧边栏将突出显示所设置的路径

  if (meta.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});

/**
 * 解析路径
 * @param route 路由路径 例如 /song
 */
function resolvePath(route: RouteRecordRaw) {
  // 判断是否为外部链接
  if (isExternal(route.path)) {
    return route.path;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 完整路径 = 父级路径(/level/level_3) + 路由路径
  // fullPath为每一个路由的第一个path
  const fullPath = path.resolve(props.basePath, route.path); // 相对路径 → 绝对路径
  return fullPath;
}

</script>
<template>
  <el-menu mode="vertical" :unique-opened="true" :default-active="activeMenu" :collapse="!appStore.sidebar.opened"
    :background-color="variables.menuBg" :text-color="variables.menuText" :active-text-color="variables.menuActiveText"
    :collapse-transition="false">
    <sidebar-item v-for="route in menuList" :key="route.path + Math.random() * 10 + Math.random() * 10" :item="route"
      :base-path="resolvePath(route)" :is-collapse="!appStore.sidebar.opened" />
  </el-menu>
</template>
