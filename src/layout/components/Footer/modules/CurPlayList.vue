<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useMusicStore } from "@/store/modules/music";
import { formatPlayTime } from "@/utils";
import * as MusicInfoEnum from "@/enums/MusicInfoEnum";

// 路由对象
const router = useRouter();
const musicStore = useMusicStore();
const { status, curPlayList, showCurPlayList, playIndex, curplayId } =
  storeToRefs(musicStore);
// 当前点击行高亮
const curRow = ref<number | undefined>(undefined);

// 双击播放音乐
const handleDBPlayMusic = (music: any) => {
  console.log("双击播放某首音乐==>", music);
  // 获取当前播放歌曲在播放列表数组中的索引值
  curPlayList.value.forEach((m: any, i: number) => {
    if (music.id === m.id) {
      playIndex.value = i;
      curplayId.value = music.id;
    }
  });
  // 保存当前播放的音乐信息
  musicStore.setCurMusicRecord(music);
};

// 点击某项音乐显示高亮
const handleClickMusicItem = (index: number | undefined) => {
  curRow.value = index;
};

// 清空当前播放列表
const handleClearPlayList = () => {
  // 将音乐store状态清空
  musicStore.reset();
};

// 跳转到首页并关闭当前音乐列表
const handleTarget = () => {
  router.push("/");
  close();
};

defineExpose({
  close,
});
</script>

<template>
  <div class="curplay-container">
    <div class="drawer-container">
      <el-drawer
        class="drawer"
        v-model="showCurPlayList"
        direction="rtl"
        size="500px"
        :with-header="false"
      >
        <h2 class="pl-[20px]">当前播放</h2>

        <div class="title flex items-center justify-between">
          <div class="text-[#858585] text-[13px]">
            总{{ curPlayList.length }}首
          </div>
          <div class="flex items-center">
            <span
              class="cursor-pointer text-[15px] mr-[10px]"
              @click="TTUL('收藏全部功能暂时还没有做😰')"
              >收藏全部</span
            >
            <span
              @click="handleClearPlayList"
              class="cursor-pointer text-[15px] text-[#96B7DD] hover:text-[#23AAF2]"
              >清空列表</span
            >
          </div>
        </div>

        <!-- 歌曲列表 -->
        <ul v-if="curPlayList.length" class="music-list">
          <li
            class="music-item"
            v-for="(music, index) in curPlayList"
            :key="music.id"
            :class="{ 'current-row': curRow == index }"
            @click="handleClickMusicItem(index)"
            @dblclick="handleDBPlayMusic(music)"
          >
            <!-- 当前正在播放/暂停图标 -->
            <div class="icon">
              <!-- 正在播放 -->
              <svg-icon
                v-if="
                  status == !!MusicInfoEnum.MusicPlayStatusEnum.PLAY &&
                  curplayId == music.id
                "
                icon-class="pause"
                color="#FD544E"
                size="15px"
              />
              <!-- 暂停 -->
              <svg-icon
                v-else-if="
                  status == !!MusicInfoEnum.MusicPlayStatusEnum.PAUSE &&
                  curplayId == music.id
                "
                icon-class="play"
                color="#FD544E"
                size="15px"
              />
            </div>

            <!-- 音乐名称  -->
            <div
              :class="{ 'curplay-item': curplayId == music.id }"
              class="music-name oneline-hide"
            >
              <div
                :title="music.name"
                class="oneline-hide"
                :class="{ 'w-50%': music.name.length > 20 }"
              >
                {{ music.name }}
              </div>

              <!-- 歌曲别名 -->
              <el-tooltip
                v-if="music?.alia?.length"
                v-for="alia in music.alia"
                effect="dark"
                :content="alia"
                placement="top"
              >
                <span
                  class="inline-block music-alia oneline-hide"
                  style="max-width: 30%"
                  :key="alia"
                  >（{{ alia }}）</span
                >
              </el-tooltip>

              <!-- vip音乐标签 -->
              <el-tag
                v-if="MusicInfoEnum.MusicFeeTypeEnum.VIP == music.fee"
                class="tag ml-2"
                size="small"
                type="warning"
                >VIP</el-tag
              >
              <!-- 高品质音乐标签 -->
              <el-tag
                v-if="MusicInfoEnum.MusicQualityEnum.HIRES == music.h?.sr"
                class="tag ml-2"
                size="small"
                type="danger"
                >Hi-Res</el-tag
              >
              <!-- 无损音乐SQ -->
              <el-tag
                v-if="MusicInfoEnum.MusicQualityEnum.SQ == music.sq?.sr"
                class="tag ml-2"
                size="small"
                type="danger"
                >SQ</el-tag
              >
              <!-- 是否存在mv -->
              <el-tag
                v-if="music.mv !== 0"
                class="tag ml-2"
                size="small"
                type="danger"
                >MV</el-tag
              >
            </div>

            <!-- 歌手名称 -->
            <div class="singer">
              <el-tooltip
                v-for="singer in music.ar"
                :key="singer.id"
                effect="dark"
                :content="singer.name"
                placement="top"
              >
                <span
                  :class="{ 'curplay-item': curplayId == music.id }"
                  class="singer-name"
                  >{{ singer.name }}</span
                >
              </el-tooltip>
            </div>
            <!-- 播放时长 -->
            <div class="time text-center text-[13px]">
              {{ formatPlayTime(music.dt) }}
            </div>
          </li>
        </ul>

        <!-- 空歌曲列表 -->
        <div v-else class="empty">
          <span>你还没有添加任何歌曲</span>
          <span class="flex"
            >去首页&nbsp;
            <div @click="handleTarget" class="cursor-pointer text-[#23AAF2]">
              发现音乐
            </div></span
          >
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}
:deep(.drawer-container) {
  .el-overlay {
    height: calc(100% - $footerHeight);
  }
  .el-drawer__body {
    height: 100%;
    overflow: hidden;
    padding: 0;
  }
}
.title {
  border-bottom: 2px solid rgba(186, 187, 190, 0.2);
  padding-bottom: 15px;
  margin: 0 20px;
}

.empty {
  height: 300px;
  @include flex-center;
  justify-content: center;
  flex-direction: column;
  span {
    font-size: 15px;
    color: #6d6d6d;
  }
}

// 纵向滚动条
@mixin scroll-bar($width: 10px) {
  /*定义滚动条外层轨道的样式*/
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    // background-color: rgba(255,255,255,0);
  }
  /*定义滚动条整体的样式*/
  &::-webkit-scrollbar {
    width: $width;
    // height: 100px;
    background-color: rgba(255, 255, 255, 0);
  }
  /*滚动条里面可以拖动的那个*/
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.2);
  }
}
.music-list {
  overflow-y: scroll;
  height: calc(100% - 120px);
  @include scroll-bar(10px);
  .music-item {
    position: relative;
    color: #767575;
    height: 42px;
    line-height: 42px;
    cursor: pointer;
    padding-left: 20px;
    @include flex-center;
    justify-content: space-between;
    &:hover {
      background-color: #f1f1f1 !important;
    }

    // 列表偶数数项样式
    &:nth-child(2n) {
      background-color: #fafafa;
    }

    // 正在播放icon
    .icon {
      position: absolute;
      top: 50%;
      left: 16px;
      transform: translateY(-50%);
    }

    // 当前播放的音乐项样式
    .curplay-item {
      color: var(--el-color-primary) !important;
    }

    .music-name {
      flex: 65%;
      @include flex-center;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0 10px 0 20px;
      .music-alia {
        font-size: 12px;
        color: #a7a5a5;
      }
    }

    .singer {
      flex: 20%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      .singer-name {
        color: #929292;
        font-size: 13px;
        &:not(:last-child)::after {
          content: "/";
          padding-left: 5px;
        }
      }
    }
    &:hover .singer .singer-name {
      color: #292929;
    }
    .time {
      flex: 15%;
      text-align: left;
    }
    &:hover .time,
    .singer-name {
      color: #292929;
    }
  }

  // 当前点击行高亮
  .current-row {
    background-color: #e5e5e5 !important;
    &:hover {
      background-color: #e5e5e5 !important;
    }
  }
}

.tag {
  font-size: 8px;
  padding: 0 3px;
  height: 15px;
}
</style>
