<script lang="ts" setup>
import { computed, watchEffect } from "vue";
import { useWindowSize } from "@vueuse/core";
import { AppMain, Navbar, Settings, TagsView } from "./components/index";
import RightPanel from "@/components/RightPanel/index.vue";

import { useAppStore } from "@/store/modules/app";
import { useSettingsStore } from "@/store/modules/settings";
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

const fixedHeader = computed(() => settingsStore.fixedHeader);
const showTagsView = computed(() => settingsStore.tagsView);
const showSettings = computed(() => settingsStore.showSettings);

// watchEffect函数当用到的变量发生改变时就会重新运行
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
</script>
<template>
  <div :class="{ hasTagsView: showTagsView }" class="main-container">
    <div :class="{ 'fixed-header': fixedHeader }">
      <!-- 导航栏 -->
      <navbar />
      <!-- 多标签导航 -->
      <tags-view v-if="showTagsView"  />
    </div>
    <!--内容主页面-->
    <app-main />
    <!-- 设置面板 -->
    <RightPanel v-if="showSettings">
      <settings />
    </RightPanel>
  </div>
</template>

<style lang="scss" scoped>
.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  // 存在loading遮罩时，z-index比loading遮罩要高
  // z-index: 9;
  z-index: 2001;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}
</style>
