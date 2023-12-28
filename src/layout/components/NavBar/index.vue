<script lang="ts" setup>
import { useAppStore } from "@/store/modules/app";

const appStore = useAppStore();

// 左侧菜单显示/隐藏
function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<template>
  <!-- 顶部导航栏 -->
  <div class="navbar">
    <!-- 左侧展开/折叠菜单按钮 -->
    <div class="flex">
      <Hamburger
        :is-active="appStore.sidebar.opened"
        @toggle-click="toggleSideBar"
      />
      <!-- 左侧面包屑 -->
      <Breadcrumb />
    </div>

    <!-- 右侧导航设置 -->
    <div class="nav-right flex">
      <NavRight />
    </div>

    <!-- 底部播放器 -->
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $logoAndNavHeight;
  background-color: var(--el-color-primary);
  // box-shadow: 0 0 1px #0003;
}

.nav-right {
  // margin-right: 50px;
}
</style>
