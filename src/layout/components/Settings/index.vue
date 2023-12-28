<script setup lang="ts">
import { useSettingsStore } from "@/store/modules/settings";
import IconEpSunny from "~icons/ep/sunny";
import IconEpMoon from "~icons/ep/moon";
import { storeToRefs } from "pinia";

const settingsStore = useSettingsStore();
const { tagsView, fixedHeader, sidebarLogo, transitionType } =
  storeToRefs(settingsStore);

// useDark: 具有自动数据持久性的响应式暗黑模式
const isDark = useDark();
const toggleDark = () => useToggle(isDark); // useToggle(ref类型的boolean值)函数，会返回一个boolean类型切换的函数

// 主题颜色
const themeColors = ref<string[]>([
  "#f5222d",
  "#0085F9",
  "#008467",
  "#AF4D00",
  "#622EBD",
  "#4B4453",
]);

// 当前选中主题颜色
const currentThemeColor = computed(() => {
  return settingsStore.themeColor;
});

const transitionOptions = [
  { label: "setting.transition_type.fade", value: "fade" },
  { label: "setting.transition_type.slide", value: "fade-slide" },
  { label: "setting.transition_type.scale", value: "fade-scale" },
  { label: "setting.transition_type.rotate", value: "fade-rotate" },
];

/**
 * 切换主题颜色
 */
function changeThemeColor(color: string) {
  document.documentElement.style.setProperty("--el-color-primary", color);
  settingsStore.changeSetting({ key: "themeColor", value: color });
}

onMounted(() => {
  // const html = document.documentElement;
  window.document.body.setAttribute("layout", settingsStore.layout);
  const theme = settingsStore.theme;
  if (theme == "dark") {
    document.documentElement.classList.add("dark");
  }

  document.documentElement.style.setProperty(
    "--el-color-primary",
    settingsStore.themeColor
  );
});
</script>

<template>
  <div class="settings-container">
    <h3 class="text-base font-bold">{{ $t("setting.project_config") }}</h3>
    <el-divider>{{ $t("setting.theme") }}</el-divider>

    <div class="flex justify-center" @click.stop>
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="IconEpMoon"
        :inactive-icon="IconEpSunny"
        active-color="var(--el-fill-color-dark)"
        inactive-color="var(--el-color-primary)"
        @change="toggleDark"
      />
    </div>

    <el-divider>{{ $t("setting.interface_setting") }}</el-divider>
    <div class="py-[8px] flex justify-between">
      <span class="text-xs">{{ $t("setting.open") }} Tags-View</span>
      <el-switch v-model="tagsView" />
    </div>

    <div class="py-[8px] flex justify-between">
      <span class="text-xs">{{ $t("setting.fixed") }} Header</span>
      <el-switch v-model="fixedHeader" />
    </div>

    <div class="py-[8px] flex justify-between">
      <span class="text-xs">{{ $t("setting.sidebar") }} Logo</span>
      <el-switch disabled v-model="sidebarLogo" />
    </div>

    <el-divider>{{ $t("setting.theme_color") }}</el-divider>

    <ul class="w-full space-x-2 flex justify-center py-2">
      <li
        v-for="(color, index) in themeColors"
        :key="index"
        class="inline-block w-[30px] h-[30px] cursor-pointer theme-wrap"
        :style="{ background: color }"
        @click="changeThemeColor(color)"
      >
        <i-ep-check v-show="color === currentThemeColor" />
      </li>
    </ul>

    <el-divider>{{ $t("setting.transition") }}</el-divider>
    <div class="w-full flex justify-center my-30px">
      <el-select
        clearable
        v-model="transitionType"
        placeholder="选择页面切换动画"
        style="width: 80%"
      >
        <el-option
          v-for="item in transitionOptions"
          :key="item.value"
          :label="$t(item.label)"
          :value="item.value"
        />
      </el-select>
    </div>

    <el-divider>{{ $t("setting.navigation_setting") }}</el-divider>

    <ul class="layout">
      <el-tooltip content="左侧模式" placement="bottom">
        <li class="layout-item layout-left is-active">
          <div></div>
          <div></div>
        </li>
      </el-tooltip>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.settings-container {
  padding: 16px;

  .layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    width: 100%;
    height: 50px;

    &-item {
      position: relative;
      width: 18%;
      height: 45px;
      overflow: hidden;
      cursor: pointer;
      background: #f0f2f5;
      border-radius: 4px;
    }

    &-item.is-active {
      border: 2px solid var(--el-color-primary);
    }

    &-left div:nth-child(1) {
      width: 30%;
      height: 100%;
      background: #1b2a47;
    }

    &-left div:nth-child(2) {
      position: absolute;
      top: 0;
      right: 0;
      width: 70%;
      height: 30%;
      background: #fff;
      box-shadow: 0 0 1px #888;
    }
  }

  .theme-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
}
</style>
