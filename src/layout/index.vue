<script setup lang="ts">
import Main from "./main.vue";
import { computed, watchEffect } from "vue";
import { useWindowSize } from "@vueuse/core";
import Sidebar from "./components/Sidebar/index.vue";
import { checkScrollbar } from "@/utils";

import { useAppStore } from "@/store/modules/app";
import { useSettingsStore } from "@/store/modules/settings";

// useWindowSize响应式获取窗口尺寸 const { width, height } = useWindowSize()
const { width } = useWindowSize();
/**
 * 响应式布局容器固定宽度
 *
 * 大屏（>=1200px）
 * 中屏（>=992px）
 * 小屏（>=768px）
 */
const WIDTH = 992;

const appStore = useAppStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  setTimeout(() => {
    const isScrollbar = checkScrollbar();
    settingsStore.isScrollbar = isScrollbar;
  }, 2000);
});

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  withoutAnimation: appStore.sidebar.withoutAnimation,
  mobile: appStore.device === "mobile",
}));

watchEffect(() => {
  if (width.value < WIDTH) {
    appStore.toggleDevice("mobile");
    appStore.closeSideBar(true);
  } else {
    appStore.toggleDevice("desktop");

    if (width.value >= 1200) {
      //大屏
      appStore.openSideBar(true);
    } else {
      appStore.closeSideBar(true);
    }
  }
});

function handleOutsideClick() {
  appStore.closeSideBar(false);
}
</script>

<template>
  <div :class="classObj" class="app-wrapper">
    <!-- 手机设备侧边栏打开遮罩层 -->
    <div
      v-if="classObj.mobile && classObj.openSidebar"
      class="drawer-bg"
      @click="handleOutsideClick"
    ></div>

    <Sidebar style="z-index: 1" class="sidebar-container" />

    <Main style="z-index: 1"></Main>

    <!-- 返回顶部 -->
    <!-- <el-backtop title="回到顶部"></el-backtop> -->
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  &::after {
    display: table;
    clear: both;
    content: "";
  }

  position: relative;
  width: 100%;
  height: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  position: absolute;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.3;
}

.openSidebar {
  .mix-wrap {
    .left-wrap {
      width: $sideBarWidth;
    }

    :deep(.svg-icon) {
      margin-top: -1px;
      margin-right: 5px;
    }

    .el-menu {
      border: none;
    }
  }
}
</style>
