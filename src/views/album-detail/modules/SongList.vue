<script setup lang="ts">
import { formatPlayTime } from "@/utils";
import { CaretRight } from "@element-plus/icons-vue";
import { getRowClass } from "@/utils/globalMethods";
import { MusicFeeTypeEnum, MusicQualityEnum } from "@/enums/MusicInfoEnum";
import { playMusicAction } from '@/utils/music-play-action'

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
  songs: {
    type: Array,
    default: () => [],
  }
});
// 歌单歌曲列表加载
const loading = ref(false);

// 表格数据
const table = reactive({
  // 表格数据
  data: [] as any,
  // 表格头部数据
  columns: [
    {
      label: "音乐标题",
      text: "music_name",
      minWidth: 200,
    },
    {
      label: "歌手",
      text: "singer",
    },
    {
      label: "歌手专辑",
      text: "al",
    },
    {
      label: "音乐时长",
      text: "music_time",
    },
  ] as Array<TableColumnData>,
});

watch(
  () => props.songs,
  (newVal) => {
    if (newVal.length) {
      table.data = newVal;
    }
  },
  { immediate: true }
);

// 双击歌曲列表某一行
const handleDbClickMusicItem = (row: any) => {
  console.log("双击歌曲列表某一行==>", row);
  playMusicAction(row)
};

defineOptions({
  name: "AlbumSongList",
});
</script>

<template>
  <div v-loading="loading" class="songs-list">
    <el-table
      stripe
      row-key="id"
      style="width: 100%"
      empty-text="数据都跑空啦~"
      :data="table.data"
      highlight-current-row
      :header-cell-style="getRowClass"
      @row-dblclick="handleDbClickMusicItem"
    >
      <!-- 索引列 -->
      <el-table-column type="index" align="center" label="序号" width="100" />
      <el-table-column
        align="left"
        v-for="(item, index) in table.columns"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        :width="item.width"
        :min-width="item.minWidth"
      >
        <template #default="{ row }">
          <!-- 音乐名称 -->
          <div
            class="flex items-center flex-wrap"
            v-if="item.text === 'music_name'"
          >
            <!-- 免费音乐 -->
            <span
              v-if="
                MusicFeeTypeEnum.FREE == row.fee ||
                MusicFeeTypeEnum.NONMEMBERFREE == row.fee
              "
              >{{ row.name }}</span
            >
            <!-- VIP音乐 -->
            <span v-if="MusicFeeTypeEnum.VIP == row.fee">{{ row.name }}</span>

            <!-- 歌曲别名 -->
            <el-tooltip
              v-if="row.alia.length"
              v-for="alia in row.alia"
              effect="dark"
              :content="alia"
              placement="top"
            >
              <span
                class="text-xs text-[rgb(188,188,188)] w-[100px] oneline-hide"
                :key="alia"
                >（{{ alia }}）</span
              >
            </el-tooltip>

            <!-- vip音乐标签 -->
            <el-tag class="music-tag vip" v-if="MusicFeeTypeEnum.VIP == row.fee"
              >VIP</el-tag
            >
            <!-- 高品质音乐标签 -->
            <el-tag
              class="music-tag hi-res"
              v-if="MusicQualityEnum.HIRES == row.h?.sr"
              >Hi-Res</el-tag
            >
            <!-- 无损音乐SQ -->
            <el-tag class="music-tag sq" v-if="MusicQualityEnum.SQ == row.sq?.sr"
              >SQ</el-tag
            >
            <!-- 是否存在mv -->
            <div
              class="music-tag mv flex items-center justify-center cursor-pointer"
              v-if="row.mv !== 0"
              @click="onTargetPage('/video/mv-detail', { mvid: row.mv })"
            >
              MV<el-icon><CaretRight /></el-icon>
            </div>
          </div>

          <!-- 歌手名称（可能存在多个歌手） -->
          <div class="oneline-hide" v-if="item.text === 'singer'">
            <span :title="singer.name" class="singer cursor-pointer" v-for="singer in row.ar" :key="singer.id">{{
              singer.name
            }}</span>
          </div>

          <!-- 专辑名称（深层对象） -->
          <div class="oneline-hide cursor-pointer" :title="row.al?.name" v-if="item.text === 'al'">
            {{ row.al?.name == "" ? "该专辑暂无名称" : row.al?.name }}
          </div>

          <!-- 音乐时长 -->
          <div v-if="item.text === 'music_time'">
            {{ formatPlayTime(row.dt) }}
          </div>

          <!-- 展示其他不需要处理的项 -->
          <div v-if="item.prop != undefined">
            {{ row[item.prop] ?? "暂无数据" }}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
// 每个歌手后面都加一个 “/”，最后一个除外
.singer {
  &:not(:last-child)::after {
    content: "/";
    padding-left: 5px;
  }
}

//
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
