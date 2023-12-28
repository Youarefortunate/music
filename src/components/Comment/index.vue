<script setup lang="ts">
import { getCurrentInstance, ComponentInternalInstance } from "vue";
import { useUserStore } from "@/store/modules/user";
import { ElLoading } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import { SendOrDeleteCommentParams } from "@/api/comment/type";
import * as CommentApi from "@/api/comment";
import Emoji from "@/components/Emoji/index.vue";
import { formatDate } from "@/utils";
import { scrollTo } from "@/utils/scroll-to";
import {
  SendCommentEnum,
  SendType,
  DeleteCommentEnum,
  DeleteType,
} from "@/enums/SendORDeleteCommentEnum";
import * as CommentEnum from "@/enums/CommentEnum";
import { TTUL, onTargetPage } from "@/utils/globalMethods";

type TypeKey =
  | "song"
  | "mv"
  | "songList"
  | "album"
  | "radioShow"
  | "video"
  | "dynamic"
  | "djprogram";

type CommentInfoType = {
  topComments: Array<any>;
  hotComments: Array<any>;
  comments: Array<any>;
};

type QueryParamsType = {
  total: number;
  limit: number;
  offset: number;
  pageNum: number;
  before?: number;
  [key: string]: any;
};

// 评论资源，歌曲、mv、专辑、歌单、电台等等
const t = reactive({
  song: CommentEnum.CommentTypeEnum.song,
  mv: CommentEnum.CommentTypeEnum.mv,
  songList: CommentEnum.CommentTypeEnum.songList,
  album: CommentEnum.CommentTypeEnum.album,
  radioShow: CommentEnum.CommentTypeEnum.radioShow,
  video: CommentEnum.CommentTypeEnum.video,
  dynamic: CommentEnum.CommentTypeEnum.dynamic,
  djprogram: CommentEnum.CommentTypeEnum.djprogram,
});

// 发送评论的类型资源，数字，资源类型，对应歌曲、mv、专辑、歌单、电台等等
const st = reactive({
  song: SendType.song,
  mv: SendType.mv,
  songList: SendType.songList,
  album: SendType.album,
  video: SendType.video,
  dynamic: SendType.dynamic,
  djprogram: SendType.djprogram,
});

// 删除评论的类型资源，数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型
const dt = reactive({
  song: DeleteType.song,
  mv: DeleteType.mv,
  songList: DeleteType.songList,
  album: DeleteType.album,
  video: DeleteType.video,
  dynamic: DeleteType.dynamic,
  djprogram: DeleteType.djprogram,
  radioShow: DeleteType.radioShow,
});

const props = defineProps({
  // 歌单、、等等的id
  id: {
    type: String || Number,
    default: "",
    required: true,
  },
  // 加载
  loading: {
    type: Boolean,
    default: false,
  },
  // 该评论组件属于什么类型，例如是歌单评论、mv评论、视频评论等等
  type: {
    type: String as PropType<TypeKey>,
    default: "songList",
  },
  // 评论条数
  commenCount: {
    type: Number,
    default: 0,
  },
  // 评论数据信息
  commentInfo: {
    required: true,
    type: Object as PropType<CommentInfoType>,
    default: () => {
      return {
        // 置顶评论
        topComments: [],
        // 热门评论
        hotComments: [],
        // 普通评论
        comments: [],
      };
    },
  },
  // 请求参数
  queryParams: {
    required: true,
    type: Object as PropType<QueryParamsType>,
    default: () => {
      return {
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
      };
    },
  },
  // 评论列表整体容器类名
  commentClass: {
    type: String,
    default: "",
  },
  // 是否显示回复评论输入框
  showEditCommentInp: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: "refresh"): void;
  (e: "pagination", val: any): void;
}>();

// 评论类型
const commentType = ref<CommentEnum.CommentTypeEnum>(
  CommentEnum.CommentTypeEnum.songList
);
// 发送评论的类型资源，数字，资源类型，对应歌曲、mv、专辑、歌单、电台等等
const sendT = ref<SendType>(SendType.songList);
const deleteT = ref<DeleteType>(DeleteType.songList);

watch(
  () => props.type,
  (newType) => {
    if (newType) {
      commentType.value = t[newType as keyof typeof t];
      sendT.value = st[newType as keyof typeof st];
      deleteT.value = dt[newType as keyof typeof dt];
    }
  },
  { immediate: true }
);

// 用户模块
const userStore = useUserStore();
// 评论标题
const titleTip = reactive({
  topComments: "置顶评论",
  hotComments: "精彩评论",
  comments: `最新评论(${props.commenCount})`,
});

watch(
  () => props.commenCount,
  (count) => {
    titleTip.comments = `最新评论(${count})`;
  },
  { immediate: true }
);

// 评论内容
const commentContent = ref("");
// 表情包组件ref
const EmojiRef = ref<any>(null);
// 评论输入框ref
const EditCommentContentInputRef = ref<any>(null);
// 右击删除评论项数据
const deleteCommentItem = ref<any>(null);
// 回复评论id
const replyCommentId = ref<string | number>("");
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const left = ref(0);
const top = ref(0);
// 鼠标右键菜单显示状态
const deleteMenuVisible = ref(false);
watch(deleteMenuVisible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeDeleteMenu);
  } else {
    document.body.removeEventListener("click", closeDeleteMenu);
  }
});

onMounted(() => {});

// 给评论点赞/取消点赞
const handleLikeSongListComment = (item: any, key: string) => {
  console.log("给评论点赞/取消点赞==>", item);
  CommentApi.LikeTheComments({
    id: props.id,
    cid: item.commentId,
    t: item.liked
      ? CommentEnum.LikeTheCommentEnum.unlike
      : CommentEnum.LikeTheCommentEnum.like,
    type: commentType.value,
  })
    .then((res) => {
      const { code, message } = res.data;
      if (code != 200) {
        return Promise.reject(
          message || item.liked ? "取消点赞失败" : "点赞失败"
        );
      }
      const commentKey = key as keyof typeof props.commentInfo;
      props.commentInfo[commentKey].forEach((comment: any) => {
        if (comment.commentId == item.commentId) {
          comment.liked = !item.liked;
          comment.likedCount = item.liked
            ? comment.likedCount + 1
            : comment.likedCount - 1;
        }
      });
      console.log("点赞/取消点赞成功==>", res.data);
    })
    .catch((err) => {
      console.log("点赞/取消点赞失败失败==>", err);
      ElMessage.error(
        err || err.message || item.liked ? "取消点赞失败" : "点赞失败"
      );
    });
};

// 发送评论，回复评论时commentId必填
const handleCommentContentChange = (value: string | number) => {
  const content = value.toString();
  console.log(content.substring(content.indexOf("@")));
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
        id: props.id,
        t: SendCommentEnum.reply,
        type: sendT.value,
      },
      { commentId: replyCommentId.value }
    );
  } else {
    params = {
      content,
      id: props.id,
      t: SendCommentEnum.send,
      type: sendT.value,
    };
  }
  // // 仅发送评论
  CommentApi.sendOrDeleteComment(params)
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      console.log("发送评论成功==>", res.data);
      // 刷新评论列表
      handRefresh(true);
    })
    .catch((err) => {
      console.log("发送评论失败==>", err);
      ElMessage.error(err.message || "发送评论失败");
    })
    .finally(() => {
      nextTick(() => {
        // Loading should be closed asynchronously
        loadingInstance.close();
      });
    });
};

// 回复评论
const handleReply = (item: any) => {
  // 点击回复评论，返回顶部
  scrollTo(0, 800);
  // 评论输入框获取焦点
  EditCommentContentInputRef.value.focus();
  // 回复评论的用户名称
  commentContent.value = `回复 ${item.user.nickname} : `;
  // 保存回复的评论id
  replyCommentId.value = item.commentId;
};

// 鼠标右键删除评论，只能删除属于自己的评论
const handleOpenDeleteMenu = (item: any, e: MouseEvent) => {
  const curUserId = userStore.profile.userId;
  if (item.user.userId != curUserId) return;
  // 弹出删除评论弹窗
  openDeleteCommentMenu(e);
  deleteCommentItem.value = item;
};

// 删除自己的评论
const handleDeleteComment = () => {
  // // 开始加载
  const loadingInstance = ElLoading.service({ fullscreen: true });
  CommentApi.sendOrDeleteComment({
    // id
    id: props.id,
    // 删除评论
    t: DeleteCommentEnum.delete,
    //
    commentId: deleteCommentItem.value.commentId,
    type: deleteT.value,
  })
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      // 刷新评论列表
      handRefresh();
      console.log("删除评论成功==>", res.data);
    })
    .catch((err) => {
      console.log("删除评论失败==>", err);
      ElMessage.error(err.message || "删除评论失败");
    })
    .finally(() => {
      nextTick(() => {
        // Loading should be closed asynchronously
        loadingInstance.close();
      });
    });
};

// 显示表情包
const handleSelectEmoji = () => {
  // // 计算emoji所处的坐标
  const smilingFaceDom = document.querySelector(".action-icon #xiaolian");
  EmojiRef.value?.show(true);
  // 设置表情包组件显示位置
  EmojiRef.value?.setPosition(smilingFaceDom!);
};

// 分页事件触发回调
const handlePagination = (val: any) => {
  emit("pagination", val);
  // 重新获取数据
  handRefresh(false);
};

// 选择emoji表情包回调
function chooseEmojiDefault(emoji: string) {
  commentContent.value += emoji;
}

// 艾特别人
const handleAITEPeople = () => {
  if (commentContent.value.indexOf("@") == -1) {
    commentContent.value += "@";
  }
  // 输入框获取焦点
  EditCommentContentInputRef.value?.focus();
};

// 右键显示删除评论菜单
function openDeleteCommentMenu(e: MouseEvent) {
  // 弹窗的最小宽度
  const menuMinWidth = 120;
  // 鼠标右键评论项距离视口左侧的距离
  const offsetLeft = proxy?.$el.getBoundingClientRect().left;
  // 鼠标右键评论项的宽度width
  const offsetWidth = proxy?.$el.offsetWidth;
  const maxLeft = offsetWidth - menuMinWidth;
  const l = e.clientX - offsetLeft + 30;

  if (l > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = l;
  }

  top.value = e.pageY + 5;
  // 显示弹窗
  deleteMenuVisible.value = true;
}

// 刷新
function handRefresh(commentIsClear: boolean = false) {
  emit("refresh");
  // 将输入框内容清空
  commentIsClear && EditCommentContentInputRef.value.clear();
}

/**
 * 关闭右键删除评论弹窗
 */
function closeDeleteMenu() {
  deleteMenuVisible.value = false;
}

defineOptions({
  name: "Comment",
});
</script>

<template>
  <div class="comment" :class="commentClass" v-loading="loading">
    <div v-if="showEditCommentInp" class="edit-comment">
      <el-input
        ref="EditCommentContentInputRef"
        v-model="commentContent"
        maxlength="140"
        placeholder="请输入你想要评论的内容"
        :autosize="{ minRows: 4, maxRows: 6 }"
        show-word-limit
        type="textarea"
      />

      <div class="action mt-[10px] flex items-center justify-between">
        <div class="action-icon">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="@别人时输入对方名字，轻敲空格完成@操作"
            placement="top"
          >
            <!-- @符号 -->
            <svg-icon
              icon-class="aite"
              size="20px"
              class="cursor-pointer aite mr-[5px]"
              @click="handleAITEPeople"
            />
          </el-tooltip>

          <!-- 选择表情包svg -->
          <svg-icon
            id="xiaolian"
            icon-class="xiaolian"
            size="20px"
            class="cursor-pointer"
            @click.stop="handleSelectEmoji"
          />
        </div>
        <el-button round @click="handleCommentContentChange(commentContent)"
          >评 论</el-button
        >
      </div>
    </div>

    <div v-for="(value, key) in commentInfo">
      <div v-if="value.length">
        <!-- 评论标题：置顶评论、热门评论、最新评论标题 -->
        <div class="font-bold text-[20px] mb-[15px]">
          {{ titleTip[key] }}
        </div>

        <div
          v-for="item in value"
          :key="item.commentId"
          class="comment-item flex items-center mb-[20px]"
          @contextmenu.prevent="handleOpenDeleteMenu(item, $event)"
        >
          <!-- 用户头像 -->
          <div class="relative mr-[15px]">
            <el-avatar
              class="user-avatar"
              size="large"
              :src="item.user?.avatarUrl + '?param=56y56'"
              fit="cover"
            />
            <img
              v-show="item.user.avatarDetail?.identityIconUrl"
              class="ident-icon object-cover w-[20px] h-[20px]"
              :src="item.user.avatarDetail?.identityIconUrl + '?param=20y20'"
            />
          </div>
          <!-- 用户名称、评论的内容 -->
          <div class="content">
            <div class="flex flex-wrap mb-[5px]">
              <div class="nickname flex items-center">
                <span
                  class="mr-[2px]"
                  @click.stop="
                    onTargetPage('/user/user-profile', {
                      userId: item.user?.userId,
                    })
                  "
                  >{{ item.user?.nickname }}</span
                >
                <el-image
                  v-if="item.user?.vipRights?.associator?.iconUrl"
                  style="height: 13px"
                  :src="
                    item.user?.vipRights?.redplus?.iconUrl
                      ? item.user?.vipRights?.redplus?.iconUrl + '?param=35y13'
                      : item.user?.vipRights?.associator?.iconUrl +
                        '?param=35y13'
                  "
                  fit="cover"
                />
                <el-image
                  v-else-if="item.user?.vipRights?.musicPackage"
                  style="width: 15.7px; height: 15px"
                  :src="item.user?.vipRights?.musicPackage?.iconUrl"
                  fit="cover"
                />
                &nbsp;:&nbsp;
              </div>
              <span class="text-[13px]">{{ item.content }}</span>
            </div>

            <!-- 回复评论 -->
            <div
              v-if="item.beReplied.length"
              class="be-replied"
              :style="{
                'text-align':
                  item.beReplied[0].content == null ? 'center' : 'left',
              }"
            >
              <span
                class="nickname"
                v-show="item.beReplied[0].content != null"
                @click="
                  onTargetPage('/user/user-profile', {
                    userId: item?.beReplied[0]?.user?.userId,
                  })
                "
              >
                @{{ item.beReplied[0].user.nickname }}&nbsp;:&nbsp;
              </span>
              <span v-show="item.beReplied[0].content != null">{{
                item.beReplied[0].content
              }}</span>

              <span v-show="item.beReplied[0].content == null"
                >该评论已删除</span
              >
            </div>

            <div class="flex items-center justify-between">
              <!-- 刚评论不久 -->
              <div
                v-if="item.timeStr.split('-').length <= 1"
                class="comment-time"
              >
                {{ item.timeStr }}
              </div>
              <!-- 评论了几天或者更久 -->
              <div
                v-show="item.timeStr.split('-').length > 1"
                class="comment-time"
              >
                {{ formatDate(item.time) }}
              </div>

              <div class="flex items-center comment-action">
                <!-- 点赞 -->
                <svg-icon
                  color="rgb(140, 140, 140)"
                  class="cursor-pointer icon"
                  size="18px"
                  v-show="!item.liked"
                  icon-class="dianzan"
                  @click="handleLikeSongListComment(item, key)"
                />
                <!-- 已点赞 -->
                <svg-icon
                  color="#FF3A3A"
                  class="cursor-pointer ml-[10px] icon"
                  size="18px"
                  v-show="item.liked"
                  icon-class="yidianzan"
                  @click="handleLikeSongListComment(item, key)"
                />
                <span v-show="item.likedCount" class="ml-[2px] text-xs">{{
                  item.likedCount
                }}</span>
                <!-- 评论转发 -->
                <svg-icon
                  color="rgb(140, 140, 140)"
                  class="cursor-pointer ml-[10px] icon"
                  size="16px"
                  icon-class="pinglunzhuanfa"
                  @click="TTUL('分享评论功能暂时还没有写')"
                />
                <!-- 回复评论 -->
                <svg-icon
                  color="rgb(140, 140, 140)"
                  class="cursor-pointer ml-[10px] icon"
                  size="18px"
                  icon-class="huifu"
                  @click="handleReply(item)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="pagination w-full h-56px">
      <pagination
        :total="queryParams.total"
        v-model:limit="queryParams.limit"
        v-model:page="queryParams.pageNum"
        @pagination="handlePagination"
      />
    </div>

    <!-- 鼠标右键显示删除评论弹窗 -->
    <div
      v-show="deleteMenuVisible"
      class="delete-menu"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <div @click="handleDeleteComment" class="action flex items-center">
        <el-icon>
          <Delete />
        </el-icon>
        <span class="ml-[10px]">删除(Delete)</span>
      </div>
    </div>

    <Emoji ref="EmojiRef" @chooseEmojiDefault="chooseEmojiDefault" />
  </div>
</template>

<style scoped lang="scss">
.edit-comment {
  color: rgb(140, 140, 140);

  .action-icon {
    .aite:hover {
      color: #000;
    }

    #xiaolian:hover {
      color: #000;
    }
  }
}

.comment-item {
  width: 100%;
  padding-bottom: 15px;

  &:not(:last-child) {
    border-bottom: 2px solid rgba(224, 223, 223, 0.4);
  }

  .ident-icon {
    position: absolute;
    bottom: 4px;
    right: -3px;
  }

  .content {
    width: 100%;

    .nickname {
      color: rgb(98, 154, 232);
      cursor: pointer;
      font-size: 13px;
    }

    .comment-time {
      // color: #9a9a9a;
      font-size: 13px;
    }

    .be-replied {
      background-color: rgb(245, 245, 245);
      border-radius: 5px;
      font-size: 13px;
      padding: 10px 15px;
      margin-bottom: 10px;
    }
  }
}

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
      background: var(--el-fill-color-light);
    }
  }
}
</style>
