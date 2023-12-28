<script setup lang="ts">
import LeftMenu from "./LeftMenu.vue";
import Logo from "./Logo.vue";
import { useSettingsStore } from "@/store/modules/settings";
import { usePermissionStore } from "@/store/modules/permission";
import { useAppStore } from "@/store/modules/app";
import { storeToRefs } from "pinia";

const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const appStore = useAppStore();
const { sidebarLogo } = storeToRefs(settingsStore);

</script>

<template>
  <div :class="{ 'has-logo': sidebarLogo }" class="menu-wrap">
    <logo v-if="sidebarLogo" :collapse="!appStore.sidebar.opened" />
    <el-scrollbar>
      <LeftMenu :menu-list="permissionStore.routes" base-path="" />
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped>
:deep(.setting-container) {
  .setting-item {
    color: #fff;

    .svg-icon {
      margin-right: 0;
    }

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
