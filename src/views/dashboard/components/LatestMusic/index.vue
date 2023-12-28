<script lang="ts" setup>
import { NewDisc, NewSong } from "./modules";

const emit = defineEmits<{
  (e: "switchTab", tab: any): void
}>();
// 当前激活tab
const curTab = ref("song");
// tabs数据数组
const tabsList = [
  { label: "新歌速递", name: "song", componentId: NewSong },
  { label: "新碟上架", name: "disc", componentId: NewDisc },
];
// 动态组件
const componentId = computed(
  () => tabsList.find((item) => item.name === curTab.value)?.componentId
);

// 切换新歌速递/新碟上架
const handleSwitchTab = (name: string) => {
  curTab.value = name;
};
// 组件名称
defineOptions({
  name: "LatestMusic",
});
</script>

<template>
  <!-- 最新音乐 -->
  <div class="latest-music">
    <!-- 标签切换 -->
    <div class="tab">
      <div class="tab-box">
        <div
          v-for="tab in tabsList"
          @click="handleSwitchTab(tab.name)"
          class="tab-item"
          :class="{ 'active-tab': curTab == tab.name }"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <component :is="componentId" />
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}
.tab {
  width: 100%;
  height: 100px;
  @include flex-center();
  justify-content: center;
  .tab-box {
    width: 300px;
    border: 1px solid #bbbbbb;
    border-radius: 50px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    .tab-item {
      width: 100%;
      height: 100%;
      font-size: 15px;
      color: #333333;
      font-weight: 100;
      text-align: center;
      padding: 8px 0;
      cursor: pointer;
      &:not(.active-tab):hover {
        border-radius: 50px;
        background-color: #ededed;
      }
    }
    .active-tab {
      color: #fff;
      border-radius: 50px;
      background-color: #bbbbbb;
    }
  }
}
</style>
