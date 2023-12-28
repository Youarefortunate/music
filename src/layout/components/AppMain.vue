<script setup lang="ts">
import { useTagsViewStore } from "@/store/modules/tagsView";
import { useSettingsStore } from '@/store/modules/settings'

const tagsViewStore = useTagsViewStore();
const settingStore = useSettingsStore();
</script>

<template>
  <section class="app-main" @touchmove.prevent>
    <router-view>
      <template #default="{ Component, route }">
        <transition :name="settingStore.transitionType" mode="out-in">
          <keep-alive :include="tagsViewStore.cachedViews">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </section>
</template>

<style lang="scss" scoped>
.app-main {
  position: relative;
  width: 100%;
  padding: 30px;
  min-width: 900px;
  // 30 + footerHeight
  padding-bottom: calc(30px + $footerHeight);

  /* 70 = navbar + footerHeight =  70 + 100  */
  min-height: calc(100vh - ($logoAndNavHeight + $footerHeight));
  // min-height: calc(100vh - ($logoAndNavHeight + $footerHeight));
  overflow: hidden;
  // background-color: var(--el-bg-color-page);
  // background-color: #ececec;
}

// 固定头部时, 不存在多标签
.fixed-header + .app-main {
  padding-top: $logoAndNavHeight;
}

// 存在多标签
.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view + footerHeight = 70 + 34 + 100 */
    // min-height: calc(100vh - ($logoAndNavHeight + 34px + $footerHeight));
    min-height: calc(100vh - ($logoAndNavHeight + 34px));
  }

  // 当固定头部时主内容部分的padding-top值 == navbar + tagsView
  .fixed-header + .app-main {
    min-height: 100vh;
    padding-top: calc($logoAndNavHeight + $tagsViewHeight + 20px);
  }
}

.isTop {
  .hasTagsView {
    .fixed-header + .app-main {
      padding-top: 34px;
    }
  }
}
</style>
