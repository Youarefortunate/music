<script lang="ts" setup>
import { toRefs } from "vue";
import { useRoute } from "vue-router";
import * as FMApi from "@/api/fm";
import * as MusicApi from "@/api/music";
import { DeleteFilled, MoreFilled } from "@element-plus/icons-vue";
import { useMusicStore } from "@/store/modules/music";
import { useFootStore } from "@/store/modules/foot";
import { storeToRefs } from "pinia";
import * as LyricModel from "@/common/model/lyric";
import * as FmModel from "@/common/model/fm";
import * as LikeMusicModel from "@/common/model/likeMusic";
import { onTargetPage } from "@/utils/globalMethods";
import FmComment from "@/components/Comment/index.vue";

type RefreshKey = "comment" | "lyric";

const route = useRoute();
// 音乐store
const musicStore = useMusicStore();
const footStore = useFootStore();
const { fmInfo } = storeToRefs(footStore);
const { fmData, curIndex, curRecord } = toRefs(fmInfo.value);
// 加载
const loading = reactive({
  fm: false,
  // 评论加载
  comment: false,
  // 歌词加载
  lyric: false,
});
// 解析之后的歌词数据
const lyricData = ref<Array<any>>([]);
// 上首fm歌曲dom
const lastImgDom = ref<HTMLElement>();
// 歌词滚动需要操作的dom
const dom = reactive<LyricModel.DomObject>({
  lyricContainer: null,
  lyricContentUl: null,
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

// 请求参数
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

// 专辑信息
const album = computed(() => {
  return curRecord.value?.album || curRecord.value?.al;
});
// 歌手信息
const artists = computed(() => {
  return curRecord.value?.artists || curRecord.value?.ar;
});
// 按钮加载
const playBtnLoading = computed<boolean>(() => {
  return musicStore.loading && footStore.isFmPlayMode();
});
// fm音乐播放状态
const fmPlayStatus = computed<boolean>(() => {
  return musicStore.status && footStore.isFmPlayMode();
});
// 该fm是否为我喜欢的音乐
const isMyLikeMusic = computed(() => {
  return fmData.value.some((fm) => fm.id === curRecord.value?.id && fm.like);
});

onMounted(() => {
  getLyricDom();
  // 进入fm音乐播放模式
  footStore.enterFmMode();
  // 获取私人FM
  getPersonalFM();

  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  lastImgDom.value?.removeEventListener("click", handlePrev);
});

// 监听音乐播放模式
watch(
  () => footStore.footMode,
  (newFootMode) => {
    if (newFootMode !== "fm") {
      clearActiveStyle();
    } else {
      // 更新歌词滚动的位置为私人fm页面
      getLyricDom();
    }
    LyricModel.resetLyricPosition();
  }
);

// 监听音频是否播放完毕（需要在可以进行播放时才去调用下一首）
watch(
  () => [musicStore.isEnded, musicStore.loading],
  ([newEnded, newLoading]) => {
    if (newEnded && !newLoading && footStore.isFmPlayMode()) {
      // 下一首私人fm
      next();
    }
  },
  { flush: "sync" }
); // flush: 'sync' 确保在下一个DOM更新循环之前触发回调

// 监听歌曲切换，每次切换都清空上一首歌曲的歌词选中效果，并回滚到初始位置
watch(
  () => musicStore.playIndex,
  () => {
    clearActiveStyle();
    LyricModel.resetLyricPosition();
  }
);

/**
 * 清除歌词选中效果
 */
function clearActiveStyle() {
  // 去除选中样式
  const ulChildren = dom.lyricContentUl?.children;
  if (ulChildren?.length) {
    for (let i = 0; i < ulChildren!.length; i++) {
      if (ulChildren[i].className.includes("lyric-active")) {
        ulChildren[i].classList.remove("lyric-active");
      }
    }
  }
}

/**
 * 获取歌词容器DOM
 */
function getLyricDom() {
  dom.lyricContentUl = document.querySelector(
    ".song-lyric .lyric-content"
  ) as HTMLElement;
  dom.lyricContainer = document.querySelector(
    ".song-lyric .lyric-container"
  ) as HTMLElement;

  Object.assign(LyricModel.dom, dom);
}

// 页面刷新、销毁、前进、后退之前触发
function handleBeforeUnload() {
  // 只有是处于私人fm页面时离开页面才会重置音乐状态
  if (route.name == "/fm/privatefm") {
    musicStore.reset();
  }
}

// 获取私人FM
async function getPersonalFM() {
  loading.fm = true;
  await FMApi.getPersonalFM()
    .then(async (res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      fmData.value = fmInfo.value?.fmData.concat(data || []);
      // 设置当前播放fm音乐记录
      curRecord.value = fmData.value[curIndex.value];
      fmData.value.length && fmReload();
      console.log("获取私人FM成功==>", res.data);
      // 获取fm歌曲歌词
      await getFmLyric();
      // 获取fm歌曲评论
      getFmCommentList();
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取私人FM失败==>", err);
      ElMessage.error(err.message || "获取私人FM失败");
    })
    .finally(() => (loading.fm = false));
}

function fmReload() {
  // 普通模式音乐正在播放时就不打断播放，如果没有播放就直接开始播放
  if (musicStore.status) return;
  musicStore.reset();
  footStore.enterFmMode();
  formatIdsGetSongs(fmData.value);
}

/**
 * 将数组里面的全部id变为一个字符串，然后获取正确的音乐数据
 */
async function formatIdsGetSongs(arr: Array<any>) {
  const fmIds = arr.map((fm) => fm.id).join(",");
  await getSongDetailByIds(fmIds);
}

// 通过id获取歌曲详细信息
async function getSongDetailByIds(ids: string): Promise<any> {
  const res = await MusicApi.getSongDetailByIds(ids);
  const { code, songs } = res.data;
  if (code != 200) {
    return Promise.reject(res.data);
  }
  // musicStore.curPlayList = songs || [];
  musicStore.playList = songs || [];
  // 保存当前播放音乐信息
  curRecord.value = songs[curIndex.value];
  // 更新歌曲歌词、评论、还有music模块里面的东西
  handleRefresh("lyric");
  handleRefresh("comment");
  // 保存当前播放音乐到music模块store中
  musicStore.setCurMusicRecord(curRecord.value, curIndex.value, false);
  console.log("当前歌曲record==>", curRecord.value);
}

// 获取fm歌曲歌词
async function getFmLyric() {
  loading.lyric = true;
  const lrcList = await LyricModel.getLyric(curRecord.value?.id);
  loading.lyric = false;
  lyricData.value = lrcList;
  // 歌词开始监听音乐播放进行滚动
  footStore.isFmPlayMode() && LyricModel.createLyricLiElement();
  // console.log('格式化之后的歌词==>', lyricData.value);
}

// 获取fm歌曲评论
function getFmCommentList() {
  // 开始加载
  loading.comment = true;
  MusicApi.getMusicComment({
    id: curRecord.value?.id,
    limit: queryParams.limit,
    offset: queryParams.offset,
    // before: queryParams.before,
  })
    .then((res) => {
      const { code, total } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      // 总评论条数
      queryParams.total = total;
      // 置顶评论
      commentInfo.topComments = res.data.topComments || [];
      // 热门评论
      commentInfo.hotComments = res.data.hotComments || [];
      // 普通评论
      commentInfo.comments = res.data.comments || [];
      console.log("获取fm评论成功==>", res.data);
    })
    .catch((err) => {
      ElMessage.error(err.message || "获取fm评论失败");
      console.log("获取fm评论失败==>", err);
    })
    .finally(() => {
      // 结束加载
      loading.comment = false;
    });
}

// 将某首音乐从私人fm移入垃圾桶
const handleTrash = () => {
  FmModel.fmTrash(curRecord.value?.id).then(async (code) => {
    if (code == 200 && fmData.value.length) {
      // 切换下一首fm音乐
      // 是否需要进行下一首歌曲切换
      let needNext = true;
      if (curIndex.value >= fmData.value.length - 1) {
        const lastFmData = fmData.value;
        await getPersonalFM();
        // 数据没有变化，说明可能是请求失败了
        if (fmData.value.length == lastFmData.length) {
          needNext = false;
        }
      }
      // 可能出现请求错误时，不进行下一首歌的切换，当前歌曲记录、下标保持不变
      if (!needNext) return;
      fmData.value.splice(curIndex.value, 1);
      updateDataAndRefresh();
      // 这里获取到的dom是还未更新前的dom
      lastImgDom.value = document.querySelector(".cur-img") as HTMLElement;
      // 为上一首歌曲图片做点击事件，使其可以切换回上一首歌曲播放
      lastImgDom.value?.addEventListener("click", handlePrev);
    }
  });
};

/**
 * 下一首私人fm
 */
async function next() {
  // 是否需要进行下一首歌曲切换
  let needNext = true;
  if (curIndex.value >= fmData.value.length - 1) {
    const lastFmData = fmData.value;
    await getPersonalFM();
    // 数据没有变化，说明可能是请求失败了
    if (fmData.value.length == lastFmData.length) {
      needNext = false;
    }
  }
  // 可能出现请求错误时，不进行下一首歌的切换，当前歌曲记录、下标保持不变
  if (!needNext) return;

  curIndex.value++;
  updateDataAndRefresh();
  // 这里获取到的dom是还未更新前的dom
  lastImgDom.value = document.querySelector(".cur-img") as HTMLElement;
  // 为上一首歌曲图片做点击事件，使其可以切换回上一首歌曲播放
  lastImgDom.value?.addEventListener("click", handlePrev);
}

/**
 * 更新并刷新数据
 */
function updateDataAndRefresh() {
  curRecord.value = fmData.value[curIndex.value];
  formatIdsGetSongs(fmData.value);
  // 每次切换下一首歌曲时自动播放
  musicStore.setCurMusicRecord(curRecord.value);
}

// 下一首私人fm
const handleNext = () => {
  next();
};

// 上一首fm
const handlePrev = () => {
  // 下标减一
  curIndex.value--;
  updateDataAndRefresh();
};

// 喜欢某首音乐
const handleLikeMusic = () => {
  LikeMusicModel.likeMusic({
    id: curRecord.value?.id,
    like: !isMyLikeMusic.value,
  }).then((code) => {
    if (code != 200) return;
    fmData.value.forEach((fm) => {
      if (fm.id == curRecord.value?.id) {
        fm["like"] = !isMyLikeMusic.value;
      }
    });
  });
};

// 播放fm歌曲
const handlePlay = () => {
  !footStore.isFmPlayMode() && footStore.enterFmMode();
  musicStore.setCurMusicRecord(curRecord.value);
};

// 暂停播放fm音乐
const handlePause = () => {
  musicStore.pause();
};

// 分页事件触发回调
function handlePagination(val: any) {
  queryParams.offset = (val.page - 1) * val.limit;
  queryParams.before =
    commentInfo.comments[commentInfo.comments.length - 1].time;
}

// 刷新评论列表
function handleRefreshCommentList() {
  getFmCommentList();
}

// 根据 `key` 刷新指定数据
function handleRefresh(k: RefreshKey) {
  const key = {
    comment: getFmCommentList,
    lyric: getFmLyric,
  };
  key[k]();
}

defineOptions({
  name: "PrivateFM",
});
</script>

<template>
  <div class="fm">
    <div
      class="fm-info"
      v-loading="loading.fm"
      element-loading-text="加载私人FM音乐中...🐳"
    >
      <!-- 左侧专辑封面 -->
      <div class="poster">
        <div class="poster-img">
          <el-image
            lazy
            v-for="(fm, i) in fmInfo.fmData"
            :key="i"
            class="shadow rounded img"
            :class="{ 'cur-img': fmInfo.curIndex === i }"
            style="border: 2px solid rgba(190, 190, 190, 0.2)"
            :src="fm?.album?.picUrl || fm?.al?.picUrl + '?param=350y350'"
            fit="cover"
          />

          <!-- 播放暂停按钮操作 -->
          <div
            v-loading="playBtnLoading"
            element-loading-background="rgba(255,255,255,0)"
            class="play-fm cursor-pointer"
            :class="{ play: !fmPlayStatus }"
            @click="handlePlay"
          >
            <!-- 点击播放歌曲 -->
            <svg-icon
              style="font-size: 25px"
              icon-class="play"
              color="rgb(236,65,65)"
            />
          </div>

          <div
            v-loading="playBtnLoading"
            element-loading-background="rgba(255,255,255,0)"
            class="play-fm cursor-pointer"
            :class="{ pause: fmPlayStatus }"
            @click="handlePause"
          >
            <!-- 已经开始播放 -->
            <svg-icon
              style="font-size: 25px"
              icon-class="pause"
              color="rgb(236,65,65)"
            />
          </div>
        </div>

        <div class="btn-action">
          <!-- 喜欢该歌曲 -->
          <div class="like-music">
            <el-button
              :style="{ color: isMyLikeMusic ? 'red' : '' }"
              circle
              plain
              size="large"
              @click="handleLikeMusic"
            >
              <svg-icon size="30px" icon-class="unlike-music" />
            </el-button>
          </div>
          <!-- 将该歌曲丢入垃圾桶 -->
          <div class="trash-can">
            <el-button circle plain size="large" @click="handleTrash">
              <el-icon size="20">
                <DeleteFilled />
              </el-icon>
            </el-button>
          </div>
          <!-- 下一首 -->
          <div class="next">
            <el-button circle plain size="large" @click="handleNext">
              <svg-icon size="35px" icon-class="next" />
            </el-button>
          </div>

          <!-- 更多操作 -->
          <div class="more-action">
            <el-button circle plain size="large">
              <el-icon size="20">
                <MoreFilled />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧歌词 -->
      <div class="song-lyric">
        <div class="right-lyric">
          <div class="music-info">
            <div class="music-name truncate">{{ curRecord?.name }}</div>
            <div class="music-desc flex items-center">
              <div
                class="mr-[15px] cursor-pointer truncate"
                :class="{ 'w-50%': album?.name.length > 20 }"
              >
                专辑：<span
                  :title="album?.name"
                  class="text-#409eff"
                  @click="
                    onTargetPage('/album/album-detail', { albumId: album?.id })
                  "
                  >{{ album?.name }}</span
                >
              </div>

              <div v-if="artists?.length" class="truncate w-50%">
                歌手：
                <span
                  @click="TTUL('歌手页暂时还没有完成🍤')"
                  :title="alia.name"
                  v-for="alia in artists"
                  class="singer-name cursor-pointer truncate text-#409eff"
                  style="max-width: 30%"
                  :key="alia.id"
                  >{{ alia.name }}</span
                >
              </div>
              <div v-else>未知歌手</div>
            </div>
          </div>

          <div class="lyric-container">
            <ul
              v-loading="loading.lyric"
              v-show="lyricData.length"
              class="lyric-content"
              element-loading-text="歌词加载中..."
            >
              <template v-for="item in lyricData">
                <li class="lyric-item" v-if="item.words">
                  <span>{{ item.words }}</span>
                  <!-- <span v-else>暂无歌词</span> -->
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="fm-commit" v-if="fmData.length">
      <!-- fm评论（fm也是属于歌曲） -->
      <FmComment
        :id="curRecord!.id.toString()"
        type="song"
        :loading="loading.comment"
        :commen-count="queryParams.total"
        :query-params="queryParams"
        :comment-info="commentInfo"
        @refresh="handleRefreshCommentList"
        @pagination="handlePagination"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}

$minH: 480px;
$height: $footerHeight + $logoAndNavHeight + $tagsViewHeight + 24px;

$imgWidth: 350px;

.fm-info {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - $height);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  .poster {
    min-width: $minH;
    @include flex-center;
    flex-direction: column;
    justify-content: center;

    .poster-img {
      width: $imgWidth;
      height: $imgWidth;
      @include flex-center;
      // overflow: hidden;
      position: relative;

      .play-fm {
        position: absolute;
        bottom: 50%;
        right: 50%;
        transform: translate(50%, 50%);
        z-index: -1;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s linear;
        opacity: 0;
      }

      .play {
        opacity: 1;
        z-index: 2;
      }

      .pause {
        opacity: 1;
        z-index: 2;
        bottom: 10px !important;
        right: 10px !important;
        transform: none;
      }

      .img {
        min-width: $imgWidth;
        height: 100%;
        transition: all 0.3s linear;
        position: absolute;
        top: 0;
        right: 0px;
        transform: translateX($imgWidth);
        z-index: -1;
        opacity: 0;
      }

      .cur-img {
        z-index: 1 !important;
        transform: translateX(0) !important;
        opacity: 1;
      }

      // 选中当前图片的上一个元素，实现效果的关键代码
      .img:has(~ .cur-img) {
        transform: translateX(-80px) !important;
        opacity: 1;
        scale: 0.8 !important;
        cursor: pointer;
        z-index: 1;
      }
    }

    .btn-action {
      width: $imgWidth;
      height: 70px;
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);

      .like-music,
      .trash-can,
      .next,
      .more-action {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .song-lyric {
    min-width: $minH;
  }
}

.fm-commit {
}
</style>
