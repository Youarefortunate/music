<script lang="ts" setup>
import { ArrowUp, ArrowDown, FolderAdd } from "@element-plus/icons-vue";
import MusicDetail from "./modules/MusicDetail.vue";
import CurPlayList from "./modules/CurPlayList.vue";
import { useMusicStore } from "@/store/modules/music";
import { useFootStore } from "@/store/modules/foot";
import { storeToRefs } from "pinia";
import * as MusicInfoEnum from "@/enums/MusicInfoEnum";
import { isEmptyObject } from "@/utils";
import { DeleteFilled } from "@element-plus/icons-vue";
// import type { CSSProperties } from "vue";

// type SliderMarks = Record<number, string | { style: CSSProperties; label: any }>
type Arrayable<T> = T | T[]

// 音乐store
const musicStore = useMusicStore();
const footStore = useFootStore();
const { status, showMusicDetail, showCurPlayList, curPlayMode } =
  storeToRefs(musicStore);
const { footMode } = storeToRefs(footStore);
const MusicDetailRef = ref();
const CurPlayListRef = ref();
// 音乐播放模式
const musicPlayType = [
  {
    name: "顺序播放",
    mode: MusicInfoEnum.MusicPlayModeEnum.ORDER,
    icon: "liebiaoxunhuan",
  },
  {
    name: "单曲循环",
    mode: MusicInfoEnum.MusicPlayModeEnum.LOOP,
    icon: "danquxunhuan",
  },
  {
    name: "随机播放",
    mode: MusicInfoEnum.MusicPlayModeEnum.RANDOM,
    icon: "suijibofang",
  },
];

// 当前播放进度
const currentTime = computed<number | string>(() => {
  return musicStore.formatTime(musicStore.audioInfo.currentTime);
});
// 总时长
const duration = computed<number | string>(() => {
  return musicStore.formatTime(musicStore.audioInfo.duration);
});

// 音乐封面
const poster = computed(() => {
  return (
    musicStore.curMusicRecord.al?.picUrl ||
    musicStore.curMusicRecord?.album?.picUrl
  );
});

// 歌手名称
const artistsName = computed(() => {
  const ar = musicStore.curMusicRecord?.ar;
  const artists = musicStore.curMusicRecord?.artists;
  // 两个都为空数组或者未定义
  if (!!ar && !!artists) return;
  const artistsList = ar != undefined ? ar : artists;
  return artistsList;
});

// 显示音乐详情页
const handleShowMusicDetail = (visible: boolean) => {
  // MusicDetailRef.value!.show(visible);
  footStore.showMusicDetail(visible);
};

// 开始播放
const handlePlay = () => {
  if (isEmptyObject(musicStore.curMusicRecord)) {
    console.error("当前播放记录为空，还没有指定播放那首歌曲");
    return;
  }
  status.value ? musicStore.pause() : musicStore.play();
};

// 上一首
const handlePrevious = () => {
  musicStore.previous();
};

// 下一首
const handleNext = () => {
  // 这里可以监听每次歌曲切换都会改变的playIndex或curplayId(在私人fm页面中监听)，当发现变化时私人fm哪里进行切换下一首歌曲的动画即可，这里我懒得做了
  if (footStore.isFmPlayMode()) return;
  musicStore.next();
};

// 滑动进度条(slider), 完成一次拖动后触发的事件(@change)
const handleSliderChange = (val: Arrayable<number>) => {
  musicStore.sliderChange(val as number);
};

// 显示当前播放列表
const handleShowCurPlayList = () => {
  showCurPlayList.value = !showCurPlayList.value;
};
</script>

<template>
  <div class="footer-music-control overflow-hidden">
    <!-- 左侧音乐海报、歌名、作者 v-show="musicStore.curPlayList.length" -->
    <div class="left-song-poster h-[100px] flex-1">
      <!-- 显示音乐详情页左侧操作栏 -->
      <div
        :class="{ 'show-music-detail': showMusicDetail }"
        style="transform: translateY(-100px)"
        class="h-[100px] flex items-center"
      >
        <div
          class="arrow-down cursor-pointer mr-[20px]"
          @click="handleShowMusicDetail(false)"
        >
          <el-icon size="23">
            <ArrowDown />
          </el-icon>
        </div>

        <div style="display: none" class="action flex items-center">
          <!-- 喜欢该歌曲/音乐 -->
          <div v-if="true" class="like-music cursor-pointer action-item">
            <el-tooltip effect="dark" content="喜欢该歌曲" placement="top">
              <svg-icon size="30px" icon-class="like-music" />
            </el-tooltip>
          </div>

          <!-- 取消喜欢该歌曲/音乐 -->
          <div v-else class="unlike-music cursor-pointer action-item">
            <el-tooltip effect="dark" content="取消喜欢该歌曲" placement="top">
              <svg-icon
                color="rgb(236,65,65)"
                size="30px"
                icon-class="unlike-music"
              />
            </el-tooltip>
          </div>

          <!-- 收藏该歌曲 -->
          <div class="collect cursor-pointer action-item">
            <el-tooltip
              effect="dark"
              content="收藏该歌曲该歌曲"
              placement="top"
            >
              <el-icon size="20">
                <FolderAdd />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- 不显示音乐详情页左侧操作栏 -->
      <div
        :class="{ 'hidden-music-detail': !showMusicDetail }"
        class="h-[100px] flex items-center"
      >
        <div class="poster" @click="handleShowMusicDetail(true)">
          <img
            v-if="!isEmptyObject(musicStore.curMusicRecord)"
            :src="`${poster}?param='52y52`"
            class="w-13 h-13 object-contain rounded"
          />

          <!-- 未知封面图 -->
          <el-image v-else style="width: 100%; height: 100%" />

          <div
            class="arrao-up rounded"
            v-show="!isEmptyObject(musicStore.curMusicRecord)"
          >
            <el-icon size="25" color="rgba(255,255,255,.5)">
              <ArrowUp />
            </el-icon>
          </div>
        </div>
        <div class="h-13 oneline-hide" @click="handleShowMusicDetail(true)">
          <div class="text-4 mb-[5px] cursor-pointer">
            {{ musicStore.curMusicRecord.name ?? "未知歌曲" }}
          </div>
          <div class="text-xs">
            <span
              v-if="artistsName?.length"
              v-for="alia in artistsName"
              class="singer-name cursor-pointer oneline-hide"
              style="max-width: 30%"
              :key="alia.id"
              >{{ alia.name }}</span
            >
            <span v-else>未知歌手</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间进度条控制器、上一首、下一首、歌曲播放循序 -->
    <div class="center-music-control flex-1">
      <!-- 控制器 -->
      <div class="control flex items-center justify-around gap-x-3">
        <!-- 列表循环播放、单曲循环、随机播放 -->
        <div class="list-loop cursor-pointer text-6" v-if="footMode == 'music'">
          <svg-icon
            :key="index"
            v-for="(item, index) in musicPlayType"
            v-show="curPlayMode == item.mode"
            :icon-class="item.icon"
            @click="musicStore.setMusicPlayMode(item)"
          />
        </div>

        <!-- 垃圾桶 -->
        <div
          v-else
          class="delete cursor-pointer flex items-center justify-center"
          title="将该首歌丢入垃圾桶"
        >
          <el-icon size="20">
            <DeleteFilled />
          </el-icon>
        </div>

        <!-- 上一首 -->
        <div
          class="previous cursor-pointer text-8"
          :class="{ 'no-allow-prev': footMode == 'fm' }"
          @click="handlePrevious"
        >
          <svg-icon icon-class="previous" />
        </div>
        <!-- 暂停/开始播放 -->
        <div class="play cursor-pointer text-6" @click="handlePlay">
          <svg-icon
            :icon-class="
              status == !!MusicInfoEnum.MusicPlayStatusEnum.PAUSE
                ? 'play'
                : 'pause'
            "
          />
        </div>
        <!-- 下一首 -->
        <div class="next cursor-pointer text-8" @click="handleNext">
          <svg-icon icon-class="next" />
        </div>

        <!-- 调节音量 -->
        <el-popover
          popper-class="volume-popover"
          placement="top"
          width="30px"
          trigger="click"
          popper-style="min-width: 50px;"
        >
          <template #reference>
            <div class="voice cursor-pointer text-6" style="line-height: 1">
              <svg-icon
                :size="musicStore.muted ? '32px' : ''"
                :icon-class="musicStore.muted ? 'jingyin' : 'shengyin'"
              />
            </div>
          </template>
          <div class="music-volume flex flex-col items-center pt-2">
            <div class="volume-slider">
              <el-slider
                vertical
                :min="0"
                :max="100"
                height="100px"
                :show-tooltip="false"
                v-model="musicStore.volume"
                size="small"
                @input="musicStore.setVolume"
              />
            </div>

            <div class="text-sm mt-3">{{ musicStore.volume }}</div>
            <div class="mt-2"></div>
          </div>
        </el-popover>
      </div>

      <!-- 进度条滑块 @input="handleSliderChange" -->
      <div class="slider relative text-xs">
        <div class="start-time absolute">
          {{ currentTime }}
        </div>
        <el-slider
          :step="0.1"
          height="4"
          :min="0"
          v-model="musicStore.audioInfo.currentTime"
          :max="musicStore.audioInfo.duration"
          :show-tooltip="false"
          @change="handleSliderChange"
        />
        <div class="end-time absolute">
          {{ duration }}
        </div>
      </div>
    </div>

    <!-- 右侧播放列表按钮 v-show="musicStore.curPlayList.length" -->
    <div class="right-play-list flex-1" v-show="footMode == 'music'">
      <div class="play-list text-6">
        <svg-icon
          @click="handleShowCurPlayList"
          class="cursor-pointer"
          icon-class="bofangliebiao"
        />
      </div>
    </div>
    <!-- 当前播放列表 -->
    <CurPlayList ref="CurPlayListRef" />
  </div>

  <!-- 音乐详情页 -->
  <MusicDetail ref="MusicDetailRef" />
</template>

<style lang="scss" scoped>
.footer-music-control {
  // box-shadow:  -16px -16px 32px #c3c3c3,
  //            16px 16px 32px #fdfdfd;
  width: 100%;
  min-width: 900px;
  height: $footerHeight;
  background-color: rgba(255, 255, 255);
  position: fixed;
  bottom: 0;
  border-top: 2px solid rgba(239, 235, 235, 0.8);
  left: 0;
  // 底部播放器层级要比音乐详情页高
  z-index: 3001;
  padding: 0 20px;

  // display: flex;
  // align-items: center;
  // justify-content: center;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
}

.left-song-poster {
  grid-area: "left";

  .poster {
    position: relative;
    margin-right: 10px;
    cursor: pointer;
    border: 2px solid rgba(193, 193, 193, 0.5);
    border-radius: 0.25em;
    width: 3.5rem;
    height: 3.5rem;

    .arrao-up {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3.25em;
      line-height: 3.25em;
      text-align: center;
      opacity: 0;
      transition: opacity 0.2s ease-in;
      background-color: rgba(53, 28, 42, 0.6);
    }

    &:hover .arrao-up {
      opacity: 1;
    }
  }

  .singer-name {
    &:not(:last-child)::after {
      content: "/";
      padding: 0 5px;
    }
  }

  .action-item {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c3c3c3;
    margin-right: 15px;
    transition: transform 0.3s ease-in;

    &:hover {
      background-color: rgba(245, 245, 245, 0.9);
    }
  }
}

// 不显示音乐详情页
.hidden-music-detail {
  transform: translateY(-100px);
  transition: transform 0.45s ease;
}

// 显示音乐详情页
.show-music-detail {
  padding-left: 15px;
  transform: translateY(0px) !important;
  transition: transform 0.45s ease;
}

.control {
  padding: 0 20%;

  .play {
    width: 40px;
    height: 40px;
    background-color: rgb(245, 245, 245);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgb(229, 229, 229);
    }
  }

  .no-allow-prev {
    pointer-events: none;
    color: #d6d6d6;
  }

  .list-loop,
  .delete,
  .previous,
  .next,
  .voice {
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.center-music-control {
  min-width: 450px;
  grid-area: "center";
}

.volume-popover {
}

.right-play-list {
  grid-area: "right";
  text-align: right;

  .cursor-pointer:hover {
    color: var(--el-color-primary);
  }
}

.slider {
  padding: 0 50px;

  .start-time,
  .end-time {
    color: rgb(196, 195, 195);
  }

  .start-time {
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    //transform: translate(5%, -50%);
  }

  .end-time {
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}

// 滑块进度条穿透样式
:deep(.slider) {
  $sliderH: 5px;
  $sliderBtn: calc($sliderH + 5px);
  $sliderBtnWrapper: 36px;

  .el-slider__bar {
    height: $sliderH;
  }

  .el-slider__runway {
    height: $sliderH;
  }

  .el-slider__button {
    width: $sliderBtn !important;
    height: $sliderBtn !important;
    // background-color: #409eff;
  }

  .el-slider__button-wrapper {
    width: $sliderBtnWrapper;
    height: $sliderBtnWrapper;
    // top: -calc(#{$sliderBtnWrapper} / 2 + #{$sliderH} / 2) !important;
    opacity: 0;
  }

  .el-slider__runway {
    &:hover .el-slider__button-wrapper {
      opacity: 1;
    }
  }
}

// 进度条样式穿透，hover移入进度条变粗
:deep(.progress) {
  .el-progress-bar {
    .el-progress-bar__outer {
      &:hover {
        // height: 6px !important;
        cursor: pointer;
      }
    }
  }
}
</style>
