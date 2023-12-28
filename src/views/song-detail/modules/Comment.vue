<script setup lang="ts">
import * as SongListApi from "@/api/songList";
import SongDetailComment from "@/components/Comment/index.vue";

const props = defineProps({
  // 歌单id
  songId: {
    type: String,
    default: "",
  },
  playlist: {
    type: Object,
    default: () => {},
  },
});

// 加载
const loading = ref<boolean>(false);
// 获取歌单评论请求参数
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

// 获取歌单评论
function getSongListComment() {
  // 开始加载
  loading.value = true;
  SongListApi.getSongListComment({
    id: props.songId,
    limit: queryParams.limit,
    offset: queryParams.offset,
    before: queryParams.before,
  })
    .then((res) => {
      const { code, total } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取歌单评论失败"));
      }
      // 总评论条数
      queryParams.total = total;
      // 置顶评论
      commentInfo.topComments = res.data.topComments || [];
      // 热门评论
      commentInfo.hotComments = res.data.hotComments || [];
      // 普通评论
      commentInfo.comments = res.data.comments || [];

      console.log("获取歌单评论成功==>", res.data);
    })
    .catch((err) => {
      ElMessage.error(err || err.message || "获取歌单评论失败");
      console.log("获取歌单评论失败==>", err);
    })
    .finally(() => {
      // 结束加载
      loading.value = false;
    });
}

// 分页事件触发回调
function handlePagination(val: any) {
  queryParams.offset = (val.page - 1) * val.limit;
  queryParams.before =
    commentInfo.comments[commentInfo.comments.length - 1].time;
}

// 刷新评论列表
function handleRefreshCommentList() {
  // 重新获取歌单评论列表
  getSongListComment();
}

onMounted(() => {
  getSongListComment();
});

defineOptions({
  name: "SongDetailComment",
});
</script>

<template>
  <div class="song-detail-comment">
    <!-- 歌单评论 -->
    <SongDetailComment
      :id="songId"
      type="songList"
      :loading="loading"
      :commen-count="playlist?.commentCount"
      :query-params="queryParams"
      :comment-info="commentInfo"
      @refresh="handleRefreshCommentList"
      @pagination="handlePagination"
    />
  </div>
</template>
