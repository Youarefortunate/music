<script lang="ts" setup>
import * as TopListApi from "@/api/toplist";
import * as SongListApi from "@/api/songList";
import { ArrowRight } from "@element-plus/icons-vue";
import { useNumberFormat } from '@/utils'
import { playMusicAction } from '@/utils/music-play-action'

const emit = defineEmits<{
  (e: "switchTab", tab: any): void
}>();
// 加载
const loading = ref(false);
// 官方榜
const officialList = ref<any>([]);
// 全球榜单
const topList = ref<any>([]);
// 选中样式效果变量
const activeItem = ref(0);

onMounted(() => {
  // 获取榜单内容
  getTopList();
});

// 获取榜单内容
function getTopList() {
  // 开始加载
  loading.value = true;
  TopListApi.getTopList()
    .then(async (res) => {
      const { code, list } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取榜单内容失败"));
      }
      if (list.length) {
        // 官方榜单id
        const ids: number[] = list
          .filter((s: any) => s.ToplistType)
          .map((m: any) => m.id);
        // 获取对应榜单的前5首歌曲
        const res = await Promise.all(ids.map((id: number) => getSongList(id)));
        // 将榜单歌单的前5首歌曲赋值进 list 数组中，方便后续操作
        res.forEach((item) => {
          const { code, playlist } = item.data;
          if (code != 200) {
            list.forEach((o: any) => {
              if (o.id == playlist.id) {
                o["errMsg"] = `获取${o.name}对应榜单的前5首歌曲失败`;
              }
            });
            return console.error(
              "获取对应榜单的前5首歌曲失败，失败榜单id==>",
              playlist.id
            );
          }
          list.forEach((o: any) => {
            if (o.id == playlist.id) {
              o["tracks"] = playlist.tracks.splice(0, 5);
            }
          });
        });

        // 通过榜单id获取对应的5首歌曲
        officialList.value = list.filter((s: any) => s.ToplistType) || [];
        // console.log("通过榜单id获取对应的5首歌曲==>", officialList.value);

        // 全球榜单
        topList.value = list.filter((s: any) => !s.ToplistType) || [];
        // console.log("全球榜单==>", topList.value);
      }
    })
    .catch((err) => {
      ElMessage.error("获取榜单内容失败");
      console.log("获取榜单内容失败==>", err);
    })
    .finally(() => (loading.value = false));
}

// 通过榜单id获取对应的歌单前5首歌曲
async function getSongList(id: number) {
  return await SongListApi.getSongListDetailById({
    id: id.toString(),
  });
}

// 双击播放音乐
const handlePlaySong = (song: any) => {
  console.log("双击播放音乐==>", song);
  playMusicAction(song);
}

// 刷新数据
function handleRefresh(bool: boolean = true) {
  bool && getTopList();
}

// 组件名称
defineOptions({
  name: "RankingList",
});
</script>

<template>
  <!-- 排行榜 -->
  <div
    v-loading="loading"
    element-loading-text="加载榜单中😙..."
    :class="{ 'h-500px': loading }"
    class="w-full rank-list"
  >
    <h2 class="title" v-show="!loading">官方榜</h2>
    <div class="official-top-list" v-if="officialList.length">
      <div
        class="list-item mb-30px"
        v-for="item in officialList"
        :key="item.id"
      >
        <!-- 封面 -->
        <div class="poster" @click="onTargetPage('/song/song-detail', { songId: item.id })">
          <el-image :src="item.coverImgUrl + '?param=100y100'" class="img" fit="cover" />

          <!-- 榜单歌单里面第一首歌曲的背景图片，做透明效果 -->
          <img
            :src="item.tracks[0]?.al?.picUrl"
            :draggable="false"
            class="bg-img"
          />

          <!-- hover显示播放按钮 -->
          <div class="play">
            <svg-icon
              style="font-size: 20px"
              icon-class="bofanggequ"
              color="rgb(236,65,65)"
            />
          </div>
        </div>
        <!-- 歌曲 -->
        <ul class="songs" v-if="item.tracks.length">
          <li
            class="song-item"
            v-for="(track, i) in item.tracks"
            :key="track.id"
            @click="activeItem = track.id"
            @dblclick="handlePlaySong(track)"
            :style="{
              backgroundColor: activeItem == track.id ? '#eaeaea' : '',
            }"
          >
            <div class="flex items-center">
              <div class="index">{{ i + 1 }}</div>
              <div class="song-name">
                <span>{{ track.name }}</span>
                <span class="tns" v-if="track?.tns"
                  >（{{ track?.tns[0] }}）</span
                >
              </div>
            </div>

            <!-- 歌手（可能存在多个） -->
            <div class="ar" v-if="track.ar">
              <span class="ar-name" v-for="ar in track.ar" :key="ar.id">{{
                ar.name
              }}</span>
            </div>
          </li>
        </ul>
        <!-- 失败显示 -->
        <div class="flex items-center justify-center w-full h-full" v-else>
          <div class="flex items-center">
            <span class="text-xs text-#838080">{{
              item.errMsg || "获取失败啦~"
            }}</span>
            <el-link
              @click="handleRefresh()"
              :underline="false"
              style="font-size: 0.75rem; line-height: 2rem"
              class="ml-10px"
              >重试</el-link
            >
          </div>
        </div>

        <!-- 占用行 -->
        <div class="occupy"></div>
        <!-- 查看全部 -->
        <div class="show-all-song" @click="onTargetPage('/song/song-detail', { songId: item.id })">
          <span class="text-sm">查看全部</span>
          <el-icon size="15"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 全球榜 global -->
    <h2 class="title" v-show="!loading">全球榜</h2>
    <div
      class="song-list grid grid-flow-row grid-cols-3 lg:grid-cols-4 gap-5 2xl:grid-cols-5"
    >
      <div v-for="item in topList" :key="item.id" class="song-box">
        <div class="img-box" @click="onTargetPage('/song/song-detail', { songId: item.id })">
          <!-- 播放量 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.playCount) }}</span>
          </div>

          <el-image
            class="w-full"
            style="border-radius: 5px"
            :src="item.coverImgUrl + '?param=100y100'"
            fit="cover"
          />
          <!-- hover显示播放按钮 -->
          <div class="play-icon">
            <svg-icon
              style="font-size: 20px"
              icon-class="bofanggequ"
              color="rgb(236,65,65)"
            />
          </div>
        </div>
        <div class="song-name oneline-hide text-xs">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}

.list-item {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 1fr 20px;
  grid-gap: 10px 40px;
  grid-template-areas:
    "poster songs "
    "occupy show-all-song";
}
.poster {
  grid-area: "poster";
  position: relative;
  cursor: pointer;
  &:hover {
    .play {
      opacity: 0.8;
    }
  }

  .bg-img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0.1;
  }
  .img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
  }
}
.songs {
  grid-area: "songs";
  .song-item {
    border-radius: 5px;
    .index {
      margin-right: 10px;
      color: #8d8d8d;
    }
    .song-name {
      font-weight: 500;
      color: #3b3b3b;
      .tns {
        font-weight: 400;
        color: #8d8d8d;
      }
    }
    @include flex-center();
    justify-content: space-between;
    padding: 8px 10px;
    .song-name {
      color: #414141;
      font-size: 0.875rem;
    }
    // 奇数列
    &:nth-child(2n + 1) {
      background-color: #fafafa;
    }
    &:hover {
      cursor: pointer;
      background-color: #f1f1f1;
    }
    // 每个歌手后面加上一个 / 最后一个除外
    .ar {
      .ar-name {
        color: #8d8d8d;
        font-size: 13px;
      }
      .ar-name:not(:last-child)::after {
        content: "/";
        margin: 0 5px;
      }
    }
  }
}
.occupy {
  grid-area: "occupy";
}
.show-all-song {
  width: 100px;
  color: #868585;
  grid-area: "show-all-song";
  @include flex-center();
  &:hover {
    color: #525252;
    cursor: pointer;
  }
}

.play {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 4;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  background-color: #fff;
  opacity: 0;
  transition: opacity 0.8s;
}

@for $i from 1 to 4 {
  .song-item:nth-child(#{$i}) .index {
    color: var(--el-color-primary) !important;
  }
}
</style>
