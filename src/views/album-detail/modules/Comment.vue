<script setup lang="ts">
import * as AlbumApi from "@/api/album";
import AlbumComment from "@/components/Comment/index.vue";

const props = defineProps({
  // 专辑id
  albumId: {
    type: String,
    default: "",
  },
  album: {
    type: Object,
    default: () => {},
  },
});

// 加载
const loading = ref<boolean>(false);
// 获取专辑评论请求参数
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

onMounted(() => {
  getAlbumCommentList();
});

// 获取专辑评论
function getAlbumCommentList() {
  // 开始加载
  loading.value = true;
  AlbumApi.getAlbumComment({
    id: props.albumId,
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

      console.log("获取专辑评论成功==>", res.data);
    })
    .catch((err) => {
      ElMessage.error(err.message || "获取专辑评论失败");
      console.log("获取专辑评论失败==>", err);
    })
    .finally(() => {
      // 结束加载
      loading.value = false;
    });
}

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  queryParams.before =
    commentInfo.comments[commentInfo.comments.length - 1].time;
};

// 刷新评论列表
function handleRefreshCommentList() {
  // 重新获取专辑评论列表
  getAlbumCommentList();
}

defineOptions({
  name: "AlbumComment",
});
</script>

<template>
  <div class="album-comment">
    <!-- 专辑评论 -->
    <AlbumComment
      :id="albumId"
      type="album"
      :loading="loading"
      :commen-count="queryParams.total"
      :query-params="queryParams"
      :comment-info="commentInfo"
      @refresh="handleRefreshCommentList"
      @pagination="handlePagination"
    />
  </div>
</template>
