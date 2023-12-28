<script lang="ts" setup>
import { MV, Video } from "./modules";

// 用户歌单列表动态tab组件渲染类型声明
type TabsComponents = "video" | "mv";
// 当前活跃的tab
const curActiveTab = ref<TabsComponents>("video");
// 动态组件is属性值
const componentId = computed(() => tabsComponents[curActiveTab.value]);
const tabsComponents = {
  video: Video,
  mv: MV,
};
defineOptions({
  name: "VideoIndex",
});
</script>

<template>
  <div class="video-index">
    <!-- 标签选项 -->
    <div class="tabs-container">
      <el-tabs v-model="curActiveTab" class="custom-tabs tabs mb-[10px]">
        <el-tab-pane label="视频" name="video" />
        <el-tab-pane label="MV" name="mv" />
      </el-tabs>
    </div>

    <!-- 动态渲染组件 -->
    <component :is="componentId" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.custom-tabs) {
  .el-tabs__item.is-active {
    font-size: 20px;
    font-weight: bold;
    transition: all 0.1s;
  }
  .el-tabs__nav-wrap::after {
    display: none;
  }
}
</style>
