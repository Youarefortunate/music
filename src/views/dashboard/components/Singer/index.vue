<script lang="ts" setup>
import * as ArtistEnum from "@/enums/ArtistEnum";
import * as ArtistApi from "@/api/artist";
import { data, filterText } from "./data";
import { User } from "@element-plus/icons-vue";
import { TTUL, onTargetPage } from "@/utils/globalMethods";
import { useRoute } from "vue-router";

const emit = defineEmits<{
  (e: "switchTab", tab: any): void
}>();
const route = useRoute();
// 当前选中项
const activeItem = reactive({
  language: {
    name: "全部",
    value: ArtistEnum.ArtistAreaEnum.all,
  },
  category: {
    name: "全部",
    value: ArtistEnum.ArtistTypeEnum.all,
  },
  filter: {
    name: "热门",
    value: -1,
  },
});
// 加载
const loading = ref(false);
// 歌手列表
const artistsList = ref<Array<any>>([]);
// 请求参数
const queryParams = reactive({
  // 总数量
  total: 0,
  // 一次返回50条数据
  limit: 50,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
  // 是否存在更多数据
  hasMore: false,
});
// 是否触底
const isBottom = ref(false);
// 是否加载完数据
const isLoaded = ref(false);

onMounted(() => {
  // 获取歌手分类
  getArtistList();
  window.addEventListener("scroll", handleScroll, true);
});

onActivated(() => {
  window.addEventListener("scroll", handleScroll, true);
  console.log('注册', window.hasOwnProperty("scroll"));
});

onDeactivated(() => {
  window.removeEventListener("scroll", handleScroll);
  console.log('销毁', window.hasOwnProperty("scroll"));
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleScroll = useDebounceFn(
  () => {
    // 获取html元素dom
    const container = document.documentElement;
    // 判断是否触底
    if (
      container.scrollTop + container.clientHeight + 1 >=
      container.scrollHeight
    ) {
      if (!queryParams.hasMore) return;
      isBottom.value = true;
      if (isLoaded.value) {
        // 页面加1
        queryParams.pageNum += 1;
        // 分页参数
        queryParams.offset = (queryParams.pageNum - 1) * queryParams.limit;
        handleRefresh();
        isLoaded.value = false;
      }
    }
  },
  300,
  { maxWait: 5000 }
);

// 获取歌手分类
function getArtistList() {
  // 开始加载
  loading.value = true;
  ArtistApi.getArtistList({
    limit: queryParams.limit,
    offset: queryParams.offset,
    area: activeItem.language.value,
    type: activeItem.category.value,
    initial: activeItem.filter.value,
  })
    .then((res) => {
      const { code, artists, more } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取歌手分类失败"));
      }
      isLoaded.value = true;
      queryParams.hasMore = more;
      artistsList.value = artistsList.value.concat(artists);
      console.log("获取歌手分类成功==>", res.data);
    })
    .catch((err) => {
      isLoaded.value = false;
      console.error("获取歌手分类失败==>", err);
      ElMessage.error(err.message || "获取歌手分类失败");
    })
    .finally(() => {
      loading.value = false;
      isBottom.value = false;
    });
}

// 点击切换选中状态
const handleSwitchKey = (text: any, key: string) => {
  const k = key as keyof typeof activeItem;
  if (activeItem[k].name == text.name) return;
  // 每次切换分类之前需要将状态重置
  reset();
  activeItem[k].name = text.name;
  activeItem[k].value = text.value;
  handleRefresh();
  console.log("activeItem==>", activeItem);
};

// 重置状态
function reset() {
  queryParams.offset = 0;
  queryParams.pageNum = 1;
  queryParams.hasMore = false;
  artistsList.value = [];
}

// 刷新列表
function handleRefresh(bool: boolean = true) {
  bool && getArtistList();
}

// 组件名称
defineOptions({
  name: "Singer",
});
</script>

<template>
  <!-- 歌手 -->
  <div class="singer mt-15px">
    <div class="search-filter" v-for="(item, key) in data">
      <div class="filter-item">
        <div class="key">{{ filterText[key] }}：</div>

        <div class="cate-type">
          <el-link
            class="type"
            v-for="text in item"
            :class="{ active: text.name == activeItem[key].name }"
            :underline="false"
            :key="text.value"
            @click="handleSwitchKey(text, key)"
            >{{ text.name }}</el-link
          >
        </div>
      </div>
    </div>

    <!-- 歌手列表 -->
    <div
      v-loading="loading"
      element-loading-text="加载歌手列表中😆..."
      element-loading-background="rgba(255,255,255,0)"
    >
      <div
        v-if="artistsList.length"
        class="artist-list grid grid-flow-row grid-cols-3 lg:grid-cols-4 gap-10 2xl:grid-cols-5"
      >
        <div v-for="item in artistsList" :key="item.id" class="artist-item">
          <div
            class="pic-img cursor-pointer w-full h-240px min-w-240px min-h-240px"
            :title="item.name"
            @click="TTUL('歌手主页暂未完成')"
          >
            <el-image
              lazy
              class="w-full h-full"
              style="border-radius: 5px"
              :src="item.picUrl + '?param=100y100'"
              fit="cover"
            />
          </div>
          <div class="artist-name oneline-hide text-xs">
            <div
              class="cursor-pointer"
              title="跳转歌手主页"
              @click="TTUL('歌手主页暂未完成')"
            >
              {{ item.name }}
            </div>
            <div
              class="has-account"
              v-if="item.accountId"
              @click="
                onTargetPage('/user/user-profile', { userId: item.accountId })
              "
              title="跳转歌手个人主页"
            >
              <el-icon color="#fff"><User /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-data" v-show="!loading">
        <span class="text">加载失败了😥......</span>
        <div class="reload" @click="handleRefresh()">重新加载</div>
      </div>
    </div>

    <div
      class="is-bottom"
      v-loading="isBottom"
      element-loading-text="加载更多歌手中🍎..."
      element-loading-background="rgba(255,255,255,0)"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-cenetr {
  display: flex;
  align-items: center;
}
.filter-item {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 10px;
  margin-bottom: 10px;
  .key {
    font-size: 14px;
    font-weight: 300;
  }
  .cate-type {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, 80px);
    transform: translateX(-10px);
    .type {
      border-radius: 15px;
      padding: 2px 0;
      margin-bottom: 10px;
      margin-right: 10px;
      font-size: 12px;
      &:not(:last-child) {
        // border-right: 1.4px solid #bababa;
      }
    }
  }
}
.artist-item {
  .pic-img {
    border: 2px solid #eee;
    border-radius: 5px;
  }
  .artist-name {
    height: 30px;
    @include flex-cenetr();
    justify-content: space-between;
    .has-account {
      width: 18px;
      height: 18px;
      cursor: pointer;
      @include flex-cenetr();
      justify-content: center;
      background-color: #ef4542;
      border-radius: 50%;
    }
  }
}
.active {
  color: var(--el-color-primary);
  background-color: #fee0e0;
}

.is-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
}
</style>
