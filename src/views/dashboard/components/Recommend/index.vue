<script lang="ts" setup>
// import { useRouter } from 'vue-router'
import * as recommendApi from "@/api/discoverMusic/recommend/index";
import { useNumberFormat, isExternal } from "@/utils";
import { onTargetPage } from "@/utils/globalMethods";
import { BannerTargetTypeEnum } from "@/enums/BannerTargetTypeEnum";

const emit = defineEmits<{
  (e: "switchTab", tab: any): void;
}>();

// 路由对象
// const router = useRouter();

// 轮播图加载
const loadingBanner = ref(false);
// 推荐歌单loading
const loadingrecommendSong = ref(false);

// 获取轮播图
onMounted(async () => {
  getBannerList();
  getRecommendSongList(10);
});

// 轮播图
const bannersList = ref<any>([]);
// 获取轮播图
function getBannerList(type?: number) {
  loadingBanner.value = true;
  recommendApi
    .getBanner(type)
    .then((res) => {
      const { banners } = res.data;
      console.log("轮播图banner==>", banners);
      loadingBanner.value = false;
      bannersList.value = banners;
    })
    .catch((err) => {
      ElMessage.error("获取轮播图失败");
      console.error(err);
    })
    .finally(() => (loadingBanner.value = false));
}

// 推荐歌单列表数组
const recommendSongList = ref<any>([]);
// 获取推荐歌单
function getRecommendSongList(limit?: number) {
  loadingrecommendSong.value = true;
  recommendApi
    .getRecommendSongList(limit)
    .then((res) => {
      const { result } = res.data;
      // console.log("推荐歌单==>", result);
      loadingrecommendSong.value = false;
      recommendSongList.value = result;
    })
    .catch((err) => {
      ElMessage.error("获取推荐歌单列表失败");
      console.error(err);
    })
    .finally(() => (loadingrecommendSong.value = false));
}

// 点击轮播图某一项
const handleClickBannerItem = (banner: any) => {
  console.log("点击轮播图某一项==>", banner);
  onTargetTypePage(banner);
};

// 跳转到歌单广场标签页
const handleSwitchTab = () => {
  emit("switchTab", "songList");
};

/**
 * 根据type类型跳转指定类型页面
 */
function onTargetTypePage(banner: any) {
  const type = {
    [BannerTargetTypeEnum.song]: banner?.targetId,
    [BannerTargetTypeEnum.album]: "/album/album-detail",
    [BannerTargetTypeEnum.songList]: "/song/song-detail",
    [BannerTargetTypeEnum.link]: banner?.url,
  };
  const key = banner?.targetType as keyof typeof type;
  // 跳转链接
  if (isExternal(type[key])) {
    return window.open(type[key]); // 打开新窗口
  }
  // 跳转页面
  if (typeof type[key] == "string") {
    const param = type[key].split("/")[1] + "Id";
    return onTargetPage(type[key], { [param]: banner?.targetId });
  }
}

// 组件名称
defineOptions({
  name: "Recommend",
});
</script>

<template>
  <div class="recommend-container">
    <!-- 轮播图 -->
    <div
      class="swiper-banner"
      v-loading="loadingBanner"
      element-loading-text="加载轮播图..."
    >
      <el-carousel
        class="mb-[30px]"
        :interval="4000"
        type="card"
        height="200px"
        indicator-position="outside"
        :autoplay="false"
      >
        <el-carousel-item
          v-for="item in bannersList"
          :key="item.targetType"
          @click="handleClickBannerItem(item)"
        >
          <span
            class="type-title"
            :style="`background-color: ${item?.titleColor}`"
            >{{ item.typeTitle }}</span
          >
          <el-image
            class="swiper-img w-full h-[200px]"
            :src="item.imageUrl + '?param=540y200'"
            fit="cover"
          />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 推荐歌单 -->
    <div
      class="recommend-song-list mb-[30px]"
      v-loading="loadingrecommendSong"
      element-loading-text="加载推荐歌单..."
    >
      <div class="title-tip" @click="handleSwitchTab()">
        <span class="text">推荐歌单</span>
        <i-ep-ArrowRight />
      </div>

      <div
        class="song-list grid grid-flow-row grid-cols-3 lg:grid-cols-4 gap-5 2xl:grid-cols-5"
      >
        <div v-for="item in recommendSongList" :key="item.id" class="song-box">
          <div
            class="img-box"
            @click="onTargetPage('/song/song-detail', { songId: item.id })"
          >
            <!-- 播放量 -->
            <div class="counts text-white text-sm">
              <svg-icon icon-class="bofangliang" color="#fff" />
              <span class="ml-1">{{ useNumberFormat(item.playCount) }}</span>
            </div>

            <el-image
              class="w-full"
              style="border-radius: 5px"
              :src="item.picUrl + '?param=260y260'"
              fit="cover"
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
          <div class="song-name oneline-hide text-xs">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 穿透样式
:deep(.swiper-banner) {
  .el-image__inner,
  .el-carousel__mask {
    background-color: rgb(236, 236, 236);
  }

  // 轮播图指示器的颜色
  .el-carousel__button {
    background-color: #181818;
  }
}

// 轮播图样式穿透
:deep(.swiper-banner) {
  .el-carousel__container {
    height: 230px;
  }

  .el-carousel__item {
    height: 200px;
  }

  .el-image__inner {
    background-color: #fff;
  }

  .el-carousel__arrow--left,
  .el-carousel__arrow--right {
    color: rgb(240, 216, 213);

    &:hover {
      color: #fff;
    }
  }

  .el-carousel__arrow {
    background-color: rgba(143, 143, 142, 0.5) !important;

    .el-icon {
      $size: 2em;
      width: $size;
      height: $size;
      line-height: $size;

      & svg {
        width: 1.5em;
        height: 1.5em;
      }
    }
  }
}

.swiper-banner {
  .type-title {
    position: absolute;
    right: 0;
    bottom: 0;
    background-color: rgb(74, 121, 204);
    font-size: 10px;
    padding: 5px 8px;
    border-radius: 10px 0 0 0;
    color: #fff;
    z-index: 2;
  }
}

// 通用标题字体样式
.title-tip {
  width: 100px;
  cursor: pointer;
  margin-bottom: 10px;

  .text {
    font-size: 20px;
  }

  &:hover {
    font-weight: bold;
  }
}
</style>
