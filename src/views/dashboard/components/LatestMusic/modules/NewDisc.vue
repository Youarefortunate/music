<script lang="ts" setup>
import * as NewestEnum from "@/enums/NewestEnum";
import * as AlbumApi from "@/api/album";
import { scrollTo } from "@/utils/scroll-to";

// 加载
const loading = ref(false);
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
  // 分类类型
  area: NewestEnum.NewDiscTypeEnum.all,
});
// 请求结果
const result = reactive({
  newAlbums: [] as any,
  allAlbums: [] as any,
});
// 全部新碟分页请求成功滚动回顶部的距离
const top = ref(0);
const imgLoadCount = ref(0);
// const radioVal = ref("推荐");
// 分类项
const categoryList = [
  { name: "全部", value: NewestEnum.NewDiscTypeEnum.all },
  { name: "华语", value: NewestEnum.NewDiscTypeEnum.zh },
  { name: "欧美", value: NewestEnum.NewDiscTypeEnum.ea },
  { name: "韩国", value: NewestEnum.NewDiscTypeEnum.kr },
  { name: "小日本", value: NewestEnum.NewDiscTypeEnum.jp },
];

onMounted(() => {
  // 获取最新专辑
  getNewestAlbum();
});

// 获取全部专辑
async function getAllAlbumList() {
  AlbumApi.getAllAlbumList({
    area: queryParams.area,
    limit: queryParams.limit,
    offset: queryParams.offset,
  })
    .then((res) => {
      const { code, total, albums } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      console.log("获取全部专辑成功==>", res.data);
      queryParams.total = total;
      result.allAlbums = albums || [];
    })
    .catch((err) => {
      console.log("获取全部专辑失败==>", err);
      ElMessage.error(err.message || "获取全部专辑失败");
    })
    .finally(() => (loading.value = false));
}

// 获取最新专辑
function getNewestAlbum() {
  loading.value = true;
  AlbumApi.getNewestAlbum().then(async (res) => {
    const { code, albums } = res.data;
    if (code != 200) {
      // 获取全部专辑
      await getAllAlbumList();
      return ElMessage.error("获取最新专辑失败");
    }
    result.newAlbums = albums || [];

    // 获取全部专辑
    await getAllAlbumList();
    console.log("获取最新专辑成功==>", res.data);
  });
}

function hotDiscImgLoad() {
  imgLoadCount.value += 1;
  if (imgLoadCount.value >= result.newAlbums.length - 1) {
    const AllDiscTextDom = document.querySelector(".all-disc") as HTMLElement;
    top.value = AllDiscTextDom.offsetTop;
  }
}

// 点击跳转专辑页面
const handleTargetAlbumDetail = (item: any) => {
  console.log('点击跳转专辑页面==>', item);
}

// 切换搜索分类类型
const handleSwicthCate = (cate: any) => {
  if (queryParams.area == cate.value) return;
  queryParams.area = cate.value;
  handleRefresh();
};

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  loading.value = true;
  // 重新获取数据
  getAllAlbumList();
  scrollTo(top.value, 800);
};

// 刷新列表
function handleRefresh(bool: boolean = true) {
  bool && getNewestAlbum();
}

defineOptions({
  name: "NewDisc",
});
</script>

<template>
  <div
    class="disc"
    :class="{ 'h-full': loading }"
    v-loading="loading"
    element-loading-text="努力加载中🌽..."
  >
    <!-- 热门新碟 -->
    <div class="hot-disc mb-30px">
      <h2 class="pb-10px" style="border-bottom: 2px solid #c20c0c">热门新碟</h2>
      <div
        v-if="result.newAlbums.length"
        class="hot-disc-list grid grid-flow-row grid-cols-3 lg:grid-cols-4 gap-5 2xl:grid-cols-5"
      >
        <div
          v-for="item in result.newAlbums"
          :key="item.id"
          class="hot-disc-item"
          @click="onTargetPage('/album/album-detail', { albumId: item.id })"
        >
          <div class="img-box">
            <div class="w-80% h-80% relative">
              <el-image
                class="w-full h-full"
                style="border-radius: 5px"
                :src="item.picUrl + '?param=100y100'"
                fit="cover"
                @load="hotDiscImgLoad"
              />
              <img
                class="coverall"
                src="~@/assets/album/coverall.jpeg"
                :draggable="false"
              />

              <!-- hover显示播放按钮 -->
              <div class="play-icon">
                <svg-icon
                  style="font-size: 20px"
                  icon-class="bofanggequ"
                  color="rgb(236,65,65)"
                />
              </div>
            </div>
          </div>
          <div class="name oneline-hide text-xs">
            <div :title="item.name" class="oneline-hide">{{ item.name }}</div>
            <div v-if="item.artists.length" class="oneline-hide">
              <span
                :title="artist.name"
                class="artist-name"
                v-for="artist in item.artists"
                >{{ artist.name }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 失败显示 -->
      <div class="flex items-center justify-center w-full h-100px" v-else>
        <div class="flex items-center">
          <span class="text-xs text-#838080">{{ "获取失败啦~" }}</span>
          <el-link
            @click="handleRefresh()"
            :underline="false"
            style="font-size: 0.75rem; line-height: 2rem"
            class="ml-10px"
            >重试</el-link
          >
        </div>
      </div>
    </div>

    <!-- 全部新碟分类 -->
    <div class="mb-20px">
      <h2
        class="flex items-center pb-10px"
        style="border-bottom: 2px solid #c20c0c"
      >
        <span class="mr-30px all-disc">全部新碟</span>
        <!-- 分类 -->
        <div class="cate">
          <div class="cate-item">
            <el-link
              class="cate-text"
              :class="{ 'cate-active': queryParams.area == cate.value }"
              v-for="cate in categoryList"
              :key="cate.value"
              :underline="false"
              @click="handleSwicthCate(cate)"
              >{{ cate.name }}</el-link
            >
          </div>
        </div>
      </h2>
      <!-- 推荐/全部 新碟 -->
      <!-- <div class="flex items-center mr-10px">
        <el-radio-group v-model="radioVal">
          <el-radio-button label="推荐" />
          <el-radio-button label="全部" />
        </el-radio-group>
      </div> -->
    </div>

    <!-- 全部新碟列表 -->
    <div
      v-if="result.allAlbums.length"
      class="all-disc-list grid grid-flow-row grid-cols-3 lg:grid-cols-4 gap-5 2xl:grid-cols-5"
    >
      <div
        v-for="item in result.allAlbums"
        :key="item.id"
        class="all-disc-item"
        @click="onTargetPage('/album/album-detail', { albumId: item.id })"
      >
        <div class="img-box">
          <div class="w-80% h-80% relative">
            <el-image
              class="w-full h-full"
              style="border-radius: 5px"
              :src="item.picUrl + '?param=100y100'"
              fit="cover"
            />
            <img
              class="coverall"
              src="~@/assets/album/coverall.jpeg"
              :draggable="false"
            />

            <!-- hover显示播放按钮 -->
            <div class="play-icon">
              <svg-icon
                style="font-size: 20px"
                icon-class="bofanggequ"
                color="rgb(236,65,65)"
              />
            </div>
          </div>
        </div>
        <div class="name oneline-hide text-xs">
          <div :title="item.name" class="oneline-hide">{{ item.name }}</div>
          <div v-if="item.artists.length" class="oneline-hide">
            <span
              :title="artist.name"
              class="artist-name"
              v-for="artist in item.artists"
              >{{ artist.name }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 失败显示 -->
    <div class="flex items-center justify-center w-full h-100px" v-else>
      <div class="flex items-center">
        <span class="text-xs text-#838080">{{ "获取失败啦~" }}</span>
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
      :auto-scroll="false"
      :total="queryParams.total"
      v-model:limit="queryParams.limit"
      v-model:page="queryParams.pageNum"
      @pagination="handlePagination"
    />
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}

.coverall {
  position: absolute;
  top: 50%;
  right: 0;
  height: 90%;
  width: 20px;
  transform: translate(20px, -50%);
}

.name {
  color: #393939;
  cursor: pointer;

  &:hover {
    color: black;
  }
  .artist-name {
    color: #7e7e7e;
    cursor: pointer;
    &:not(:last-child)::after {
      content: "/";
      padding: 0 5px;
    }

    &:hover {
      color: rgb(94, 94, 94);
    }
  }
}

.hot-disc-item,
.all-disc-item {
  .play-icon {
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
  }
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
</style>
