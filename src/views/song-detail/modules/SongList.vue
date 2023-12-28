<script setup lang="ts">
import { formatPlayTime } from "@/utils";
import * as SongApi from "@/api/music";
import { ElMessage } from "element-plus";
import { CaretRight } from "@element-plus/icons-vue";
import { getRowClass, onTargetPage } from "@/utils/globalMethods";
import { MusicFeeTypeEnum, MusicQualityEnum } from "@/enums/MusicInfoEnum";
import { playMusicAction } from "@/utils/music-play-action";
import { useFootStore } from "@/store/modules/foot";

const props = defineProps({
  // 歌单id
  songId: {
    type: String,
    default: "",
  },
  playlist: {
    type: Object,
    default: () => {},
  },
});
const footStore = useFootStore();
// 歌单歌曲列表加载
const loading = ref(false);

// 获取所有歌曲请求参数
const queryParams = reactive({
  // 总歌曲数量
  total: props.playlist!.trackCount,
  // 一次返回50条数据
  limit: 50,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
});

// 表格数据
const table = reactive({
  // 表格数据
  data: [],
  // 歌曲特殊权限
  privileges: [],
  // 表格头部数据
  columns: [
    // {
    //   label: "操作",
    //   text: "action",
    //   width: 70,
    // },
    {
      label: "音乐名称",
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
      width: 120,
    },
  ] as Array<TableColumnData>,
  // 溢出 tooltip 的选项，
  tooltipOptions: {
    // Tooltip 组件出现的位置
    placement: "top",
  },
});

watch(
  () => props.songId,
  (newVal) => {
    if (newVal) {
      loadSongList();
    }
  },
  { immediate: true }
);

// 加载歌曲列表
function loadSongList() {
  // 开始加载
  loading.value = true;
  // 获取歌单全部歌曲
  SongApi.getSongListAllSong({
    id: props.songId,
    limit: queryParams.limit,
    offset: queryParams.offset,
  })
    .then((res) => {
      const { code, privileges, songs } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取歌单全部歌曲失败"));
      }
      table.privileges = privileges;
      // 表格数据
      table.data = songs;
      console.log("获取歌单全部歌曲成功==>", res.data);
    })
    .catch((err) => {
      console.log("获取歌单全部歌曲失败==>", err);
      ElMessage.error(err.message || "获取歌单全部歌曲失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

// 双击歌曲列表某一行
const handleDbClickMusicItem = (row: any) => {
  console.log("双击歌曲列表某一行==>", row);
  footStore.isFmPlayMode() && footStore.enterFmMode("music");
  playMusicAction(row);
};

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  loadSongList();
};

defineExpose({
  queryParams,
});

defineOptions({
  name: "SongList",
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
      :tooltip-options="table.tooltipOptions"
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
          <!-- 表格操作 -->
          <!-- <div v-if="item.text === 'action'">
            <el-tooltip
              v-if="row.no == 0"
              effect="dark"
              content="喜欢该歌曲"
              placement="top"
            >
              <svg-icon
                class="cursor-pointer"
                size="25px"
                icon-class="like-music"
              />
            </el-tooltip>

            <el-tooltip
              v-else
              effect="dark"
              content="取消喜欢该歌曲"
              placement="top"
            >
              <svg-icon
                class="cursor-pointer"
                color="rgb(236,65,65)"
                size="25px"
                icon-class="unlike-music"
              />
            </el-tooltip>
          </div> -->

          <!-- 音乐名称 -->
          <div
            class="flex items-center flex-wrap"
            v-if="item.text === 'music_name'"
          >
            <!-- 音乐封面 -->
            <div class="w-50px h-50px mr-10px">
              <el-image
                class="w-full h-full rounded-5px"
                style="border: 2px solid #eee"
                :src="row?.al?.picUrl + '?param=100y100'"
              />
            </div>

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
                class="text-xs text-[rgb(188,188,188)] w-[100px] truncate"
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
            <el-tag
              class="music-tag sq"
              v-if="MusicQualityEnum.SQ == row.sq?.sr"
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
            <span
              :title="singer.name"
              class="singer cursor-pointer"
              v-for="singer in row.ar"
              :key="singer.id"
              >{{ singer.name }}</span
            >
          </div>

          <!-- 专辑名称（深层对象） -->
          <div
            class="oneline-hide cursor-pointer"
            :title="row.al?.name"
            v-if="item.text === 'al'"
          >
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

    <!-- 分页组件 -->
    <pagination
      :total="queryParams.total"
      v-model:limit="queryParams.limit"
      v-model:page="queryParams.pageNum"
      @pagination="handlePagination"
    />
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
  max-width: 50px;
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
