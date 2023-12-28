<script setup lang="ts">
import { useRoute } from "vue-router";
import type { TabsPaneContext } from "element-plus";
import { Singer, Single, Video, User } from "./modules";

const route = useRoute();
// 用户歌单列表动态tab组件渲染类型声明
type TabsComponents = "singer" | "single" | "video" | "user";
// 用户歌单列表动态tab组件渲染数据
const tabsComponents = {
  singer: Singer,
  single: Single,
  video: Video,
  user: User,
};
// 当前活跃标签页
const curActiveTab = ref<TabsComponents>("single");
// 动态组件is属性值
const tabsComponentId = computed(() => tabsComponents[curActiveTab.value]);

// 标签页选项发生变化
function handleTabsClick(tab: TabsPaneContext, event: Event) {
  console.log("标签页选项发生变化==>", tab, event);
}

defineOptions({
  name: "SearchMusic",
});
</script>

<template>
  <div class="search-music">
    <div class="title font-bold text-20px mb-20px">
      搜索{{ route.query?.keywords }}
    </div>
    <!-- 标签选项 -->
    <div class="tabs-container">
      <el-tabs
        v-model="curActiveTab"
        class="tabs mb-[10px]"
        @tab-click="handleTabsClick"
      >
        <el-tab-pane label="音乐单曲" name="single" />
        <el-tab-pane label="相关歌手" name="singer" />
        <el-tab-pane label="相关视频/MV" name="video" />
        <el-tab-pane label="相关用户" name="user" />
      </el-tabs>
    </div>

    <!-- 动态渲染组件 -->
    <component :is="tabsComponentId" />
  </div>
</template>

<style lang="scss" scoped>
.search-music {
  padding: 40px 20px;
}

// tab标签栏深层穿透
:deep(.tabs) {
  .el-tabs__item.is-active {
    font-size: 20px;
    font-weight: bold;
    transition: all 0.1s;
  }
}
</style>
