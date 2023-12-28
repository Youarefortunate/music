<script setup lang="ts">
import { toRefs } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useMusicStore } from "@/store/modules/music";
import { useFootStore } from "@/store/modules/foot";
import { useRoute } from "vue-router";
import * as SongApi from "@/api/music";
import * as SongListDetailApi from "@/api/songList";
import { formatDate, useNumberFormat, isEmptyObject } from "@/utils";
import { FolderChecked, FolderAdd } from "@element-plus/icons-vue";
import type { TabsPaneContext } from "element-plus";
import { ElMessageBox, ElLoading, ElMessage } from "element-plus";
import { SongList, Comment, Collector } from "./modules";
import { SubscribeType } from "@/enums/SubscribeEnum";
import { onTargetPage } from "@/utils/globalMethods";

// 路由对象
const route = useRoute();
const userStore = useUserStore();
const musicStore = useMusicStore();
const footStore = useFootStore();
// 加载
const loading = ref<boolean>(false);
// 歌单id
const songId = ref<string>("");
// 获取歌单详情数据
const songDetailData = reactive({
  playlist: {} as any,
  // 歌单是否收藏
  subscribed: false,
});
const { playlist, subscribed } = toRefs(songDetailData);
// 用户歌单列表动态tab组件渲染类型声明
type TabsComponents = "songList" | "comment" | "collector";
// 用户歌单列表动态tab组件渲染数据
const tabsComponents = {
  songList: SongList,
  comment: Comment,
  collector: Collector,
};
// 当前活跃标签页
const curActiveTab = ref<TabsComponents>("songList");
// 动态组件is属性值
const tabsComponentId = computed(() => tabsComponents[curActiveTab.value]);
// 动态组件ref
const SongDetailComponentRef = ref();

watch(
  () => route.query,
  (newVal) => {
    // 存在歌单id
    if (newVal.songId) {
      songId.value = newVal.songId as string;
      // 加载数据
      getSongDetail(newVal.songId as string);
    }
  },
  { immediate: true, deep: true }
);

// 获取歌单详情
function getSongDetail(id: string) {
  loading.value = true;
  SongListDetailApi.getSongListDetailById({ id })
    .then((res) => {
      const { code, playlist } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      songDetailData.playlist = playlist;
      // 重新赋值歌单是否收藏状态
      songDetailData.subscribed = playlist.subscribed;

      console.log("获取歌单详情成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取歌单详情失败==>", err);
      ElMessage.error(err.message || "获取歌单详情失败");
    })
    .finally(() => (loading.value = false));
}

// 播放当前歌单全部歌曲
const handlePlayAllSong = () => {
  ElMessageBox.confirm(
    "一键播放当前歌单全部音乐将会覆盖掉之前的播放记录，是否继续",
    "播放当前歌单所有音乐",
    {
      confirmButtonText: "继续",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => getSongDetailByIds());
};

// 通过ids歌曲数组id获取当前歌单全部数据
function getSongDetailByIds() {
  const ids = formatAllSongIds(playlist.value.trackIds);
  SongApi.getSongDetailByIds(ids)
    .then((res) => {
      const { code, songs } = res.data;
      
      if (code != 200) {
        return Promise.reject(res.data);
      }
      console.log("当前歌单所有添加到播放列表成功==>", res.data);
      // 进入正常音乐播放模式
      footStore.enterFmMode('music');
      // 当前播放的所有歌曲
      musicStore.curPlayList = songs || [];
      // 播放该歌单的第一首歌曲
      musicStore.setCurMusicRecord(songs[0], 0);
    })
    .catch((err) => {
      ElMessage.error(
        err.message || "获取歌单详情，通过返回的所有歌曲trackIds数组添加到播放列表失败"
      );
    });
}

/**
 * 格式化所有歌曲id
 * @param ids 单/多歌曲id，用逗号隔开
 */ 
function formatAllSongIds(ids: any[]): string {
  const idsArr = [...ids];
  const queryParams = SongDetailComponentRef.value?.queryParams;
  // 每次需要取的数量，比如第一次 页码1页limit50，所以第一页取50条数据，第二页页码2，limit50，所以取 50*2=100 条数据
  const offset = queryParams?.pageNum * queryParams?.limit;
  // 判断所需要截图的长度是否超出或者等于总数组长度
  if(offset >= ids.length) {
    // 直接返回全部
    return idsArr.map((item) => item.id).join(",");
  }
  return idsArr.splice(0, offset).map((item) => item.id).join(",");
}

// 收藏/取消收藏歌单
const handleSubscribeSong = () => {
  // 取消收藏
  if (songDetailData.subscribed) {
    ElMessageBox.confirm("你确定不再收藏该歌单吗?", "Warning", {
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
};
// 收藏/取消收藏歌单
function subscribeSong(t: SubscribeType) {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  SongListDetailApi.subscribedSong({
    id: songId.value,
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
      songDetailData.subscribed = t === SubscribeType.Subscribe;
      console.log("songDetailData.subscribed==>", songDetailData.subscribed);

      ElMessage.success(
        t === SubscribeType.Subscribe ? "收藏成功" : "取消收藏成功"
      );
    })
    .catch((err) => {
      ElMessage.error(
        err || err.message || t === SubscribeType.Subscribe
          ? "取消收藏失败"
          : "收藏失败"
      );
      // 更改收藏状态
      songDetailData.subscribed = false;
    })
    .finally(() => {
      nextTick(() => {
        // Loading should be closed asynchronously
        loadingInstance.close();
      });
    });
}

// 标签页选项发生变化
function handleTabsClick(tab: TabsPaneContext, event: Event) {
  // console.log("标签页选项发生变化tab==>", tab);
  // console.log("标签页选项发生变化event==>", event);
}

defineOptions({
  name: "SongDetail",
});
</script>

<template>
  <div v-if="!isEmptyObject(playlist)" class="song-detail mt-[20px]">
    <!-- 歌单头部 -->
    <div v-loading="loading" class="header mb-[30px] w-full flex">
      <!-- 歌单封面 -->
      <div class="cover-img mr-[25px] flex flex-1 items-center justify-center">
        <el-image
          class="w-[220px] h-[220px]"
          :src="playlist.coverImgUrl"
          fit="cover"
        />
      </div>
      <!-- 歌单详情 -->
      <div class="song-desc flex flex-col">
        <!-- 歌单标题、歌单创建者 -->
        <div class="flex-[30%]">
          <div class="flex items-center">
            <el-tag class="mr-[10px]" type="danger" effect="plain">{{
              playlist.highQuality ? "精品歌单" : "歌单"
            }}</el-tag>
            <div class="font-bold text-[23px]">{{ playlist.name }}</div>
          </div>
          <div class="flex items-center">
            <!-- 歌单创建者头像 -->
            <div class="creator flex items-center justify-center mr-[10px]">
              <el-avatar
                :size="30"
                shape="circle"
                :src="playlist.creator?.avatarUrl"
                fit="cover"
              />
              <img
                v-if="playlist.creator?.avatarDetail?.identityIconUrl"
                class="ident-icon object-cover w-[13px] h-[13px]"
                :src="playlist.creator?.avatarDetail?.identityIconUrl"
              />
            </div>
            <!-- 歌单创建者昵称 -->
            <div
              @click.stop="
                onTargetPage('/user/user-profile', {
                  userId: playlist.creator?.userId,
                })
              "
              class="cursor-pointer text-sm text-[var(--el-color-primary)] mr-[10px]"
            >
              {{ playlist.creator?.nickname }}
            </div>
            <!-- 歌单创建时间 -->
            <div class="text-[rgb(152,152,152)] text-sm">
              {{ formatDate(playlist.createTime, "YYYY-MM-DD") }}创建
            </div>
          </div>
        </div>
        <!-- 操作按钮：播放全部，收藏 -->
        <div class="flex items-center flex-[30%]">
          <div class="mr-[10px]">
            <el-button
              class="play-all"
              round
              color="var(--el-color-primary)"
              @click="handlePlayAllSong"
            >
              <span>播放全部</span>
              <template #icon>
                <svg-icon size="20px" icon-class="bofangliang" color="#fff" />
              </template>
            </el-button>
          </div>
          <!-- 用户自己创建的文件夹不允许用户自己收藏 -->
          <el-button
            round
            plain
            @click="handleSubscribeSong"
            :disabled="userStore.profile.userId == playlist.creator.userId"
          >
            <span v-show="subscribed"
              >已收藏({{ useNumberFormat(playlist?.subscribedCount) }})</span
            >
            <span v-show="!subscribed"
              >收藏({{ useNumberFormat(playlist?.subscribedCount) }})</span
            >
            <template #icon>
              <!-- 已收藏 -->
              <el-icon v-show="subscribed" size="20"><FolderChecked /></el-icon>
              <!-- 未收藏 -->
              <el-icon v-show="!subscribed" size="20"><FolderAdd /></el-icon>
            </template>
          </el-button>
        </div>
        <!-- 歌单标签、歌曲数量播放量、歌单简介 -->
        <div
          class="flex flex-col justify-between flex-[40%] text-[rgb(92,92,92)]"
        >
          <div class="text-sm">
            <span>标签 : </span>
            <span
              v-if="playlist?.tags.length"
              class="song-tag mr-[5px] text-[var(--el-color-primary)] cursor-pointer"
              v-for="tag in playlist.tags"
              >{{ tag }}</span
            >
            <span v-else>该歌单暂无标签</span>
          </div>
          <div class="text-sm">
            <span class="mr-[15px]">歌曲 : {{ playlist?.trackCount }}</span>
            <span>播放 : {{ useNumberFormat(playlist?.playCount) }}</span>
          </div>
          <div class="text-sm w-full flex items-center">
            <span>简介 : &nbsp;</span>
            <span
              :class="{ 'w-700px': playlist?.description.length > 100 }"
              v-if="playlist?.description"
              class="oneline-hide"
              >{{ playlist.description }}</span
            >
            <span v-else>该歌单暂无描述</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签栏 -->
    <div class="tabs-container">
      <el-tabs
        v-model="curActiveTab"
        class="custom-tabs mb-[10px]"
        @tab-click="handleTabsClick"
      >
        <el-tab-pane label="歌曲列表" name="songList" />
        <el-tab-pane
          :label="`评论(${playlist?.commentCount})`"
          name="comment"
        />
        <el-tab-pane label="收藏者" name="collector" />
      </el-tabs>
    </div>

    <component ref="SongDetailComponentRef" :songId="songId" :playlist="playlist" :is="tabsComponentId" />
  </div>
</template>

<style scoped lang="scss">
.cover-img {
  border-radius: 5px;
}

// 歌曲详情介绍
.song-desc {
  flex: 90%;
  .creator {
    position: relative;
    .ident-icon {
      position: absolute;
      bottom: 1px;
      right: -3px;
    }
  }

  // 歌单标签
  .song-tag {
    &:not(:last-child) {
      &::after {
        content: "/";
        padding-left: 5px;
      }
    }
  }

  // 播放全部按钮
  .play-all {
    position: relative;
    padding-right: 50px;
    &::after {
      content: "+";
      position: absolute;
      top: 0;
      right: 0;
      font-size: 23px;
      width: 40px;
      height: 31px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      border-left: 1px solid rgba(208, 208, 208, 0.5);
      align-items: center;
      justify-content: center;
      border-radius: 0 50% 50% 0;
      color: #fff;
    }
  }
}

:deep(.custom-tabs) {
  .el-tabs__item.is-active {
    font-size: 20px;
    font-weight: bold;
    transition: all 0.1s;
  }
  .el-tabs__nav-wrap::after {
    display: none;
  }
}
</style>
@/enums/SubscribeEnum
