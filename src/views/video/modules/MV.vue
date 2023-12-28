<script setup lang="ts">
import * as MVApi from "@/api/mv";
import * as MVType from "@/api/mv/type";
import * as MVEnum from "@/enums/MVEnum";
import { useNumberFormat } from "@/utils";
import { onTargetPage } from "@/utils/globalMethods";

type CategrotType = {
  name: string;
  value: MVEnum.AreaEnum;
};

type ParamsType = {
  order?: MVEnum.OrderEnum;
  limit?: number;
  offset?: number;
  area?: MVEnum.AreaEnum;
  type?: MVEnum.TypeEnum;
};

type MvDataKey = "newest" | "hot" | "netease";

// 构造具有类型T的一组属性K的类型，将MvDataKey枚举类型作为MvDataType的key
type MvDataType = Record<
  MvDataKey,
  {
    title?: string;
    cateType?: string;
    isCate?: boolean;
    list?: Array<any>;
    params: ParamsType;
    cate?: Array<CategrotType>;
  }
>;

// 加载
const loading = reactive({
  newest: false,
  hot: false,
  netease: false,
  top: false,
});
// mv排行请求参数
const queryParams = reactive<MVType.MVRankingParam>({
  // 分类类型
  area: MVEnum.AreaEnum.all,
  limit: 8,
  offset: 0,
});
// mv排行数据
const mvTopData = ref<Array<any>>([]);
// 最新mv/热播mv/网易出品mv数据
const mvdata = reactive<MvDataType>({
  // 最新mv
  newest: {
    title: "最新MV",
    isCate: true,
    cateType: `order-${MVEnum.OrderEnum.new}`,
    list: [] as Array<any>,
    params: {
      area: MVEnum.AreaEnum.all,
      limit: 8,
    },
    // cate: [
    //   { name: "全部", value: MVEnum.AreaEnum.all },
    //   { name: "内地", value: MVEnum.AreaEnum.mainland },
    //   { name: "欧美", value: MVEnum.AreaEnum.us },
    //   { name: "韩国", value: MVEnum.AreaEnum.kr },
    //   { name: "小日本", value: MVEnum.AreaEnum.jp },
    // ],
  },
  // 热播mv
  hot: {
    title: "热播MV",
    isCate: false,
    cateType: `order-${MVEnum.OrderEnum.hot}`,
    list: [] as Array<any>,
    params: {
      area: MVEnum.AreaEnum.all,
      limit: 8,
      type: MVEnum.TypeEnum.all,
      order: MVEnum.OrderEnum.hot,
    },
  },
  // 网易出品mv
  netease: {
    title: "网易出品",
    isCate: false,
    cateType: `type-${MVEnum.TypeEnum.netease}`,
    list: [] as Array<any>,
    params: {
      limit: 8,
      offset: 0,
    },
  },
});

// 分类项
const categoryList = [
  { name: "全部", value: MVEnum.AreaEnum.all },
  { name: "内地", value: MVEnum.AreaEnum.mainland },
  { name: "港台", value: MVEnum.AreaEnum.hktw },
  { name: "欧美", value: MVEnum.AreaEnum.us },
  { name: "韩国", value: MVEnum.AreaEnum.kr },
  { name: "小日本", value: MVEnum.AreaEnum.jp },
];

onMounted(() => {
  // 获取最新mv
  getNewestMV();
  // 获取热播mv
  getHotMV();
  // 网易出品mv
  getNeteaseMV();
  // 获取mv排行
  getMVTop();
});

// 最新mv
function getNewestMV() {
  loading.newest = true;
  MVApi.getNewestMV({ ...mvdata.newest.params } as MVType.NewestMVParam)
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      mvdata.newest.list = data || [];
      console.log("获取最新mv成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取最新mv失败==>", err);
      ElMessage.error(err.message || "获取最新mv失败");
    })
    .finally(() => (loading.newest = false));
}

// 热播mv
function getHotMV() {
  loading.hot = true;
  MVApi.getAllMVList({ ...mvdata.hot.params } as MVType.AllMVListParam)
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      mvdata.hot.list = data || [];
      console.log("获取热播mv成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取热播mv失败==>", err);
      ElMessage.error(err.message || "获取热播mv失败");
    })
    .finally(() => (loading.hot = false));
}

// 网易出品mv
function getNeteaseMV() {
  loading.hot = true;
  MVApi.getRCMDMV({ ...mvdata.netease.params } as MVType.RCMDMVParam)
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      mvdata.netease.list = data || [];
      console.log("获取网易出品mv成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取网易出品mv失败==>", err);
      ElMessage.error(err.message || "获取网易出品mv失败");
    })
    .finally(() => (loading.hot = false));
}

// 获取mv排行
function getMVTop() {
  loading.top = true;
  MVApi.getMVRanking({ ...queryParams })
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      mvTopData.value = data || [];
      console.log("获取mv排行成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取mv排行失败==>", err);
      ElMessage.error(err.message || "获取mv排行失败");
    })
    .finally(() => (loading.top = false));
}

// mv详情
const handleMVDetail = (item: any) => {
  console.log("mv详情==>", item);
  onTargetPage("/video/mv-detail", { mvid: item.id });
};

// 切换搜索分类类型
const handleSwicthCate = (cate: CategrotType, key: MvDataKey) => {
  if (mvdata[key].params?.area == cate.value) return;
  mvdata[key].params.area = cate.value;
  handleRefresh(key);
};

// mv排行分类切换
const handleSwitchMVTop = (cate: CategrotType) => {
  if (queryParams.area == cate.value) return;
  queryParams.area = cate.value;
  getMVTop();
};

// 刷新
function handleRefresh(key: MvDataKey) {
  const k = {
    newest: getNewestMV,
    hot: getHotMV,
    netease: getNeteaseMV,
  };
  k[key as keyof typeof k]();
}

defineOptions({
  name: "MV",
});
</script>

<template>
  <div class="mv">
    <!-- 最新mv/热播mv/网易出品mv -->
    <div
      v-for="(mv, key) in mvdata"
      class="newest-mv mb-20px"
      v-loading="loading[key as keyof typeof loading]"
      :element-loading-text="`加载${mv.title}中🍈...`"
    >
      <div class="flex items-center justify-between mb-10px">
        <div
          class="title-tip"
          @click="onTargetPage('/video/all-mv', { cateType: mv.cateType })"
        >
          <span class="text">{{ mv.title }}</span>
          <i-ep-ArrowRight />
        </div>

        <!-- 分类 -->
        <div class="cate" v-if="mv.isCate">
          <div class="cate-item">
            <el-link
              class="cate-text"
              :class="{ 'cate-active': mv.params.area == cate.value }"
              v-for="cate in categoryList"
              :key="cate.value"
              :underline="false"
              @click="handleSwicthCate(cate, key)"
              >{{ cate.name }}</el-link
            >
          </div>
        </div>
      </div>

      <!-- 最新mv列表 -->
      <div
        v-if="mv.list?.length"
        class="mv-list grid grid-flow-row justify-between grid-cols-2 lg:grid-cols-3 gap-5 2xl:grid-cols-4"
      >
        <div v-for="item in mvdata[key].list" :key="item.id" class="mv-item">
          <!-- mv封面 -->
          <div class="cover relative">
            <el-image
              lazy
              class="w-full shadow cursor-pointer rounded-5px"
              style="border: 2px solid rgba(190, 190, 190, 0.2)"
              :src="item.cover + '?param=350y190'"
              fit="cover"
              :title="item.name"
              @click="handleMVDetail(item)"
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
            @click="handleMVDetail(item)"
          >
            {{ item.name }}
          </div>
          <!-- mv创建者 -->
          <div class="text-#D0D0D0 text-xs mt-5px truncate">
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
          <span class="text-xs text-#838080">{{ "获取失败啦~" }}</span>
          <el-link
            @click="handleRefresh(key)"
            :underline="false"
            style="font-size: 0.75rem; line-height: 2rem"
            class="ml-10px"
            >重试</el-link
          >
        </div>
      </div>
    </div>

    <!-- mv排行 -->
    <div
      class="top"
      v-loading="loading.top"
      element-loading-text="加载MV排行中🍈..."
    >
      <div class="flex items-center justify-between mb-10px">
        <div class="title-tip">
          <span class="text">MV排行</span>
          <i-ep-ArrowRight />
        </div>

        <!-- 分类 -->
        <div class="cate">
          <div class="cate-item">
            <el-link
              class="cate-text"
              :class="{ 'cate-active': queryParams.area == cate.value }"
              v-for="cate in categoryList"
              :key="cate.value"
              :underline="false"
              @click="handleSwitchMVTop(cate)"
              >{{ cate.name }}</el-link
            >
          </div>
        </div>
      </div>

      <div
        class="mv-top grid grid-cols-2 2xl:grid-cols-2 grid-flow-row justify-between"
      >
        <div class="mv-top-item" v-for="(m, i) in mvTopData" :key="m.id">
          <div class="index">{{ (i + 1).toString().padStart(2, "0") }}</div>
          <div class="mv-cover min-w-260px w-fll h-full">
            <el-image
              lazy
              class="w-full shadow cursor-pointer rounded-5px"
              style="border: 2px solid rgba(190, 190, 190, 0.2)"
              :src="m.cover + '?param=200y120'"
              fit="cover"
              :title="m.name"
              @click="onTargetPage('/video/mv-detail', { mvid: m.id })"
            />

            <div class="score text-#fff">
              <svg-icon size="22px" icon-class="hot-mv" />
              <span>{{ m.score }}</span>
            </div>
          </div>

          <div class="mv-artists">
            <div
              @click="onTargetPage('/video/mv-detail', { mvid: m.id })"
              class="mv-name cursor-pointer"
              :title="m.name"
            >
              {{ m.name }}
            </div>
            <div class="text-xs mt-5px truncate">
              <span
                v-for="artist in m.artists"
                class="name cursor-pointer"
                :title="artist.name"
                @click="TTUL('歌手页暂未完成')"
                >{{ artist.name }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}
.cate-item {
  @include flex-center;
  .cate-text:not(:last-child) {
    margin-right: 30px;
  }
  .cate-active {
    font-weight: bold;
    font-size: 17px;
    color: var(--el-color-primary);
  }
}

.mv-top {
  min-width: 820px;
  .mv-top-item {
    padding: 20px;
    @include flex-center;
  }
  .mv-top-item:nth-child(2n + 1) {
    border-right: 1.5px solid #eee;
  }
  .mv-top-item:not(:last-child, :nth-child(7)) {
    border-bottom: 1.5px solid #eee;
  }

  .index {
    font-size: 25px;
    margin-right: 10px;
    color: #acacac;
  }

  .mv-cover {
    position: relative;
    margin-right: 10px;
    .score {
      @include flex-center;
      position: absolute;
      right: 15px;
      top: 10px;
      font-size: 12.5px;
      z-index: 2;
    }
  }

  .mv-artists {
    height: 100%;
    padding-top: 20px;
    .mv-name {
      font-size: 14px;
    }
    .name {
      &:not(:last-child)::after {
        content: "/";
        padding: 0 5px;
      }
      color: #7e7d7d;
      &:hover {
        color: #333333;
      }
    }
  }
}
</style>
