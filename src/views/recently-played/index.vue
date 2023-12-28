<script lang="ts" setup>
import * as RecordApi from '@/api/record'
import { formatDate } from '@/utils'
import { CaretRight } from "@element-plus/icons-vue";
import { getRowClass, onTargetPage } from "@/utils/globalMethods";
import { MusicFeeTypeEnum } from "@/enums/MusicInfoEnum";
import { playMusicAction } from '@/utils/music-play-action'
import { useFootStore } from '@/store/modules/foot'
import { useMusicStore } from "@/store/modules/music";
import * as SongApi from "@/api/music";

const musicStore = useMusicStore();
const footStore = useFootStore();
// 音乐列表加载
const loading = ref(false);
// 表格数据
const table = reactive({
  // 表格数据
  data: [],
  // 总条数
  total: 0,
  // 表格头部数据
  columns: [
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
      width: 150,
      label: "播放时间",
      text: "play_time",
    },
  ] as Array<TableColumnData>,
});

onMounted(() => {
  // 获取最近播放歌曲100首
  getRecentlySong();
})

// 获取最近播放歌曲100首
function getRecentlySong() {
  // 开始加载
  loading.value = true;
  RecordApi.getRecentlyMusicList()
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取最近播放歌曲100首失败"));
      }
      table.total = data.total;
      table.data = data.list;
      console.log("获取最近播放歌曲100首成功==>", res.data);
    })
    .catch((err) => {
      console.log("获取最近播放歌曲100首失败==>", err);
      ElMessage.error(err.message || "获取最近播放歌曲100首失败");
    })
    .finally(() => {
      loading.value = false;
    });
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
  const ids = formatAllSongIds(table.data);
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
  return ids.map((item) => item.data.id).join(",")
}

// 双击歌曲列表某一行
const handleDbClickMusicItem = (row: any) => {
  console.log("双击歌曲列表某一行==>", row);
  footStore.isFmPlayMode() && footStore.enterFmMode('music');
  playMusicAction(row.data);
};

defineOptions({
  name: 'RecentlyPlayed'
})
</script>

<template>
  <div class="recently-played">
    <div class="flex items-center">
      <h2 class="mr-20px">最近播放</h2>
      <span class="text-#999999 text-xs">共{{ table.total }}首</span>
    </div>

    <div class="flex items-center justify-between mb-30px">
      <el-button class="play-all" round color="var(--el-color-primary)" @click="handlePlayAllSong">
        <span>播放全部</span>
        <template #icon>
          <svg-icon size="20px" icon-class="bofangliang" color="#fff" />
        </template>
      </el-button>

      <span class="text-15px text-#409eff cursor-pointer">清空列表</span>
    </div>

    <!-- 歌曲列表 -->
    <el-table v-loading="loading" stripe row-key="id" style="width: 100%" empty-text="数据都跑空啦~" :data="table.data"
      highlight-current-row :header-cell-style="getRowClass" @row-dblclick="handleDbClickMusicItem">
      <!-- 索引列 -->
      <el-table-column type="index" align="center" label="序号" width="100" />
      <el-table-column align="left" v-for="(item, index) in table.columns" :key="index" :label="item.label"
        :prop="item.prop" :width="item.width" :min-width="item.minWidth">
        <template #default="{ row }">
          <!-- 音乐名称 -->
          <div class="flex items-center flex-wrap" v-if="item.text === 'music_name'">
            <!-- 免费音乐 -->
            <span v-if="MusicFeeTypeEnum.FREE == row.data.fee ||
              MusicFeeTypeEnum.NONMEMBERFREE == row.data.fee
              " class="cursor-pointer">{{ row.data.name }}</span>
            <!-- VIP音乐 -->
            <span v-if="MusicFeeTypeEnum.VIP == row.data.fee" class="cursor-pointer">{{ row.data.name }}</span>

            <!-- 歌曲别名 -->
            <div v-if="row.data?.alia?.length" class="truncate flex">
              <div v-for="alia in row.data?.alia"
                class="text-xs cursor-pointer text-[rgb(188,188,188)] w-[100px] truncate" :key="alia" :title="alia">（{{
                  alia }}）</div>
            </div>

            <!-- vip音乐标签 -->
            <el-tag class="music-tag vip" v-if="MusicFeeTypeEnum.VIP == row.data.fee">VIP</el-tag>
            <!-- 高品质音乐标签 -->
            <el-tag class="music-tag hi-res" v-if="row.data.h">Hi-Res</el-tag>
            <!-- 无损音乐SQ -->
            <el-tag class="music-tag sq" v-if="row.data.sq">SQ</el-tag>
            <!-- 是否存在mv -->
            <div class="music-tag mv flex items-center justify-center cursor-pointer" v-if="row.data.mv !== 0"
              @click="onTargetPage('/video/mv-detail', { mvid: row.data.mv })">
              MV<el-icon>
                <CaretRight />
              </el-icon>
            </div>
          </div>

          <!-- 歌手名称（可能存在多个歌手） -->
          <div class="oneline-hide" v-if="item.text === 'singer'">
            <span :title="singer.name" class="singer cursor-pointer" v-for="singer in row.data.ar" :key="singer.id">{{
              singer.name
            }}</span>
          </div>

          <!-- 播放时间 -->
          <div v-if="item.text === 'play_time'">
            {{ formatDate(row.playTime, 'YYYY-MM-DD') }}
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

<style lang="scss" scoped>
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

// 每个歌手后面都加一个 “/”，最后一个除外
.singer {
  &:not(:last-child)::after {
    content: "/";
    padding-left: 5px;
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