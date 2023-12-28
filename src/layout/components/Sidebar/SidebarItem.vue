<script setup lang="ts">
import path from "path-browserify";
import { isExternal } from "@/utils/index";
import { CSSProperties } from "vue";
import AppLink from "./Link.vue";
import { useAppStore } from "@/store/modules/app";
import variables from "@/styles/variables.module.scss";

import { translateRouteTitleI18n } from "@/utils/i18n";
import SvgIcon from "@/components/SvgIcon/index.vue";

const props = defineProps({
  /**
   * 路由(eg:level_3_1)
   */
  item: {
    type: Object,
    required: true,
  },

  /**
   * 父层级完整路由路径(eg:/level/level_3/level_3_1)
   */
  basePath: {
    type: String,
    required: true,
  },
});

const appStore = useAppStore();
const onlyOneChild = ref(); // 临时变量，唯一子路由

/**
 * 判断当前路由是否只有一个子路由
 * 1：如果只有一个子路由： 返回 true
 * 2：如果无子路由 ：返回 true
 *
 * @param children 子路由数组
 * @param parent 当前路由
 */
function hasOneShowingChild(children = [], parent: any) {
  // 需要显示的子路由数组
  const showingChildren = children.filter((item: any) => {
    if (item.meta?.hidden) {
      return false; // 过滤不显示的子路由
    } else {
      onlyOneChild.value = item; // 唯一子路由赋值（多个子路由情况 onlyOneChild 变量是用不上的）
      return true;
    }
  });

  // 1：如果只有一个子路由, 返回 true
  if (showingChildren.length === 1) {
    return true;
  }

  // 2：如果无子路由, 复制当前路由信息作为其子路由，满足只拥有一个子路由的条件，所以返回 true
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }
  return false;
}

/**
 * 解析路径
 *
 * @param routePath 路由路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }

  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  if (props.basePath.indexOf("?") > -1) {
    return props.basePath;
  }

  // 完整路径 = 父级路径(/level/level_3) + 路由路径
  const fullPath = path.resolve(props.basePath, routePath); // 相对路径 → 绝对路径
  return fullPath;
}

const getSubTextStyle = computed((): CSSProperties => {
  if (appStore.sidebar.opened) {
    return {
      width: variables.sideBarWidth,
      display: "inline-block",
      overflow: "hidden",
      textOverflow: "ellipsis",
    };
  } else {
    return {
      width: variables.hideSideBarWidth,
    };
  }
});
</script>
<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- <div v-if="item.meta?.titleText" class="sidebar-title">{{ item.meta?.titleText }}</div> -->
    <!-- 只包含一个子路由节点的路由，显示其【唯一子路由】 -->
    <template v-if="hasOneShowingChild(item.children, item) &&
      (!onlyOneChild.children || onlyOneChild.noShowingChildren)
      ">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)" :meta="onlyOneChild.meta">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <svg-icon v-if="onlyOneChild.meta && onlyOneChild.meta.icon" :size="onlyOneChild.meta?.size"
            :color="onlyOneChild.meta?.color" :icon-class="onlyOneChild.meta.icon" />


          <template #title>
            <!-- <span :style="getSubTextStyle" :title="onlyOneChild.meta.title">{{
              translateRouteTitleI18n(onlyOneChild.meta.title)
            }}</span> -->
            <el-tooltip
              placement="top"
              :disabled="onlyOneChild.meta.title.length < 8"
              :content="onlyOneChild.meta.title"
            >
              <span :style="getSubTextStyle">{{
                translateRouteTitleI18n(onlyOneChild.meta.title)
              }}</span>
            </el-tooltip>
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!-- 包含多个子路由  -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <svg-icon v-if="item.meta && item.meta.icon" :size="item.meta?.size" :color="item.meta?.color"
          :icon-class="item.meta.icon" />
        <el-tooltip placement="top" :disabled="onlyOneChild.meta?.title.length < 10" :content="item.meta?.title">
          <span v-if="item.meta && item.meta.title" :style="getSubTextStyle">{{
            translateRouteTitleI18n(item.meta?.title)
          }}</span>
        </el-tooltip>
      </template>

      <sidebar-item v-for="child in item.children" :key="child.path" :item="child" :base-path="resolvePath(child.path)" />
    </el-sub-menu>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-menu-item .el-menu-tooltip__trigger) {
  width: auto !important;
}

.sidebar-title {
  font-size: 14px;
  color: #737373;
  margin: 15px 0;
  font-weight: 500;
  padding-left: calc(var(--el-menu-base-level-padding) + var(--el-menu-level) * var(--el-menu-level-padding));
}
</style>
