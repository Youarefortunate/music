<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import * as SearchMusicEnum from "@/enums/SearchMusicEnum";
import { useNumberFormat, formatPlayTime } from "@/utils";
import { search } from "./index";

const route = useRoute();
const router = useRouter();
// 歌手列表加载
const loading = ref(false);
// 视频mv列表
const videos = ref<any[]>([]);
// 请求参数
const queryParams = reactive({
  // 总搜索数量
  total: 0,
  // 一次返回50条数据
  limit: 70,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
  // 搜索关键字
  keywords: "",
  // 搜索的类型，默认搜索单曲
  type: SearchMusicEnum.SearchMusicType.video,
});

onMounted(() => {
  // 搜索mv视频
  getVideoOfMV();
})

watch(
  () => route.query,
  (newVal) => {
    if (newVal) {
      queryParams.keywords = newVal.keywords as string;
    }
  },
  { immediate: true }
);

// 搜索mv视频
function getVideoOfMV() {
  // 开始加载
  loading.value = true;
  // 获取搜索歌曲
  search({
    keywords: queryParams.keywords,
    limit: queryParams.limit,
    offset: queryParams.offset,
    type: queryParams.type,
  })
    .then((res) => {
      queryParams.total = res?.videoCount || 0;
      videos.value = res?.videos || [];
      console.log("搜索mv视频成功==>", res);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 视频/mv详情
const handleVideoDetail = (item: any) => {
  console.log("点击视频/mv的某一项==>", item);
};

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  getVideoOfMV();
};

defineOptions({
  name: "Video",
});
</script>

<template>
  <div class="video" v-loading="loading">
    <div
      v-if="videos.length"
      class="singer-list grid grid-flow-row justify-between grid-cols-3 lg:grid-cols-3 gap-5 2xl:grid-cols-4"
    >
      <div
        v-for="item in videos"
        :key="item.vid"
        class="video-item"
        @click="handleVideoDetail(item)"
      >
        <!-- 视频/mv封面 -->
        <div class="cover relative">
          <el-image
            lazy
            class="w-full shadow cursor-pointer rounded-5px h-165px"
            style="border: 2px solid rgba(190, 190, 190, 0.2)"
            :src="item.coverUrl + '?param=315y160'"
            fit="cover"
            :title="item.title"
            @click="onTargetPage('/video/mv-detail', { mvid: item.vid })"
          />
          <!-- 视频/mv播放次数 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.playTime) }}</span>
          </div>

          <!-- mv/视频时长 -->
          <div class="play-time">{{ formatPlayTime(item.durationms) }}</div>
        </div>

        <!-- mv/视频名称 -->
        <div>
          <div class="flex items-center">
            <el-tag class="mr-2" size="small" type="danger">MV</el-tag>
            <div
              class="text-xs oneline-hide"
              style="width: calc(100% - (33.33px + 0.5rem))"
            >
              {{ item.title }}
            </div>
          </div>
          <div class="text-#D0D0D0 text-xs mt-5px" v-if="item.creator.length">
            <span class="creator" v-for="creator in item.creator">{{
              creator.userName
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空数据 -->
    <div class="empty-video" v-else>
      <span
        >没有找到有关“<span class="text-#0680D7">{{
          queryParams.keywords
        }}</span
        >”的视频/MV</span
      >
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
.video-item {
  position: relative;
  // 视频播放时长
  .play-time {
    position: absolute;
    bottom: 15px;
    right: 15px;
    color: #fff;
    font-size: 14px;
  }
  .creator:not(:last-child)::after {
    content: " / ";
    margin: 0 5px;
  }
}
.empty-video {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  width: 100%;
  height: calc(100vh - 600px);
}
</style>
