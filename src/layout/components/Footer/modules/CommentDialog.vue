<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useMusicStore } from "@/store/modules/music";
import * as MusicApi from "@/api/music";
import { SendCommentEnum, SendType } from "@/enums/SendORDeleteCommentEnum";
import { SendOrDeleteCommentParams } from "@/api/songList/type";

const musicStore = useMusicStore();
const { curMusicRecord } = storeToRefs(musicStore);
// 评论弹窗是否显示
const visible = ref(false);
// 评论内容
const content = ref("");
// 回复评论id
const replyCommentId = ref<string | number>("");
// 评论输入框ref
const CommentContentInputRef = ref<any>(null);

const emit = defineEmits(["handFinish"]);

function show(show: boolean) {
  visible.value = show;
}

/**
 * 回复评论
 */
const replyComment = (item: any) => {
  visible.value = true;
  // 回复评论的用户名称
  content.value = `回复 ${item.user.nickname} : `;
  // 保存回复的评论id
  replyCommentId.value = item.commentId;
};

// 发送评论，回复评论时commentId必填
const handleCommentContentChange = (value: string | number) => {
  const content = value.toString();

  // 开始加载
  const loadingInstance = ElLoading.service({ fullscreen: true });
  let params = {} as SendOrDeleteCommentParams;
  const isCommentId = !!replyCommentId.value;
  if (isCommentId) {
    const startIndex = content.indexOf(":") + 1;
    // 回复别人评论内容，去除掉 回复xxx用户
    const replyContent = content.slice(startIndex).trimStart();
    params = Object.assign(
      {
        content: replyContent,
        id: curMusicRecord.value.id,
        t: SendCommentEnum.reply,
        type: SendType.song,
      },
      { commentId: replyCommentId.value }
    );
  } else {
    params = {
      content,
      id: curMusicRecord.value.id,
      t: SendCommentEnum.send,
      type: SendType.song,
    };
  }

  console.log("params==>", params);

  // 仅发送歌曲评论
  MusicApi.sendOrDeleteComment(params)
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data.message || "发送评论失败");
      }
      console.log("发送评论成功==>", res.data);
      // 清除内容
      closedDialog();
      // 关闭对话框
      visible.value = false;
      // 刷新评论列表
      emit("handFinish");
    })
    .catch((err) => {
      console.log("发送评论失败==>", err);
      ElMessage.error(err || err.message || "发送评论失败");
    })
    .finally(() => {
      nextTick(() => {
        // Loading should be closed asynchronously
        loadingInstance.close();
      });
    });
};

const handleClose = (done: () => void) => {
  done();
};

// 打开对话框时触发
function openedDialog() {
  // 评论输入框获取焦点
  replyCommentId.value && CommentContentInputRef.value.focus();
}

// 关闭对话框时触发
function closedDialog() {
  replyCommentId.value = "";
  content.value = "";
}

defineExpose({
  show,
  replyComment,
});

defineOptions({
  name: "CommentDialog",
});
</script>

<template>
  <div class="comment-dialog">
    <!-- :modal="false" -->
    <el-dialog
      center
      v-model="visible"
      :title="`歌曲：${curMusicRecord.name}`"
      width="600"
      draggable
      lock-scroll
      class="comment"
      :close-on-click-modal="false"
      :before-close="handleClose"
      @opened="openedDialog"
      @closed="closedDialog"
    >
      <el-input
        ref="CommentContentInputRef"
        v-model="content"
        maxlength="140"
        placeholder="快来说点什么吧"
        show-word-limit
        type="textarea"
        :autosize="{ minRows: 6, maxRows: 10 }"
      />

      <template #footer>
        <el-button
          style="width: 45%"
          type="primary"
          @click="handleCommentContentChange(content)"
          >Send Content</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.comment) {
  .el-dialog__body {
    padding: 40px calc(var(--el-dialog-padding-primary) + 20px) 30px;
  }
}
</style>
