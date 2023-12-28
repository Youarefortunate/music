<script lang="ts" setup>
// storeToRefs 使用该方法可以将从store解构出来的属性具有响应式
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useStorage, useDebounceFn } from "@vueuse/core";
import { useUserStore } from "@/store/modules/user";
import { useAppStore } from "@/store/modules/app";
import { useTagsViewStore } from "@/store/modules/tagsView";
import { ElMessageBox } from "element-plus";
import * as SearchApi from "@/api/search";
import { UserFilled, Search } from "@element-plus/icons-vue";
import LoginDialog from "./Model/index.vue";
import HotSearch from "./modules/HotSearch.vue";

const appStore = useAppStore();
const userStore = useUserStore();
const tagsViewStore = useTagsViewStore();
//
const route = useRoute();
const router = useRouter();

// 设备类型：desktop-宽屏设备 || mobile-窄屏设备
const { device } = storeToRefs(appStore);
const { profile } = storeToRefs(userStore);

/**
 * vueUse 全屏函数
 */
const { isFullscreen, toggle } = useFullscreen();
// 登录dialog组件实例
const LoginDialogRef = ref();
// 搜索参数
const queryParams = reactive({
  // 关键字
  keyword: "",
  // 该字段主要用于判断获取默认搜索关键字是否成功，因为后面用户如果没有输入关键字直接按回车搜索时是以placeholder进行搜索的
  iSplaceholder: false,
  placeholder: "来搜索些好听的音乐吧",
});
// 组件ref
const HotSearchRef = ref();
// 用户搜索过的历史记录
const searchHistory = useStorage<string[]>("searchHistory", []);

onMounted(() => {
  // 获取搜索默认关键字
  getDefaultKeyword();
});

watch(
  () => route.query,
  (newVal) => {
    if (newVal) {
      queryParams.keyword = newVal.keywords as string;
    }
  }
);

// 搜索框获取焦点时触发
function getMusicHotDetail() {
  // 输入框获取焦点并且还没有输入关键字
  HotSearchRef.value?.show(true, queryParams.keyword);
}

// 默认搜索关键字
function getDefaultKeyword() {
  SearchApi.defaultSearchKey()
    .then((res) => {
      const {
        code,
        data: { showKeyword },
      } = res.data;
      if (code != 200) {
        return console.error("获取默认搜索关键字失败");
      }
      queryParams.iSplaceholder = true;
      queryParams.placeholder = showKeyword ?? "";
    })
    .catch(() => {
      queryParams.iSplaceholder = false;
    });
}

// 在搜素 Input 值改变时触发
function handleSearchInput(value: string | number) {
  debouncedFn(value);
}

// 搜素建议
function handleSearchSuggest(value: string | number) {
  HotSearchRef.value?.show(true, value);
}

// 仅当 modelValue 改变时，当输入框失去焦点或用户按Enter时触发
const handleSearch = (e: KeyboardEvent | Event): any => {
  if ((e as KeyboardEvent).key != "Enter") return;
  if (
    queryParams.keyword ||
    (!queryParams.keyword && queryParams.iSplaceholder)
  ) {
    router.push({
      path: "/search",
      query: {
        keywords: queryParams.keyword
          ? queryParams.keyword
          : (queryParams.keyword = queryParams.placeholder),
      },
    });
  }

  setTimeout(() => {
    HotSearchRef.value?.show(false, queryParams.keyword);
  }, 500);

  const maxCount = 6;
  if (!queryParams.keyword) return;
  // 相同搜索关键字不再往里面添加
  if (searchHistory.value.includes(queryParams.keyword)) {
    return;
  }
  // 长度超过4个历史记录时，删除最后一个历史记录，把新的推进去
  if (searchHistory.value.length >= maxCount) {
    searchHistory.value.pop();
    return searchHistory.value.unshift(queryParams.keyword);
  }
  searchHistory.value.push(queryParams.keyword);
};

/**
 * 注销退出登录
 */
function logout() {
  ElMessageBox.confirm("确定要退出嘛?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        // 退出登录的时候删除所有标签
        tagsViewStore.delAllViews();
      })
      .then(() => {
        console.log("route==>", route);
        ElMessage.success("退出成功");
        // 回到首页
        router.replace("/");
      });
  });
}

/**
 * 音乐搜索防抖
 */
const debouncedFn = useDebounceFn(
  (value) => {
    handleSearchSuggest(value);
  },
  500,
  { maxWait: 5000 }
);

// 用户点击头像登录
const handleLogin = () => {
  // 打开弹窗
  LoginDialogRef.value!.show(true);
};
</script>

<template>
  <!-- 导航栏设置（窄屏隐藏） -->
  <div v-if="device !== 'mobile'" class="setting-container">
    <!-- 搜索框 -->
    <div class="search-music">
      <el-input clearable max-length="20" v-model="queryParams.keyword" :placeholder="queryParams.placeholder"
        :prefix-icon="Search" @focus="getMusicHotDetail" @keydown="handleSearch" @input="handleSearchInput" />
      <!-- 热搜榜 -->
      <hot-search ref="HotSearchRef" v-model="queryParams.keyword" />
    </div>
    <!-- 全屏 -->
    <div class="setting-item full-screen-icon" @click="toggle">
      <svg-icon size="1.2em" :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" />
    </div>

    <!-- 语言选择 -->
    <lang-select class="setting-item" />

    <el-dropdown trigger="click" :disabled="!profile?.avatarUrl">
      <div class="avatar-container">
        <!-- 已登录头像 -->
        <el-avatar v-if="profile.avatarUrl" :src="profile?.avatarUrl + '?param=40y40'" />

        <!-- 未登录头像 -->
        <span v-else @click.stop="handleLogin" class="no-login-avatar flex items-center justify-center">
          <el-avatar :size="35" :icon="UserFilled" />
        </span>

        <div class="user-name flex items-center">
          <span class="ml-1 text-xs oneline-hide">{{
            profile.nickname ? profile.nickname : "未登录"
          }}</span>
          <i-ep-caret-bottom size="1.75rem" />
        </div>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <router-link to="/">
            <el-dropdown-item>{{ $t("navbar.dashboard") }}</el-dropdown-item>
          </router-link>

          <a target="_blank" href="https://github.com/Youarefortunate/music.git">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>

          <a target="_blank" href="https://gitee.com/youarefortunate/music.git">
            <el-dropdown-item>{{ $t("navbar.gitee") }}</el-dropdown-item>
          </a>

          <router-link :to="`/user/user-profile?userId=${profile.userId}`">
            <el-dropdown-item>{{ $t("navbar.userProfile") }}</el-dropdown-item>
          </router-link>

          <el-dropdown-item divided @click="logout">
            {{ $t("navbar.logout") }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <login-dialog ref="LoginDialogRef" />
  </div>
</template>

<style lang="scss" scoped>
.setting-container {
  display: flex;
  align-items: center;

  .setting-item {
    display: inline-block;
    width: 30px;
    height: 50px;
    line-height: 50px;
    // color: var(--el-text-color-regular);
    text-align: center;
    cursor: pointer;
  }
}

// 音乐搜索
:deep(.search-music) {
  position: relative;
  margin-right: 10px;

  .el-input__wrapper {
    color: #d2d2d2;
    width: 250px;
    border-radius: 50px;
    padding: 2px 11px;
    background-color: rgba(var(--el-color-primary), 1);
    border: 1px solid #999999;
    box-shadow: none;
    // &::placeholder {
    //   font-size: 13px;
    // }
  }
}

.full-screen-icon {
  color: #c5c5c5;

  &:hover {
    color: #fff;
  }
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-items: center;
  margin: 0 5px;
  cursor: pointer;

  $size: 35px;

  .user-name {
    width: 85px;
    color: #c5c5c5;

    &:hover {
      color: #fff;
    }
  }
}
</style>
