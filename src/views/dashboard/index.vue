<script lang="ts" setup>
import type { TabsPaneContext } from "element-plus";

import {
  Recommend,
  SongList,
  RankingList,
  Singer,
  LatestMusic,
} from "./components/index";

// 用户歌单列表动态tab组件渲染类型声明
type TabsComponents =
  | "recommend"
  | "songList"
  | "rankingList"
  | "singer"
  | "latestMusic";
// 用户歌单列表动态tab组件渲染数据
const tabsComponents = {
  recommend: Recommend,
  songList: SongList,
  rankingList: RankingList,
  singer: Singer,
  latestMusic: LatestMusic,
};
// 当前活跃标签页
const curActiveTab = ref<TabsComponents>("recommend");
const componentId = computed(() => tabsComponents[curActiveTab.value]);

// tabs数据数组
const tabsList = [
  { label: "个性化推荐", name: "recommend", componentId: Recommend },
  { label: "歌单广场", name: "songList", componentId: SongList },
  { label: "排行榜", name: "rankingList", componentId: RankingList },
  { label: "歌手", name: "singer", componentId: Singer },
  { label: "最新音乐", name: "latestMusic", componentId: LatestMusic },
];
// 点击tabs项
const handleTabsClick = (tab: TabsPaneContext) => {
  console.log("tab==>", tab);
};

// 切换标签
function handleSwitchTab(tab: any) {
  if (curActiveTab.value == tab) return;
  curActiveTab.value = tab;
}

// 组件名称
defineOptions({
  name: "Dashboard",
});
</script>

<template>
  <div class="container relative">
    <!-- github角标 -->
    <github-corner class="github-corner" title="Github" />

    <el-alert
      style="margin-bottom: 10px"
      :closable="false"
      title="为了提高您的使用感受，在操作之前可以选择进行网易音乐账号登录，建议进行扫码登录更安全，本网站不会获取到有关您的任何信息"
      type="warning"
      show-icon
    />

    <div class="tabs">
      <el-tabs
        v-model="curActiveTab"
        class="demo-tabs"
        @tab-click="handleTabsClick"
      >
        <el-tab-pane
          v-for="(item, index) in tabsList"
          :key="index"
          :label="item.label"
          :name="item.name"
        >
        </el-tab-pane>
      </el-tabs>
    </div>

    <component :is="componentId" @switchTab="handleSwitchTab" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.tabs) {
  // 当前活跃的tab项
  .el-tabs__item.is-active {
    font-size: 17px;
    font-weight: bold;
  }
}

.github-corner {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  border: 0;
}
</style>
