<script lang="ts" setup>
// 切换语言组件
import { useI18n } from "vue-i18n";
import SvgIcon from "@/components/SvgIcon/index.vue";
import { useAppStore } from "@/store/modules/app";
import { ElMessage } from "element-plus";

const appStore = useAppStore();
const { locale } = useI18n();

// 切换语言
function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);
  if (lang == "en") {
    ElMessage.success("Switch Language Successful!");
  } else {
    ElMessage.success("切换语言成功");
  }
}
</script>

<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div class="lang-icon">
      <svg-icon icon-class="language" size="1.4em" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :disabled="appStore.language === 'zh-cn'"
          command="zh-cn"
        >
          中文
        </el-dropdown-item>

        <el-dropdown-item :disabled="appStore.language === 'en'" command="en">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.lang-icon {
  color: #c5c5c5;
  &:hover {
    color: #fff;
  }
}
</style>
