<script setup lang="ts">
import { toRefs } from "vue";
import { useMusicStore } from "@/store/modules/music";
import { useRoute } from "vue-router";
import * as AlbumApi from "@/api/album";
import * as SongApi from "@/api/music";
import { formatDate, isEmptyObject } from "@/utils";
import { FolderChecked, FolderAdd } from "@element-plus/icons-vue";
import { SubscribeType } from "@/enums/SubscribeEnum";
import { ElMessageBox, ElLoading, ElMessage } from "element-plus";
import { SongList, Comment, AlbumDesc } from "./modules";

// 路由对象
const route = useRoute();
const musicStore = useMusicStore();
// 加载
const loading = ref<boolean>(false);
// 专辑id
const albumId = ref<string | number>("");
// 获取专辑详情数据
const albumInfo = reactive({
  album: {} as any,
  // 专辑歌曲列表
  songs: [] as any,
  // 专辑是否收藏/取消收藏
  subscribed: false,
});
const { album, songs, subscribed } = toRefs(albumInfo);
// 专辑动态tab组件渲染类型声明
type TabsComponents = "songList" | "comment" | "desc";
// 专辑动态tab组件渲染数据
const tabsComponents = {
  songList: SongList,
  comment: Comment,
  desc: AlbumDesc,
};
// 当前活跃标签页
const curActiveTab = ref<TabsComponents>("songList");
// 动态组件is属性值
const tabsComponentId = computed(() => tabsComponents[curActiveTab.value]);
watch(
  () => route,
  (newVal) => {
    // 存在专辑id
    if (newVal.query.albumId) {
      albumId.value = newVal.query.albumId as string;
      // 加载数据
      getSongDetail(newVal.query.albumId as string);
    }
  },
  { immediate: true, deep: true }
);

// 获取专辑详情
function getSongDetail(id: string) {
  loading.value = true;
  AlbumApi.getAlbumDetail(id)
    .then((res) => {
      const { code, album, songs } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      albumInfo.album = album || {};
      albumInfo.songs = songs || [];

      console.log("获取专辑详情成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取专辑详情失败==>", err || err.message);
      ElMessage.error(err.message || "获取专辑详情失败");
    })
    .finally(() => (loading.value = false));
}

// 播放当前专辑全部歌曲
const handlePlayAllSong = () => {
  ElMessageBox.confirm(
    "一键播放当前专辑全部歌曲将会覆盖掉之前的播放记录，是否继续",
    "播放当前专辑所有音乐",
    {
      confirmButtonText: "继续",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => getSongDetailByIds());
};

// 通过ids歌曲数组id获取当前专辑全部歌曲
function getSongDetailByIds() {
  const ids = formatAllSongIds(songs.value);
  SongApi.getSongDetailByIds(ids)
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      console.log("当前专辑所有歌曲添加到播放列表成功==>", res.data);
      // 当前播放的所有歌曲
      musicStore.curPlayList = res.data.songs;
      // 播放该歌单的第一首歌曲
      musicStore.setCurMusicRecord(res.data.songs[0], 0);
    })
    .catch((err) => {
      ElMessage.error(err.message);
    });
}

// 格式化所有歌曲id
function formatAllSongIds(ids: any[]): string {
  return ids.map((item) => item.id).join(",");
}

// 收藏/取消收藏专辑
const handleSubscribeAlbum = () => {
  // 取消收藏
  if (albumInfo.subscribed) {
    ElMessageBox.confirm("你确定不再收藏该专辑了吗?", "Warning", {
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

// 收藏/取消收藏专辑
function subscribeSong(t: SubscribeType) {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  console.log("albumId==>", albumId.value);

  AlbumApi.subscribedAlbum({
    id: albumId.value,
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
      albumInfo.subscribed = t === SubscribeType.Subscribe;

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
      albumInfo.subscribed = false;
    })
    .finally(() => {
      nextTick(() => {
        // Loading should be closed asynchronously
        loadingInstance.close();
      });
    });
}

defineOptions({
  name: "AlbumDetail",
});
</script>

<template>
  <div v-if="!isEmptyObject(album)" class="album-detail mt-[20px]">
    <!-- 专辑头部 -->
    <div v-loading="loading" class="header mb-[30px] w-full flex">
      <!-- 专辑封面 -->
      <div class="cover-img mr-[25px] flex flex-1 items-center justify-center">
        <el-image
          class="w-[220px] h-[220px]"
          :src="album.picUrl + '?param=220y220'"
          fit="cover"
        />
      </div>
      <!-- 专辑详情 -->
      <div class="song-desc flex flex-col">
        <!-- 专辑标题 -->
        <div class="flex items-center">
          <el-tag class="mr-[10px]" type="danger" effect="plain">{{
            album.type
          }}</el-tag>
          <div class="font-bold text-[23px]">{{ album.name }}</div>
        </div>
        <!-- 操作按钮：播放全部，收藏 -->
        <div class="flex items-center flex-[30%]">
          <div class="mr-[10px]">
            <el-button
              class="play-all"
              round
              color="rgb(236,65,65)"
              @click="handlePlayAllSong"
            >
              <span>播放全部</span>
              <template #icon>
                <svg-icon size="20px" icon-class="bofangliang" color="#fff" />
              </template>
            </el-button>
          </div>
          <!-- 用户自己创建的文件夹不允许用户自己收藏 -->
          <el-button round plain @click="handleSubscribeAlbum">
            <span v-show="subscribed">已收藏</span>
            <span v-show="!subscribed">&nbsp;收藏</span>
            <template #icon>
              <!-- 已收藏 -->
              <el-icon v-show="subscribed" size="20"><FolderChecked /></el-icon>
              <!-- 未收藏 -->
              <el-icon v-show="!subscribed" size="20"><FolderAdd /></el-icon>
            </template>
          </el-button>
        </div>
        <!-- 专辑标签、歌手名称、专辑创建时间 -->
        <div class="flex flex-col flex-[40%] text-[rgb(92,92,92)]">
          <!-- 专辑标签 -->
          <div class="text-sm mb-10px">
            <span>标签 : </span>
            <span
              v-if="album?.tags"
              class="album-tag mr-[5px] text-[var(--el-color-primary)] cursor-pointer"
              >{{ album?.tags }}</span
            >
            <span v-else>该专辑暂无标签</span>
          </div>
          <!-- 歌手名称 -->
          <div
            v-if="album.artists.length"
            class="text-sm w-full flex items-center oneline-hide mb-10px"
          >
            <span>歌手 : &nbsp;</span>
            <el-link
              class="artist-name"
              :underline="false"
              style="color: #0c73c2"
              v-for="artist in album.artists"
              @click="TTUL('歌手页暂时还未完成😳')"
              >{{ artist.name }}</el-link
            >
          </div>
          <!-- 专辑创建(发布)时间 -->
          <div
            class="create-time text-sm w-full flex items-center oneline-hide"
          >
            <span>时间 : &nbsp;</span>
            <span>{{ formatDate(album.publishTime, "YYYY-MM-DD") }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签栏 -->
    <div class="tabs-container">
      <el-tabs v-model="curActiveTab" class="custom-tabs mb-[10px]">
        <el-tab-pane label="歌曲列表" name="songList" />
        <el-tab-pane
          :label="`评论(${album?.info?.commentCount})`"
          name="comment"
        />
        <el-tab-pane label="专辑详情" name="desc" />
      </el-tabs>
    </div>

    <component
      :albumId="albumId"
      :songs="songs"
      :album="album"
      :is="tabsComponentId"
    />
  </div>
</template>

<style lang="scss" scoped>
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
  .album-tag,
  .artist-name {
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
