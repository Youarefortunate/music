<script setup lang="ts">
import * as VideoApi from "@/api/video";
import { ArrowRight } from "@element-plus/icons-vue";
import { useNumberFormat, formatPlayTime } from "@/utils";
import { onTargetPage } from "@/utils/globalMethods";
import VideoAllCate from "./VideoAllCate.vue";

// 加载
const loading = ref(false);
const VideoAllCateRef = ref();
// 请求参数
const queryParams = reactive({
  offset: 0,
  cat: "全部",
  catId: 0,
  hasmore: false,
});
// 部分视频分类
const partVideoCate = ref<any>([]);
// 所有视频
const allVideo = ref<any>([]);

onMounted(() => {
  // 获取全部视频
  getAllVideoList();
  // 获取部分视频分类
  getVideoPartCate();
});

watch(() => queryParams.catId, (newVal: number) => {
  console.log('newVal==>', newVal);
  // 每次分类切换时都需要将offset重置
  queryParams.offset = 0;
  if(newVal == -1) {
    getAllVideoList();
  } else {
    getVideoGroup();
  }
})

// 获取全部视频
function getAllVideoList() {
  loading.value = true;
  VideoApi.getAllVideoList(queryParams.offset)
    .then((res) => {
      const { code, datas, hasmore } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      queryParams.hasmore = hasmore;
      allVideo.value = datas || [];
      console.log("获取全部视频成功==>", res.data);
    })
    .catch((err) => {
      console.log("获取全部视频失败==>", err);
      ElMessage.error(err.msg || "获取全部视频失败");
    })
    .finally(() => (loading.value = false));
}

// 获取部分视频分类
function getVideoPartCate() {
  VideoApi.getPartCateList().then((res) => {
    const { code, data } = res.data;
    if (code != 200) {
      return;
    }
    // console.log("获取部分视频分类==>", res.data);
    partVideoCate.value = data || [];
    partVideoCate.value.unshift({ id: -1, name: "全部" });
  });
}

// 获取视频标签/分类下的视频
function getVideoGroup() {
  loading.value = true;
  VideoApi.getVideoGroup({
    id: queryParams.catId,
    offset: queryParams.offset + 1,
  })
    .then((res) => {
      const { code, datas } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      allVideo.value = datas || [];
      console.log("获取视频标签/分类下的视频成功==>", res.data);
    })
    .catch((err) => {
      console.log("获取视频标签/分类下的视频失败==>", err);
      ElMessage.error(err.message || "获取视频标签/分类下的视频失败");
    })
    .finally(() => (loading.value = false));
}

// 视频详情
const handleVideoDetail = (record: any) => {
  console.log("视频详情==>", record);
};

// 切换视频分类
const handleSwitchCate = (cate: any) => {
  if (cate.name == queryParams.cat) return;
  queryParams.cat = cate.name;
  queryParams.catId = cate.id;
  console.log("切换视频分类==>", cate);

  // 刷新列表数据
  // handleRefresh();
};

// 显示视频所有分类
const handleShowVideoAllCate = () => {
  VideoAllCateRef.value?.show();
};

defineOptions({
  name: "Video",
});
</script>

<template>
  <div class="video" v-loading="loading" element-loading-text="加载视频列表中🍒...">
    <!-- 视频分类 -->
    <div class="cate flex items-center justify-between mb-30px">
      <el-button plain round @click="handleShowVideoAllCate">
        <span>{{
          queryParams.cat == "全部" ? "全部视频" : queryParams.cat
        }}</span>
        <el-icon><ArrowRight /></el-icon>
      </el-button>

      <VideoAllCate v-model:cat="queryParams.cat" v-model:catId="queryParams.catId" ref="VideoAllCateRef" />

      <!-- 热门视频分类 -->
      <div v-if="partVideoCate.length" class="hot-cate flex items-center">
        <div
          class="cate-item"
          v-for="cate in partVideoCate"
          :key="cate.id"
          @click="handleSwitchCate(cate)"
        >
          <el-link
            :style="{
              color:
                queryParams.cat == cate.name ? 'var(--el-color-primary)' : '',
            }"
            :underline="false"
            >{{ cate.name }}</el-link
          >
        </div>
      </div>

      <div v-else class="text-13px text-#838080">暂无热门视频分类</div>
    </div>

    <div
      v-if="allVideo.length"
      class="video-list grid grid-flow-row justify-between grid-cols-2 lg:grid-cols-3 gap-5 2xl:grid-cols-3"
    >
      <div
        v-for="item in allVideo"
        :key="item.vid"
        class="video-item"
        @click="handleVideoDetail(item)"
      >
        <!-- 视频封面 -->
        <div class="cover relative">
          <el-image
            lazy
            class="w-full shadow cursor-pointer rounded-5px"
            style="border: 2px solid rgba(190, 190, 190, 0.2)"
            :src="item.data.coverUrl + '?param=350y190'"
            fit="cover"
            :title="item.data.title"
            @click="onTargetPage('/video/video-detail', { videoId: item.data.vid })"
          />
          <!-- 视频播放次数 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.data.playTime) }}</span>
          </div>

          <!-- 视频时长 -->
          <div class="play-time">
            {{ formatPlayTime(item.data.durationms) }}
          </div>
        </div>

        <!-- 视频名称 -->
        <div
          :title="item.data.title"
          class="text-xs oneline-hide cursor-pointer"
          style="width: calc(100% - (33.33px + 0.5rem))"
          @click="onTargetPage('/video/video-detail', { videoId: item.data.vid })"
        >
          {{ item.data.title }}
        </div>
        <!-- 视频创建者 -->
        <div class="text-#D0D0D0 text-xs mt-5px">
          <span class="creator"
            >By
            <span
              class="hover:text-#C2C2C2 cursor-pointer"
              @click="
                onTargetPage('/user/user-profile', {
                  userId: item.data.creator?.userId,
                })
              "
              >{{ item.data.creator?.nickname }}</span
            ></span
          >
        </div>
      </div>
    </div>

    <!-- 空数据 -->
    <div class="empty-video" v-else>
      <span>没有找到有关的视频</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cate {
  position: relative;
  .cate-item {
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
}

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
