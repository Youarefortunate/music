<script setup lang="ts">
import { useRoute } from "vue-router";
import * as MVApi from "@/api/mv";
import * as MVEnum from "@/enums/MVEnum";
import { data, filterText } from "./data";
import type { Item, DataKey } from "./data";
import { useNumberFormat } from "@/utils";
import { onTargetPage } from "@/utils/globalMethods";

type ActiveItemType = Record<DataKey, Item>;

const route = useRoute();
// 加载
const loading = ref(false);
// 全部mv数据
const mvs = ref<Array<any>>([]);
// 当前选中项
const activeItem = reactive<ActiveItemType>({
  area: {
    name: "全部",
    value: MVEnum.AreaEnum.all,
  },
  type: {
    name: "全部",
    value: MVEnum.TypeEnum.all,
  },
  order: {
    name: "上升最快",
    value: MVEnum.OrderEnum.up,
  },
});

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

watch(
  () => route.query,
  (newVal) => {
    if (newVal.cateType) {
      const cate = newVal.cateType.toString().split("-");
      if (cate.length === 0) return;
      const key = cate[0] as DataKey;
      const value = cate[1] as
        | MVEnum.AreaEnum
        | MVEnum.TypeEnum
        | MVEnum.OrderEnum;
      activeItem[key].value = value;
      activeItem[key].name = data[key].filter((c) => c.value === value)[0].name;
      // 获取全部mv
      getAllMVList();
    }
  },
  { immediate: true }
);

// 获取全部mv
function getAllMVList() {
  // 开始加载
  loading.value = true;
  MVApi.getAllMVList({
    limit: queryParams.limit,
    offset: queryParams.offset,
    order: activeItem.order.value as MVEnum.OrderEnum,
    area: activeItem.area.value as MVEnum.AreaEnum,
    type: activeItem.type.value as MVEnum.TypeEnum,
  })
    .then((res) => {
      const { code, data, count } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      mvs.value = data || [];
      if (count != undefined) {
        queryParams.total = count;
      }
      console.log("获取全部mv成功==>", res.data);
    })
    .catch((err) => {
      console.error("获取全部mv失败==>", err);
      ElMessage.error(err.message || "获取全部mv失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

// 点击切换选中状态
const handleSwitchKey = (text: Item, key: DataKey) => {
  // const k = key as keyof typeof activeItem;
  if (activeItem[key].name == text.name) return;
  // 每次切换分类之前需要将状态重置
  reset();
  activeItem[key].name = text.name;
  activeItem[key].value = text.value;
  handleRefresh();
  console.log("activeItem==>", activeItem);
};

const handleMvDetail = (item: any) => {
  console.log('mv详情==>', item);
  onTargetPage('/video/mv-detail', { mvid: item.id })
}

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  handleRefresh();
};

// 重置状态
function reset() {
  queryParams.offset = 0;
  queryParams.pageNum = 1;
  queryParams.hasMore = false;
  mvs.value = [];
}

// 刷新
function handleRefresh(bool: boolean = true) {
  bool && getAllMVList();
}

defineOptions({
  name: "AllMV",
});
</script>

<template>
  <div
    class="all-mv"
    v-loading="loading"
    element-loading-text="加载全部MV列表中🍍..."
  >
    <h2>全部MV</h2>
    <!-- 分类列表 -->
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

    <div
      v-if="mvs.length"
      class="mv-list grid grid-flow-row justify-between grid-cols-2 lg:grid-cols-3 gap-5 2xl:grid-cols-4"
    >
      <div v-for="item in mvs" :key="item.id" class="mv-item">
        <!-- mv封面 -->
        <div class="cover relative">
          <el-image
            lazy
            class="w-full shadow cursor-pointer rounded-5px"
            style="border: 2px solid rgba(190, 190, 190, 0.2)"
            :src="item.cover + '?param=350y190'"
            fit="cover"
            :title="item.name"
            @click="handleMvDetail(item)"
          />
          <!-- mv播放次数 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.playCount) }}</span>
          </div>
        </div>

        <!-- mv名称 -->
        <div
          :title="item.name"
          class="text-xs truncate cursor-pointer"
          style="width: calc(100% - (33.33px + 0.5rem))"
        >
          {{ item.name }}
        </div>
        <!-- mv创建者 -->
        <div
          class="text-#D0D0D0 text-xs mt-5px truncate"
          :title="item.artists.map((a: any) => a.name + ' ').join('')"
        >
          <span class="artist-name">
            <span
              v-for="artist in item.artists"
              class="singer-name hover:text-#C2C2C2 cursor-pointer"
              @click="TTUL('歌手页暂未完成')"
              >{{ artist.name }}</span
            ></span
          >
        </div>
      </div>
    </div>
    <!-- 失败显示 -->
    <div class="flex items-center justify-center w-full h-400px" v-else>
      <div class="flex items-center">
        <span class="text-xs text-#838080">{{ "没有数据或者获取失败啦~" }}</span>
        <el-link
          @click="handleRefresh()"
          :underline="false"
          style="font-size: 0.75rem; line-height: 2rem"
          class="ml-10px"
          >重试</el-link
        >
      </div>
    </div>

    <!-- 分页组件 -->
    <pagination
      :total="queryParams.total"
      v-model:limit="queryParams.limit"
      v-model:page="queryParams.pageNum"
      @pagination="handlePagination"
    />
  </div>
</template>

<style lang="scss" scoped>
.all-mv {
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

.active {
  color: var(--el-color-primary);
  background-color: #fee0e0;
}
</style>
