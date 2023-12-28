<script lang="ts" setup>
import { useRouter } from "vue-router";
import * as HighqualityApi from "@/api/highquality";
import * as SongListApi from "@/api/songList";
import * as SongListType from "@/api/songList/type";
import Highquality from "./modules/Highquality.vue";
import SongListCate from "./modules/SongListCate.vue";
import { ArrowRight, User } from "@element-plus/icons-vue";
import { useNumberFormat } from "@/utils";

const emit = defineEmits<{
  (e: "switchTab", tab: any): void
}>();

// 路由对象
const router = useRouter();
const SongListCateRef = ref();
const HighqualityRef = ref();
// 加载
const loading = reactive({
  quality: false,
  songlist: false,
});
// 精品歌单第一项数据
const highquality = ref<any>({});
// 热门歌单分类
const hotSongListCate = ref<any>([]);
// 歌单列表
const songList = ref<any>([]);
// 请求参数
const queryParams = reactive({
  order: "hot",
  cat: "全部",
  // 总数量
  total: 0,
  // 一次返回50条数据
  limit: 50,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
});
// 是否显示精品歌单页面
const showQuality = ref(false);

watch(
  () => queryParams.cat,
  (newSub) => {
    if (newSub) {
      handleRefresh();
      getHighqualityFirstData();
    }
  }
);

onMounted(() => {
  // 获取精品歌单第一项数据
  getHighqualityFirstData();
  // 获取热门歌单分类
  getHotSongListCate();
  // 获取歌单 ( 网友精选碟 )
  getSongList();
});

// 获取歌单 ( 网友精选碟 )
function getSongList() {
  loading.songlist = true;
  SongListApi.getSongList({
    cat: queryParams.cat,
    order: queryParams.order as SongListType.SongListOrderType,
    limit: queryParams.limit,
    offset: queryParams.offset,
  })
    .then((res) => {
      const { code, total, playlists } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      console.log("获取歌单 ( 网友精选碟 )成功==>", res.data);
      queryParams.total = total;
      songList.value = playlists || [];
    })
    .catch((err) => {
      console.log("获取歌单 ( 网友精选碟 )失败==>", err);
      ElMessage.error(err.message || "获取歌单 ( 网友精选碟 )失败");
    })
    .finally(() => (loading.songlist = false));
}

// 获取热门歌单分类
function getHotSongListCate() {
  SongListApi.getHotSongListCate().then((res) => {
    const { code, tags } = res.data;
    if (code != 200) {
      return;
    }
    hotSongListCate.value = tags || [];
    hotSongListCate.value.unshift({ id: -1, name: "全部" });
  });
}

// 获取一项精品歌单
function getHighqualityFirstData() {
  loading.quality = true;
  HighqualityApi.getHighqualitySongList({ limit: 1, cat: queryParams.cat })
    .then((res) => {
      const { code, playlists } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      highquality.value = playlists[0] || {};
    })
    .finally(() => (loading.quality = false));
}

// 显示歌单分类
const handleShowSongListCate = () => {
  SongListCateRef.value?.show();
};

// 切换歌单分类
const handleSwitchCate = (cate: any) => {
  if (cate.name == queryParams.cat) return;
  queryParams.cat = cate.name;
  // 刷新列表数据
  handleRefresh();
};

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  getSongList();
};

// 跳转到歌单详情页
const onTargetSongListDetail = (item: any) => {
  router.push({
    path: "/song/song-detail",
    query: {
      songId: item.id,
    },
  });
};

// 显示精品歌单页面
const onTargetHighquality = () => {
  HighqualityRef.value!.show(true)
}

// 刷新列表数据
function handleRefresh(bool: boolean = true) {
  bool && getSongList();
}

// 组件名称
defineOptions({
  name: "SongList",
});
</script>

<template>
  <div class="song-list" v-show="!showQuality">
    <!-- 精品歌单 -->
    <div class="quality w-full mb-20px" v-loading="loading.quality">
      <div class="mr-15px">
        <el-image
          @click="onTargetHighquality"
          class="w-150px h-150px rounded"
          :src="highquality?.coverImgUrl + '?param=100y100'"
          fit="cover"
        />
      </div>

      <div class="flex flex-col justify-between" @click="onTargetHighquality">
        <div class="title-tag">精品歌单</div>
        <div class="desc">
          <div class="text-20px mb-10px">{{ highquality?.name }}</div>
          <div class="text-13px">{{ highquality?.copywriter }}</div>
        </div>
      </div>
      <!-- 背景图片模糊 -->
      <img
        class="bg-highquality"
        :src="highquality?.coverImgUrl + '?param=100y100'"
        :draggable="false"
      />
    </div>

    <!-- 歌单分类 -->
    <div class="cate flex items-center justify-between mb-30px">
      <el-button plain round @click="handleShowSongListCate">
        <span>{{
          queryParams.cat == "全部" ? "全部歌单" : queryParams.cat
        }}</span>
        <el-icon><ArrowRight /></el-icon>
      </el-button>

      <SongListCate v-model="queryParams.cat" ref="SongListCateRef" />

      <!-- 热门歌单分类 -->
      <div v-if="hotSongListCate.length" class="hot-cate flex items-center">
        <div
          class="cate-item"
          v-for="cate in hotSongListCate"
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

      <div v-else class="text-13px text-#838080">暂无热门歌单分类</div>
    </div>

    <!-- 歌单列表 -->
    <div
      v-loading="loading.songlist"
      class="song-list grid grid-flow-row grid-cols-3 lg:grid-cols-4 gap-5 2xl:grid-cols-5"
    >
      <div
        v-for="item in songList"
        :key="item.id"
        class="song-box overflow-hidden rounded-5px"
      >
        <div class="img-box" @click="onTargetSongListDetail(item)">
          <!-- 播放量 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.playCount) }}</span>
          </div>

          <!-- 该歌单是否为精品歌单 -->
          <div class="high-qality" v-if="item.highQuality">
            <svg-icon size="20px" icon-class="jingpingedan" />
          </div>

          <!-- 创作者 -->
          <div class="songlist-creator">
            <el-icon size="12px" color="#fff"><User /></el-icon>
            <div
              class="text-11px oneline-hide text-#fff mx-4px"
              :class="{ 'w-35%': item.creator?.nickname.length > 8 }"
            >
              {{ item.creator?.nickname }}
            </div>
            <img
              v-if="item.creator?.avatarDetail?.identityIconUrl"
              class="ident-icon object-cover w-[15px] h-[15px]"
              :src="item.creator?.avatarDetail?.identityIconUrl"
            />
          </div>

          <!-- 背景图片 -->
          <el-image
            class="w-full bg-cover"
            style="border-radius: 5px"
            :src="item.coverImgUrl + '?param=100y100'"
            fit="cover"
            :title="item.name"
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

    <!-- 分页组件 -->
    <pagination
      :total="queryParams.total"
      v-model:limit="queryParams.limit"
      v-model:page="queryParams.pageNum"
      @pagination="handlePagination"
    />
  </div>
  <!-- 精品歌单 -->
  <Highquality ref="HighqualityRef" v-model="showQuality" v-show="showQuality" />
</template>

<style lang="scss" scoped>
.quality {
  position: relative;
  padding: 20px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  cursor: pointer;
  .bg-highquality {
    position: absolute;
    top: 50%;
    left: 0;
    z-index: -1;
    width: 100%;
    transform: translateY(-50%);
    filter: blur(80px);
  }

  .title-tag {
    margin-bottom: 20px;
    font-size: 14px;
    width: 100px;
    padding: 5px 10px;
    text-align: center;
    color: #dc9230;
    border: 1px solid #d79239;
    border-radius: 50px;
    font-weight: 600;
  }
  .desc {
    color: var(--el-color-white);
  }
}
.cate {
  position: relative;
  .cate-item {
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
}
</style>
