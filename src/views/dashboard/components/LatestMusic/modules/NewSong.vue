<script lang="ts" setup>
import * as NewestEnum from "@/enums/NewestEnum";
import { MusicFeeTypeEnum, MusicQualityEnum } from "@/enums/MusicInfoEnum";
import { FolderAdd, CaretRight } from "@element-plus/icons-vue";
import * as NewestApi from "@/api/newest";
import * as SongApi from "@/api/music";
import { formatPlayTime } from "@/utils";
import { useMusicStore } from "@/store/modules/music";
import { playMusicAction } from "@/utils/music-play-action";
import { onTargetPage } from "@/utils/globalMethods";

const musicStore = useMusicStore();
// 加载
const loading = ref<boolean>(false);
// 请求参数
const queryParams = reactive({
  // 分类类型
  cate: NewestEnum.NewSongTypeEnum.all,
});
// 新歌100首
const songs = ref<Array<any>>([]);
// 当前点中歌曲，值为歌曲id
const curSong = ref<number>(0);
// 分类项
const categoryList = [
  { name: "全部", value: NewestEnum.NewSongTypeEnum.all },
  { name: "华语", value: NewestEnum.NewSongTypeEnum.zh },
  { name: "欧美", value: NewestEnum.NewSongTypeEnum.ea },
  { name: "韩国", value: NewestEnum.NewSongTypeEnum.kr },
  { name: "小日本", value: NewestEnum.NewSongTypeEnum.jp },
];

onMounted(() => {
  // 获取新歌速递100首音乐
  getNewestSong();
});

// 获取新歌速递100首音乐
function getNewestSong() {
  loading.value = true;
  NewestApi.getTopNewSong({ type: queryParams.cate })
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      songs.value = data || [];
      console.log("获取新歌速递100首音乐成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取新歌速递100首音乐失败==>", err);
      ElMessage.error(err.message || "获取新歌速递100首音乐失败");
    })
    .finally(() => (loading.value = false));
}

// 切换搜索分类类型
const handleSwicthCate = (cate: any) => {
  if (queryParams.cate == cate.value) return;
  queryParams.cate = cate.value;
  handleRefresh();
};

// 播放当前最新歌曲全部音乐
const handlePlayAllSong = () => {
  ElMessageBox.confirm(
    "一键播放当前新歌速递全部歌曲，将会覆盖掉之前的播放记录，是否继续",
    "播放当前所有音乐",
    {
      confirmButtonText: "继续",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    getSongDetailByIds();
  });
};

// 双击播放音乐
const handlePlaySong = async (song: any) => {
  console.log("双击播放音乐==>", song);
  const s = await SongApi.getSongDetailByIds(song.id);
  const { code } = s.data;
  if (code != 200 || s.data?.songs.length == 0) {
    return ElMessage.error("播放失败");
  }
  const curMusicInfo = s.data?.songs[0];
  playMusicAction(curMusicInfo);
};

// 通过ids歌曲数组id获取当前歌单全部数据
function getSongDetailByIds() {
  const ids = formatAllSongIds(songs.value);
  SongApi.getSongDetailByIds(ids)
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(
          "一键播放全部新歌速递失败：原因通过ids获取歌曲失败"
        );
      }
      console.log("当前新歌速递所有歌曲添加到播放列表成功==>", res.data);
      // 当前播放的所有歌曲
      musicStore.curPlayList = res.data.songs;
      // 播放该歌单的第一首歌曲
      musicStore.setCurMusicRecord(res.data.songs[0], 0);
    })
    .catch((err) => {
      ElMessage.error(
        err.message || "一键播放全部新歌速递失败：原因通过ids获取歌曲失败"
      );
    });
}

// 格式化所有歌曲id
function formatAllSongIds(ids: any[]): string {
  return ids.map((item) => item.id).join(",");
}

// 刷新列表
function handleRefresh(bool: boolean = true) {
  bool && getNewestSong();
}

defineOptions({
  name: "NewSong",
});
</script>

<template>
  <div class="newsong">
    <div class="flex items-center justify-between mb-20px">
      <!-- 分类 -->
      <div class="cate">
        <div class="cate-item">
          <el-link
            class="cate-text"
            :class="{ 'cate-active': queryParams.cate == cate.value }"
            v-for="cate in categoryList"
            :key="cate.value"
            :underline="false"
            @click="handleSwicthCate(cate)"
            >{{ cate.name }}</el-link
          >
        </div>
      </div>

      <!-- 按钮操作组 -->
      <div class="btn-action">
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

        <el-button round plain @click="TTUL('收藏全部功能暂时还没有做😰')">
          <span>收藏全部</span>
          <template #icon>
            <!-- 未收藏 -->
            <el-icon size="20">
              <FolderAdd />
            </el-icon>
          </template>
        </el-button>
      </div>
    </div>

    <div
      v-loading="loading"
      class="w-full"
      :class="{ 'h-400px': loading }"
      element-loading-text="努力加载中🍉..."
    >
      <!-- 歌曲列表 -->
      <ul class="songs" v-if="songs.length">
        <li
          class="song-item"
          v-for="(song, index) in songs"
          :key="song.id"
          :class="{
            'active-song-item': curSong === song.id,
            'is-cur-music': musicStore.curMusicRecord.id == song.id,
          }"
          @click="() => (curSong = song.id)"
          @dblclick="handlePlaySong(song)"
        >
          <div v-if="musicStore.curMusicRecord.id != song.id" class="index">
            {{ (index + 1).toString().padStart(2, "0") }}
          </div>
          <div v-else class="text-[var(--el-color-primary)]">
            <svg-icon size="25px" icon-class="laba" />
          </div>

          <!-- 封面图 -->
          <div class="flex items-center">
            <div
              class="w-100px h-100px flex items-center justify-center relative"
            >
              <el-image
                lazy
                class="w-full h-full min-w-[100px] min-h-[100px]"
                style="border-radius: 5px; border: 1.3px solid #eee"
                :src="song?.album?.blurPicUrl + '?param=100y100'"
                fit="cover"
              />

              <div class="play">
                <svg-icon
                  style="font-size: 20px"
                  icon-class="bofanggequ"
                  color="rgb(236,65,65)"
                />
              </div>
            </div>
            <div class="song-name" :title="song.name">{{ song.name }}</div>
            <div class="flex items-center">
              <!-- vip音乐标签 -->
              <el-tag
                class="music-tag vip"
                v-if="MusicFeeTypeEnum.VIP == song.fee"
                >VIP</el-tag
              >
              <!-- 高品质音乐标签 -->
              <el-tag
                class="music-tag hi-res"
                v-if="MusicQualityEnum.HIRES == song.hMusic?.sr"
                >Hi-Res</el-tag
              >
              <!-- 无损音乐SQ -->
              <el-tag
                class="music-tag sq"
                v-if="MusicQualityEnum.SQ == song.bMusic?.sr"
                >SQ</el-tag
              >

              <!-- 是否存在mv -->
              <div
                class="music-tag mv"
                v-if="song.mvid !== 0"
                @click="onTargetPage('/video/mv-detail', { mvid: song.mvid })"
              >
                <div>MV</div>
                <el-icon>
                  <CaretRight />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 歌手（可能存在多个） -->
          <div class="artists" v-if="song.artists.length">
            <span
              :title="a.name"
              class="artists-name"
              v-for="a in song.artists"
              :key="a.id"
              @click.stop="TTUL('歌手页正在火速编写中💪...')"
              >{{ a.name }}</span
            >
          </div>

          <!-- 专辑 -->
          <div class="album">
            <span
              title="歌手专辑"
              @click.stop="
                onTargetPage('/album/album-detail', { albumId: song.album.id })
              "
              >{{ song?.album?.name }}</span
            >
          </div>

          <!-- 播放时长 -->
          <div class="time">
            <span title="歌曲的播放时长">{{
              formatPlayTime(song.duration)
            }}</span>
          </div>
        </li>
      </ul>

      <!-- 失败显示 -->
      <div class="flex items-center justify-center w-full h-400px" v-else>
        <div class="flex items-center">
          <span class="text-xs text-#838080">{{ "获取失败啦~" }}</span>
          <el-link
            @click="handleRefresh()"
            :underline="false"
            style="font-size: 0.75rem; line-height: 2rem"
            class="ml-10px"
            >重试</el-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}

.newsong {
}

.cate-item {
  @include flex-center;

  .cate-text:not(:last-child) {
    margin-right: 30px;
  }

  .cate-active {
    font-weight: bold;
    font-size: 17px;
    color: var(--el-color-primary);
  }
}

.btn-action {
  @include flex-center;
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

.songs {
  .song-item {
    display: grid;
    grid-template-columns: 30px minmax(400px, 1fr) 200px 250px 100px;
    align-items: center;
    padding: 10px 20px;
    border-radius: 8px;
    column-gap: 15px;

    &:nth-child(2n + 1) {
      background-color: #fafafa;
    }

    &:hover {
      cursor: pointer;
      background: #f0f0f0;
    }

    .index {
      color: #9a9a9a;
    }

    .song-name {
      font-weight: 400;
      font-size: 15px;
      margin-left: 10px;
      color: #323232;
      margin-right: 10px;
    }

    .artists,
    .song-name {
      text-overflow: ellipsis;
      overflow: hidden;
      text-wrap: nowrap;
    }

    .artists-name,
    .album,
    .time {
      color: #9a9a9a;
      font-size: 14px;
      font-weight: 200;

      &:hover {
        color: rgb(90, 89, 89);
      }
    }

    .artists-name {
      &:not(:last-child)::after {
        content: "/";
        padding: 0 5px;
      }
    }

    .play {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
    }
  }

  // 当前点击处于选中效果的歌曲项
  .active-song-item {
    background-color: #f0f0f0;
  }

  // 该首歌为当前播放歌曲
  .is-cur-music {
    .index,
    .song-name {
      color: var(--el-color-primary) !important;
    }
  }
}

.music-tag {
  border-radius: 2px;
  margin-left: 5px;
  font-size: 12px;
  height: 15px;
  font-weight: 700;
  padding: 0 2px;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  text-wrap: nowrap;
  white-space: nowrap;
  line-height: 0;
}

// vip歌曲标签
.vip {
  color: rgb(247, 135, 92);
  border: 1.8px solid rgb(247, 135, 92);
}

// 高品质音乐标签和无损音乐和视频mv标签
.hi-res,
.sq,
.mv {
  color: var(--el-color-primary);
  border: 1.8px solid var(--el-color-primary);
}
</style>
