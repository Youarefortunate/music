<script setup lang="ts">
import { useMusicStore } from "@/store/modules/music";
import { useFootStore } from "@/store/modules/foot";
import { storeToRefs } from "pinia";
import * as MusicApi from "@/api/music";
import { ArrowDown, EditPen } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { scrollTo } from "@/utils/scroll-to";
import { useDebounceFn } from "@vueuse/core";
import * as LyricModel from "@/common/model/lyric";
import CommentDialog from "./CommentDialog.vue";
import MusicDetailComment from "@/components/Comment/index.vue";

// 音乐store
const musicStore = useMusicStore();
const { showMusicDetail, curMusicRecord } = storeToRefs(musicStore);
const footStore = useFootStore();

// 当前是否为暗色主题
const isDark = useDark();
// 页面高度
const pageHeight = ref<number>(0);
// 当前歌曲歌词
const lyric = ref<string>("");
// 解析之后的歌词数据
const lyricData = ref<Array<any>>([]);
// 歌词滚动需要操作的dom
const dom = reactive<LyricModel.DomObject>({
  lyricContainer: null,
  lyricContentUl: null,
});
// 加载
const loading = reactive({
  // 评论加载
  comment: false,
  // 歌词加载
  lyric: false,
});

// 当页面滚动到某个位置时显示歌曲名称、歌曲作曲者名字
const showTitle = ref<boolean>(false);
// 页面是否滚动
const isScroll = ref<boolean>(false);
// 是否滚动定时器
const isScrollTime = ref<NodeJS.Timeout>();
const contentDom = ref<HTMLElement | null>(null);
// 获取歌曲评论请求参数
const queryParams = reactive({
  // 总评论条数
  total: 0,
  // 一次返回50条数据
  limit: 50,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
  // 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到)
  before: 0,
});

// 评论数据信息
const commentInfo = reactive({
  // 置顶评论
  topComments: [] as any,
  // 热门评论
  hotComments: [] as any,
  // 普通评论
  comments: [] as any,
});

// 发表评论弹窗
const CommentRef = ref<any>(null);

// 音乐封面
const poster = computed(() => {
  return (
    musicStore.curMusicRecord.al?.picUrl ||
    musicStore.curMusicRecord?.album?.picUrl
  );
});

onMounted(() => {
  pageHeight.value = window.innerHeight;
  getLyricDom();
});

// 更新歌词需要滚动的dom
watch(
  () => footStore.footMode,
  (mode) => {
    if (mode == "music") {
      // 更新歌词dom
      getLyricDom();
    }
  }
);

// 如果playIndex变了说明歌曲切换了，重新获取该首歌的歌曲歌曲评论
watch(
  () => musicStore.playIndex,
  (newVal, oldVal) => {
    const oldId =
      musicStore.curPlayList[oldVal as keyof typeof musicStore.curPlayList]?.id;
    const newId =
      musicStore.curPlayList[newVal as keyof typeof musicStore.curPlayList]?.id;
    // 同一首歌
    if (oldId == newId && !showMusicDetail.value) {
      return;
    }
    // 刷新歌曲评论歌词
    handRefresh();
  }
);

// 页面显示监听页面滚动
watch(
  showMusicDetail,
  (newVal) => {
    if (newVal) {
      // 刷新歌曲评论歌词
      handRefresh();
      // 隐藏body的滚动条
      document.body.style.overflow = "hidden";
      // 获取整体的容器dom
      contentDom.value = document.querySelector(
        ".music-container .content"
      ) as HTMLElement;
      // 监听页面滚动事件
      contentDom.value?.addEventListener("scroll", (e: Event) => {
        isScroll.value = true;
        debouncedFn(e);
      });
    } else {
      document.body.style.overflow = "";
      contentDom.value?.removeEventListener("scroll", (e: Event) => {
        isScroll.value = false;
        debouncedFn(e);
        clearTimeout(isScrollTime.value);
      });
    }
  },
  { immediate: true }
);

// 滚动防抖
const debouncedFn = useDebounceFn(
  (e: Event) => {
    if (isScrollTime) {
      clearTimeout(isScrollTime.value);
    }
    isScrollTime.value = setTimeout(() => {
      isScroll.value = false;
    }, 500);
    if (
      (e.target as HTMLElement).scrollTop > (e.target as HTMLElement).offsetTop
    ) {
      showTitle.value = true;
    } else {
      showTitle.value = false;
    }
  },
  50,
  { maxWait: 5000 }
);

/**
 * 获取歌词容器DOM
 */
function getLyricDom() {
  dom.lyricContentUl = document.querySelector(
    ".music-container .lyric-content"
  ) as HTMLElement;
  dom.lyricContainer = document.querySelector(
    ".music-container .lyric-container"
  ) as HTMLElement;

  Object.assign(LyricModel.dom, dom);
}

// 获取歌曲评论
function getSongComment() {
  // 开始加载
  loading.comment = true;
  MusicApi.getMusicComment({
    id: curMusicRecord.value.id,
    limit: queryParams.limit,
    offset: queryParams.offset,
    // before: queryParams.before,
  })
    .then((res) => {
      const { code, total } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取歌曲评论失败"));
      }
      // 总评论条数
      queryParams.total = total;
      // 置顶评论
      commentInfo.topComments = res.data.topComments || [];
      // 热门评论
      commentInfo.hotComments = res.data.hotComments || [];
      // 普通评论
      commentInfo.comments = res.data.comments || [];

      console.log("获取歌曲评论成功==>", res.data);
    })
    .catch((err) => {
      ElMessage.error(err || err.message || "获取歌曲评论失败");
      console.log("获取歌曲评论失败==>", err);
    })
    .finally(() => (loading.comment = false));
}

// 获取歌曲歌词
async function getSongLyric() {
  // 开始加载
  loading.lyric = true;
  await MusicApi.getSongLyric({
    id: curMusicRecord.value.id,
  })
    .then(async (res) => {
      const { code, lrc } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取歌曲歌词失败"));
      }
      console.log("获取歌词成功==>", res.data);
      lyric.value = lrc.lyric;
      // 解析歌词字符串
      LyricModel.parseLrc(lyric.value);
      lyricData.value = LyricModel.lyricData.value;
      console.log("解析之后的歌词==>", lyricData.value);
      LyricModel.createLyricLiElement();
    })
    .catch((err) => {
      ElMessage.error(err || err.message || "获取歌曲歌词失败");
      console.log("获取歌曲歌词失败==>", err);
    })
    .finally(() => (loading.lyric = false));
}

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  queryParams.before =
    commentInfo.comments[commentInfo.comments.length - 1].time;
  // 重新获取数据，但不刷新歌词
  handRefresh(false);
  // 滚动到顶部
  scrollTo(0, 800, contentDom.value);
};

// 刷新评论列表
function handleRefreshCommentList() {
  // 重新获取歌曲评论列表
  getSongComment();
}

/**
 * 发表评论
 */
const handleComment = () => {
  CommentRef.value!.show(true);
};

/**
 * 监听歌曲封面图片加载完成
 */
function loadSongPoster() {
  // console.log("歌曲封面图片加载完成");
}
function handleImgLoad() {}

// 显示音乐详情页
function show(show: boolean) {
  showMusicDetail.value = show;
}

// 关闭音乐详情页
function close() {
  showMusicDetail.value = false;
}

/**
 * 刷新
 * @param bool 是否刷新指定数据
 */
function handRefresh(bool: boolean = true) {
  // 重新获取歌曲评论列表
  getSongComment();
  // 重新获取歌曲歌词
  bool && getSongLyric();
}

defineExpose({
  show,
});
defineOptions({
  name: "MusicDetail",
});
</script>

<template>
  <!-- 这里最好不要用top，因为会导致动画卡顿，推荐用transform，因为transform不会导致浏览器重绘 -->
  <div
    class="music-container"
    :style="{
      opacity: showMusicDetail ? 1 : 0,
      transform: showMusicDetail
        ? 'translateY(0px)'
        : `translateY(${pageHeight}px)`,
    }"
  >
    <!-- 音乐详情顶部：搜索框、全屏 -->
    <div class="header">
      <div class="float-left ml-[15px] cursor-pointer" @click="close">
        <el-icon size="23">
          <ArrowDown />
        </el-icon>
      </div>

      <div
        class="song-title flex flex-col items-center"
        :style="{
          opacity: showTitle ? '1' : '0',
          transform: showTitle ? 'translateY(0px)' : 'translateY(30px)',
        }"
      >
        <div class="song-name">{{ curMusicRecord?.name }}</div>
        <div class="singer-name" v-show="curMusicRecord?.ar?.length">
          作曲：
          <span
            v-for="alia in curMusicRecord?.ar"
            class="singer-name cursor-pointer oneline-hide"
            style="max-width: 30%"
            :key="alia.id"
            >{{ alia.name }}</span
          >
        </div>
      </div>
    </div>

    <div class="content">
      <!-- 音乐详情内容 -->
      <div class="music-content">
        <!-- 左侧黑胶唱片 -->
        <div class="left-song-cover">
          <!-- 唱片臂 -->
          <div class="song-arm">
            <!-- 这里通过类名控制唱片臂的旋转角度 -->
            <img
              :class="{
                'rotate-[-10deg]': musicStore.status,
                'rotate-[-45deg]': !musicStore.status,
              }"
              class="w-full h-full rotate-[-10deg]"
              src="@/assets/music/arm.png"
              mode="aspectFit"
            />
          </div>

          <!-- 黑胶唱片，这里控制图片旋转 -->
          <div
            class="song-disc"
            :class="{ rotate: musicStore.status }"
            :style="{
              'animation-play-state': !musicStore.status ? 'paused' : 'running',
            }"
          >
            <img
              class="w-full h-full"
              src="https://oss.chaosageservice.com/eap/2023/2/23/023541585.png"
              mode="aspectFill"
            />
            <!-- 歌曲封面海报 -->
            <img
              class="song-poster"
              :src="poster + '?param=200y200'"
              mode="aspectFill"
              @load="loadSongPoster"
            />
          </div>
        </div>

        <!-- 右侧歌词 -->
        <div class="right-lyric">
          <div class="music-info">
            <div class="music-name" :title="curMusicRecord?.name">
              {{ curMusicRecord?.name }}
            </div>
            <div class="music-desc">
              <span v-if="curMusicRecord?.ar?.length">
                歌手：
                <span
                  v-for="alia in curMusicRecord?.ar"
                  class="singer-name cursor-pointer oneline-hide"
                  style="max-width: 30%"
                  :key="alia.id"
                  :title="alia.name"
                  >{{ alia.name }}</span
                >
              </span>
              <span v-else>未知歌手</span>

              <span class="mx-[10px] cursor-pointer"
                >专辑：{{ curMusicRecord?.al?.name }}</span
              >
              <span>来源：Youarefortunate</span>
            </div>
          </div>

          <div class="lyric-container">
            <ul
              v-loading="loading.lyric"
              v-show="lyricData.length"
              class="lyric-content"
              element-loading-text="歌词加载中..."
              element-loading-background="rgba(255,255,255,0)"
            >
              <template v-for="item in lyricData">
                <li class="lyric-item" v-show="item.words">
                  <span>{{ item.words }}</span>
                  <!-- <span v-else>暂无歌词</span> -->
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>

      <!-- 歌曲评论 -->
      <div class="music-comment flex justify-center">
        <div v-show="!loading.comment" class="w-50%">
          <MusicDetailComment
            type="song"
            comment-class="music-comment-container"
            :id="musicStore.curplayId.toString()"
            :show-edit-comment-inp="false"
            :commen-count="queryParams.total"
            :query-params="queryParams"
            :comment-info="commentInfo"
            @refresh="handleRefreshCommentList"
            @pagination="handlePagination"
          />
        </div>

        <!-- 歌曲评论加载loading -->
        <div
          class="w-full h-200px flex items-center"
          v-show="loading.comment"
          v-loading.lock="loading.comment"
          element-loading-text="加载歌曲评论中..."
          element-loading-background="rgba(255,255,255,0)"
        ></div>
      </div>
    </div>

    <div
      class="edit-comment"
      :style="{
        bottom: !isScroll ? '20px' : '-100px',
      }"
      @click="handleComment"
      v-show="showMusicDetail"
    >
      <el-icon size="15">
        <EditPen />
      </el-icon>
      <span class="ml-[10px]">快来说点什么吧</span>
    </div>

    <!-- 背景图片高斯模糊形成渐变效果 -->
    <img
      class="object-fill bg-poster"
      v-show="showMusicDetail && !isDark"
      :src="curMusicRecord.al?.picUrl"
      :draggable="false"
      @load="handleImgLoad"
    />

    <CommentDialog ref="CommentRef" @handFinish="handRefresh(false)" />
  </div>
</template>

<style lang="scss" scoped>
.music-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3000;
  width: 100%;
  padding: 20px 4px 20px 20px;
  height: calc(100% - $footerHeight);
  transition: all 0.4s linear;
  background-image: linear-gradient(
    to bottom,
    #c2c3c2,
    #c8cac9,
    #cfd0d0,
    #d6d6d7,
    #dddddd,
    #e2e2e2,
    #e7e7e7,
    #ececec,
    #f1f1f1,
    #f5f5f5,
    #fafafa,
    #ffffff
  );
}

.bg-poster {
  position: fixed;
  left: 0;
  top: 0;
  z-index: -2;
  width: 100%;
  height: 100vh;
  transform: translateY(-70%);
  filter: blur(1000px);
  -webkit-filter: blur(1000px);
}

.header {
  white-space: nowrap;

  .song-title {
    transition: all 0.4s;

    .song-name {
      color: #454244;
      font-size: 15px;
    }

    .singer-name {
      font-size: 11px;
      color: #404040;
      margin-bottom: 10px;
    }
  }
}

// 纵向滚动条
@mixin scroll-bar($width: 10px) {
  /*定义滚动条外层轨道的样式*/
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    // background-color: rgba(255,255,255,0);
  }

  /*定义滚动条整体的样式*/
  &::-webkit-scrollbar {
    width: $width;
    // height: 100px;
    background-color: rgba(255, 255, 255, 0);
  }

  /*滚动条里面可以拖动的那个*/
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.content {
  position: relative;
  height: calc(100% - 50px);
  overflow-y: scroll;

  @include scroll-bar(10px);

  // 隐藏滚动条
  // &::-webkit-scrollbar {
  //   display: none;
  // }
  .delete-menu {
    position: absolute;
    z-index: 99;
    font-size: 12px;
    background: var(--el-bg-color-overlay);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);

    .action {
      padding: 8px 16px;
      cursor: pointer;

      &:hover {
        border-radius: 4px;
        background: var(--el-fill-color-light);
      }
    }
  }
}

// 旋转动画
.rotate {
  animation: rotate 15s linear infinite;
}

// 选择动画，顺时针旋转
@keyframes rotate {
  0% {
    -webkit-transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
  }
}

.music-content {
  height: 70%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  // 只有一行
  grid-template-rows: 1fr;
  gap: 40px;
  margin: 30px 30px 50px 180px;

  .left-song-cover {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    // 唱片臂
    .song-arm {
      width: 100px;
      height: 170px;
      position: absolute;
      right: 45%;
      top: -10px;
      transform: translateX(50%);
      z-index: 2;

      & > img {
        transition: all 0.5s ease;
        // 播放时的旋转角度
        // transform: rotate(-10px);
        // 未播放时的旋转角度
        // transform: rotate(-45deg);
        // 旋转中心为元素左上角
        transform-origin: top left;
      }
    }

    // 黑胶唱片
    .song-disc {
      position: relative;
      z-index: 1;
      width: 380px;
      height: 380px;
      margin-top: 60px;
      border-radius: 50%;
      border: 15px solid rgba(211, 200, 200, 0.8);

      & img:nth-child(1) {
        transform: scale(1.04);
      }

      // 歌曲封面图片
      .song-poster {
        width: 55%;
        height: 55%;
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  // 右侧歌词
  .right-lyric {
    min-width: 99%;
    height: 500px;
    overflow: hidden;

    .music-info {
      height: 20%;
      white-space: nowrap;
      margin-bottom: 20px;

      .music-name {
        font-size: 20px;
        margin-bottom: 5px;
      }

      .music-desc {
        color: #525252;
        font-size: 12px;
      }
    }

    .lyric-container {
      width: 100%;
      height: calc(80% - 20px);
      overflow: hidden;
      list-style: none;
      transition: 0.6s;
      overflow-y: hidden;
      // overflow-y: scroll;
      // padding-top: 70px;
      /* 当前播放歌词高亮样式 */
      // padding-top: 50px;
      // @include scroll-bar(10px);
      // 隐藏滚动条
      // &::-webkit-scrollbar {
      //   display: none;
      // }
      // -webkit-mask-image: linear-gradient(180deg,
      //     hsla(0, 0%, 100%, 0) 0,
      //     hsla(0, 0%, 100%, 0.6) 5%,
      //     #fff 25%,
      //     #fff 95%,
      //     hsla(0, 0%, 100%, 0.6) 85%,
      //     hsla(0, 0%, 100%, 0));

      .lyric-content {
        transition: 0.2s;

        .lyric-item {
          font-size: 13px;
          color: #767676;
          padding-bottom: 10px;
        }

        & .lyric-active {
          color: black;
          font-weight: 600;
          font-size: 16px;
        }
      }
    }
  }
}

// 评论列表容器
:deep(.music-comment-container) {
  .be-replied {
    background-color: rgba(105, 105, 105, 0.1) !important;
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-bottom: 50px;
  }
}
.edit-comment {
  position: fixed;
  right: 50%;
  bottom: 20px;
  transform: translateX(50%);
  display: flex;
  align-items: center;
  background-color: rgba(164, 164, 164, 0.7);
  border-radius: 50px;
  padding: 15px 25px;
  font-size: 14px;
  cursor: pointer;
  color: #fff;
  backdrop-filter: blur(50px);
  transition: bottom 0.3s;
  &:hover {
    background-color: rgba(125, 125, 125, 0.7);
  }
}

// :deep(.search) {
//   text-align: right;
//   margin-right: 15px;

//   .el-input__wrapper {
//     border-radius: 50px;
//     box-shadow: none;
//     padding: 3px 13px;
//     background-color: rgba(237, 237, 237, 0.6);

//     .el-input__prefix {
//       font-size: 20px;
//       color: #656163;
//     }

//     .el-input__inner {
//       color: #454244;

//       &::placeholder {
//         color: #5f5c5e;
//       }
//     }
//   }
// }
</style>
