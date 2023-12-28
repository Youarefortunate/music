<script setup lang="ts">
import { toRefs } from "vue";
import { useRoute } from "vue-router";
import * as MVApi from "@/api/mv";
import * as MVEnum from "@/enums/MVEnum";
import type { MVDetailInfo } from "@/api/mv/type";
import { useNumberFormat } from "@/utils";
import {
  FolderAdd,
  Download,
  Link,
  CaretBottom,
  FolderChecked,
} from "@element-plus/icons-vue";
import MVComment from "@/components/Comment/index.vue";
import { useDebounceFn } from "@vueuse/core";
import * as ResourceApi from "@/api/resource";
import * as ResourceEnum from "@/enums/ResourceEnum";
import { SubscribeType } from "@/enums/SubscribeEnum";
import { message } from "@/utils/message";

const route = useRoute();
const loading = reactive({
  desc: false,
  comment: false,
});
// mv的id
const mvid = ref("");
const VideoRef = ref();
// 是否显示画中画视频
const showPipVideo = ref(false);
// 请求参数
const queryParams = reactive({
  r: MVEnum.MVResolutionRatioEnum.super,
  // mv可播放url
  url: "",
  // mv详情
  mvInfo: {} as any,
  // mv 点赞转发评论数数据
  mvDetailInfo: {
    commentCount: 0,
    liked: false,
    likedCount: 0,
    shareCount: 0,
  } as MVDetailInfo,

  // 获取mv评论请求参数
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

const { mvInfo, mvDetailInfo } = toRefs(queryParams);
const info = ref<any>({});

// 是否展开
const spread = ref(false);

watch(
  () => route.query,
  (newVal) => {
    if (newVal.mvid != undefined) {
      mvid.value = newVal.mvid as string;
      // 通过mvid获取mv详情
      getMVDetailById();
      // 获取mv可播放url地址
      getMPlayVUrl();
      getMvCommentList();
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("scroll", () => {
    handleScroll();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleScroll = useDebounceFn(
  () => {
    const html = document.documentElement;
    const container = document.querySelector(".video-container") as HTMLElement;
    // 视频标签超出可视区域，进入画中画模式
    if (html.scrollTop >= container?.clientHeight) {
      // 无法自动开启画中画模式，需要用户手动开启
      // (VideoRef.value as HTMLVideoElement)!.requestPictureInPicture();
      //showPipVideo.value = true;
    } else {
      // 退出画中画模式
      // document.exitPictureInPicture();
      //showPipVideo.value = false;
    }
  },
  300,
  { maxWait: 500 }
);

// 通过mvid获取mv详情
function getMVDetailById() {
  loading.desc = true;
  MVApi.getMVDetail(Number(mvid.value))
    .then(async (res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      queryParams.mvInfo = res.data;
      await getMVDetailInfo();
      console.log("通过mvid获取mv详情成功==>", queryParams.mvInfo);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("通过mvid获取mv详情失败==>", err);
      ElMessage.error(err.message || "通过mvid获取mv详情失败");
    });
}

// 获取 mv 点赞转发评论数数据
async function getMVDetailInfo() {
  MVApi.getMVDetailInfo(Number(mvid.value))
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return ElMessage.error("获取 mv 点赞转发评论数数据失败");
      }
      queryParams.mvDetailInfo = res.data;
      Object.assign(
        info.value,
        queryParams.mvDetailInfo,
        queryParams.mvInfo?.data
      );
      console.log(
        "获取 mv 点赞转发评论数数据成功==>",
        queryParams.mvDetailInfo
      );
    })
    .finally(() => (loading.desc = false));
}

// 通过mvid获取mv播放地址url
function getMPlayVUrl() {
  MVApi.getMVUrl({
    id: Number(mvid.value),
    r: queryParams.r,
  }).then((res) => {
    const { code, data } = res.data;
    if (code != 200) {
      return ElMessage.error("通过mvid获取mv播放地址url失败");
    }
    queryParams.url = data.url;
    console.log("通过mvid获取mv播放地址url成功==>", data);
  });
}

// 获取mv评论
function getMvCommentList() {
  // 开始加载
  loading.comment = true;
  MVApi.getMVComment({
    id: mvid.value,
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

      console.log("获取mv评论成功==>", res.data);
    })
    .catch((err) => {
      ElMessage.error(err.message || "获取mv评论失败");
      console.log("获取mv评论失败==>", err);
    })
    .finally(() => {
      // 结束加载
      loading.comment = false;
    });
}

// 收藏mv
function handleMvSub() {
  const info = queryParams.mvInfo;
  // 取消收藏
  if (info?.subed) {
    ElMessageBox.confirm("你确定不再收藏该MV吗?", "Warning", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      // 取消收藏(已经收藏了取消收藏)
      subscribeSong(SubscribeType.UnSubscribe);
    });
  } else {
    // 加入收藏(还没有收藏加入收藏)
    subscribeSong(SubscribeType.Subscribe);
  }
}

// 收藏/取消收藏mv
function subscribeSong(t: SubscribeType) {
  MVApi.subscribedMV({
    mvid: mvid.value,
    t,
  })
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(
          res.data.message || t === SubscribeType.Subscribe
            ? "收藏失败"
            : "取消收藏失败"
        );
      }
      // 更改收藏状态
      queryParams.mvInfo.subed = t === SubscribeType.Subscribe;
      if (t === SubscribeType.Subscribe) {
        message("收藏成功，可前往网易云: 我的收藏-视频", { type: "success" });
      } else {
        ElMessage.success("取消收藏成功");
      }
    })
    .catch((err) => {
      ElMessage.error(
        err || err.message || t === SubscribeType.Subscribe
          ? "取消收藏失败"
          : "收藏失败"
      );
      // 更改收藏状态
      queryParams.mvInfo.subed = false;
    });
}

// 分页事件触发回调
function handlePagination(val: any) {
  queryParams.offset = (val.page - 1) * val.limit;
  queryParams.before =
    commentInfo.comments[commentInfo.comments.length - 1].time;
}

// 点赞/取消点赞mv
const handleMvLike = () => {
  console.log("给mv点赞/取消点赞==>", queryParams.mvDetailInfo);
  const record = queryParams.mvDetailInfo;
  ResourceApi.LikeTheResource({
    id: mvid.value,
    t: record?.liked
      ? ResourceEnum.LikeTheResourceEnum.unlike
      : ResourceEnum.LikeTheResourceEnum.like,
    type: ResourceEnum.ResourceTypeEnum.mv,
  })
    .then((res) => {
      const { code, message } = res.data;
      if (code != 200) {
        return Promise.reject(
          message || record?.liked ? "取消点赞失败" : "点赞失败"
        );
      }
      queryParams.mvDetailInfo.liked = !record.liked;
      queryParams.mvDetailInfo.likedCount = record.liked
        ? queryParams.mvDetailInfo.likedCount + 1
        : queryParams.mvDetailInfo.likedCount - 1;
      console.log("点赞/取消点赞成功==>", res.data);
    })
    .catch((err) => {
      console.log("点赞/取消点赞失败失败==>", err);
      ElMessage.error(
        err || err.message || record?.liked ? "取消点赞失败" : "点赞失败"
      );
    });
};

// 刷新评论列表
function handleRefreshCommentList() {
  getMvCommentList();
}

defineOptions({
  name: "MVDetail",
});
</script>

<template>
  <div class="mv-detail">
    <div class="mv-desc" v-loading="loading.desc">
      <div class="video-container">
        <video
          ref="VideoRef"
          class="video"
          :src="queryParams.url"
          controls
        ></video>

        <!-- 画中画视频 -->
        <video
          v-show="showPipVideo"
          ref="VideoRef"
          class="pip-video"
          :src="queryParams.url"
          controls
        ></video>
      </div>

      <div class="content">
        <!-- mv创作者 -->
        <div class="mv-creator">
          <el-image
            lazy
            class="w-70px h-70px shadow cursor-pointer rounded-50%"
            style="border: 2px solid rgba(190, 190, 190, 0.2)"
            :src="mvInfo.data?.artists[0]?.img1v1Url + '?param=100y100'"
            fit="cover"
          />

          <span class="artist-name text-15px ml-10px">
            <span
              v-for="artist in mvInfo.data?.artists"
              class="singer-name hover:text-#C2C2C2 cursor-pointer"
              @click="TTUL('歌手页暂未完成')"
              >{{ artist.name ?? "未知歌手" }}</span
            ></span
          >
        </div>
        <!-- mv名称 -->
        <h2
          class="mv-name cursor-pointer mb-10px"
          @click="() => (spread = !spread)"
        >
          <span>{{ mvInfo.data?.name || "未知MV" }}</span>
          <el-icon
            class="spread"
            :class="{ 'is-spread': spread }"
            title="展开/收起"
            ><CaretBottom
          /></el-icon>
        </h2>

        <!-- mv视频描述 -->
        <div
          class="desc mb-20px"
          :class="{
            'twoline-hide': !spread,
          }"
        >
          <div
            :class="{
              'indent-25px': mvInfo.data?.desc?.length,
            }"
          >
            {{ mvInfo.data?.desc || "该MV暂无描述" }}
          </div>
        </div>

        <!-- mv发布时间、播放量 -->
        <div class="mv-create-time mb-20px">
          <span class="mr-20px"
            >发布：{{ mvInfo.data?.publishTime || "暂无发布时间" }}</span
          >
          <span
            >播放：{{
              useNumberFormat(mvInfo.data?.playCount) || "暂无播放次数"
            }}</span
          >
        </div>

        <!-- 按钮操作 -->
        <div class="action mb-40px">
          <!-- 点赞 -->
          <el-button round plain @click="handleMvLike">
            <span v-if="!queryParams.mvDetailInfo.liked"
              >点赞({{ useNumberFormat(mvDetailInfo.likedCount) }})</span
            >

            <span v-else
              >已点赞({{ useNumberFormat(mvDetailInfo.likedCount) }})</span
            >

            <template #icon>
              <svg-icon
                v-if="!queryParams.mvDetailInfo.liked"
                class="like"
                icon-class="dianzan"
              ></svg-icon>

              <svg-icon
                v-else
                class="like"
                color="#FF3A3A"
                icon-class="yidianzan"
              ></svg-icon>
            </template>
          </el-button>

          <!-- 收藏mv -->
          <el-button round plain @click="handleMvSub">
            <span v-if="!queryParams.mvInfo?.subed"
              >收藏({{ useNumberFormat(mvInfo.data?.subCount) || 0 }})</span
            >
            <span v-else
              >已收藏({{ useNumberFormat(mvInfo.data?.subCount) || 0 }})</span
            >
            <template #icon>
              <!-- 未收藏 -->
              <el-icon v-if="!queryParams.mvInfo?.subed" size="17"
                ><FolderAdd
              /></el-icon>
              <!-- 已收藏 -->
              <el-icon v-else size="17"><FolderChecked /></el-icon>
            </template>
          </el-button>

          <el-button
            round
            plain
            @click="TTUL('分享功能暂未实现，敬请期待🍑...')"
          >
            <span>分享({{ useNumberFormat(mvDetailInfo.shareCount) }})</span>
            <template #icon>
              <el-icon size="17"><Link /></el-icon>
            </template>
          </el-button>

          <el-button
            round
            plain
            @click="TTUL('下载功能暂未实现，敬请期待🍅...')"
          >
            <span>下载MV</span>
            <template #icon>
              <el-icon size="17"><Download /></el-icon>
            </template>
          </el-button>
        </div>

        <h3>MV评论</h3>
      </div>
    </div>

    <!-- mv评论 -->
    <!-- <MVComment ref="MVCommentRef" :mv-id="mvid" :mv-info="info" /> -->

    <MVComment
      :id="mvid"
      type="mv"
      :loading="loading.comment"
      comment-class="comment-mv"
      :commen-count="mvDetailInfo.commentCount"
      :query-params="queryParams"
      :comment-info="commentInfo"
      @refresh="handleRefreshCommentList"
      @pagination="handlePagination"
    />
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}
// 画中画视频
.pip-video {
  position: fixed;
  bottom: 30px;
  right: 10px;
  width: 350px;
  height: 200px;
  // z-index比底部播放器组件要高一层级
  z-index: 3002;
}
.comment-mv {
  width: 70%;
  margin: 0 auto;
  min-width: 850px;
}
.mv-detail {
  width: 100%;
  height: 100%;
}

.mv-desc {
  width: 70%;
  margin: 0 auto;
  min-width: 850px;
}
.video-container {
  width: 100%;
  height: 500px;
  @include flex-center;
  justify-content: center;
  background-color: #000;
  margin-bottom: 20px;
  .video {
    width: 90%;
    height: 380px;
    min-height: 380px;
    min-height: 400px;
  }
}
.content {
  width: 100%;
  height: 100%;
  .mv-creator {
    @include flex-center;
  }
  .mv-create-time {
    @include flex-center;
    color: #cccccc;
    font-size: 13px;
  }
  .mv-name {
    @include flex-center;
    .spread {
      transition: all 0.3s linear;
    }
  }
  .action {
    .like {
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .desc {
    font-size: 13px;
    color: #d0d0d0;
  }
}

:deep(.action) {
  .el-button {
    padding: 0 28px;
  }
}

.is-spread {
  transform: rotate(180deg);
}
</style>
