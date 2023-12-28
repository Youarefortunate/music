<script setup lang="ts">
import { useRoute } from "vue-router";
import * as MusicInfoEnum from "@/enums/MusicInfoEnum";
import { formatPlayTime } from "@/utils";
import { getRowClass } from "@/utils/globalMethods";
// import { openMenu } from "@/utils/contextmenu";
import { getCurrentInstance, ComponentInternalInstance } from "vue";
import { ElMessageBox } from 'element-plus'
import { CaretRight, Download, ChatLineSquare } from "@element-plus/icons-vue";
import * as SearchMusicEnum from "@/enums/SearchMusicEnum";
import { search } from "./index";
import { useMusicStore } from "@/store/modules/music";
import { useFootStore } from '@/store/modules/foot'
import { storeToRefs } from "pinia";

const musicStore = useMusicStore();
const footStore = useFootStore();
const { curPlayList } = storeToRefs(musicStore);
const route = useRoute();
// 音乐列表加载
const loading = ref(false);
// 搜索音乐请求参数
const queryParams = reactive({
  // 总搜索数量
  total: 0,
  // 一次返回50条数据
  limit: 50,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
  // 搜索关键字
  keywords: "",
  // 搜索的音乐类型，默认搜索单曲
  type: SearchMusicEnum.SearchMusicType.single,
});
// 表格数据
const table = reactive({
  // 表格数据
  data: [],
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
      label: "专辑",
      text: "album",
      minWidth: 100,
    },
    {
      label: "时长",
      text: "music_time",
    },
    {
      label: "热度",
      text: "pop",
      minWidth: 60,
    },
  ] as Array<TableColumnData>,
});
// 当前鼠标右击音乐信息
const curRowMusic = ref<any>({});
// 右键菜单是否可见
const actionVisble = ref(false);
// 弹窗显示的位置
const rect = reactive({
  left: 0,
  top: 0,
});
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
watch(actionVisble, (value) => {
  if (value) {
    document.body.addEventListener("click", () => (actionVisble.value = false));
  } else {
    document.body.removeEventListener(
      "click",
      () => (actionVisble.value = false)
    );
  }
});

onMounted(() => {
  // 搜索音乐
  getSearchMusic();
});

watch(
  () => route.query,
  (newVal) => {
    if (newVal) {
      queryParams.keywords = newVal.keywords as string;
      queryParams.type =
        newVal.type as unknown as SearchMusicEnum.SearchMusicType;
    }
  },
  { immediate: true }
);

// 搜素音乐
function getSearchMusic() {
  // 开始加载
  loading.value = true;
  // 获取搜索歌曲
  search({
    keywords: queryParams.keywords,
    limit: queryParams.limit,
    offset: queryParams.offset,
    type: queryParams.type,
  })
    .then((res) => {
      queryParams.total = res?.songCount || 0;
      table.data = res?.songs || [];
      console.log("搜素音乐成功==>", res);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 播放当前搜索到的第一页的全部歌曲
const handlePlayAllSong = () => {
  ElMessageBox.confirm(
    "一键播放当前搜索到的第一页的全部音乐将会覆盖掉之前的播放记录，是否继续",
    "播放当前搜索到的第一页的全部歌曲",
    {
      confirmButtonText: "继续",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    // 将当前搜索到的第一页的全部歌曲添加到播放列表
    curPlayList.value = table.data;
    // 设置播放
    musicStore.setCurMusicRecord(table.data[0], 0);
  });
};

// 鼠标右键打开操作菜单，当某一行被鼠标右键点击时会触发该事件
const handleOpenActionMenu = (row: any, column: any, event: MouseEvent) => {
  event.preventDefault();
  // console.log("鼠标右键打开操作菜单==>", row, column, event);
  curRowMusic.value = row;
  openMenu(event);
};

function openMenu(e: MouseEvent) {
  // 弹窗的最小宽度
  const menuMinWidth = 120;
  // 鼠标右键评论项距离视口左侧的距离
  const offsetLeft = proxy?.$el.parentElement?.getBoundingClientRect().left;
  // 鼠标右键评论项的宽度width
  const offsetWidth = proxy?.$el.offsetWidth;
  const maxLeft = offsetWidth - menuMinWidth;
  const l = e.clientX - offsetLeft + 30;

  if (l > maxLeft) {
    rect.left = maxLeft;
  } else {
    rect.left = l;
  }
  rect.top = e.pageY + 5;
  actionVisble.value = true;
}

/**
 * 查看歌曲评论
 */
const handleShowMusicComment = () => {
  play(curRowMusic.value)
  musicStore.showMusicDetail = true;
  footStore.isFmPlayMode() && footStore.enterFmMode('music');
};

/**
 * 右键播放该音乐
 * @description 首先判断这一首歌在存不存在播放列表中，存在：则直接通过playIndex播放该首音乐，不存在则添加到当前播放音乐的下一首歌曲位置
 */
const handlePlay = () => {
  // some符合一项条件返回true的则返回true
  play(curRowMusic.value)
  footStore.isFmPlayMode() && footStore.enterFmMode('music');
};

/**
 * 将该音乐设置为下一首播放
 * @description 首先判断这一首歌在存不存在播放列表中，存在：则将这首歌先删除，再移动到当前播放音乐的下一首歌曲位置
 * 不存在：则直接添加到当前播放音乐的下一首歌曲位置
 */
const handleNextPlay = () => {
  // 歌曲不存在当前播放的音乐列表中，获取当前播放下标
  const index = Number(musicStore.playIndex);
  // 要播放的音乐存在于当前音乐播放列表中
  if (hasMusic(curRowMusic.value)) {
    curPlayList.value.forEach((item, i) => {
      if (item.id === curRowMusic.value.id) {
        // 先删除原歌曲所在的位置
        curPlayList.value.splice(i, 1);
        // 再重新追加到当前播放音乐的下一首歌曲位置
        curPlayList.value.splice(index + 1, 0, curRowMusic.value);
      }
    });
  } else {
    // 当前播放列表没有歌曲，直接追加
    if (index == -1 && curPlayList.value.length == 0) {
      curPlayList.value.push(curRowMusic.value);
      return musicStore.setCurMusicRecord(curRowMusic.value, 0);
    }
    // 该歌曲不在当前播放的音乐列表中，直接追加到当前播放音乐的下一首歌曲位置
    curPlayList.value.splice(index + 1, 0, curRowMusic.value);
  }
};

// 双击歌曲列表某一行
const handleDbClickMusicItem = (row: any) => {
  console.log("双击歌曲列表某一行Single==>", row);
  footStore.isFmPlayMode() && footStore.enterFmMode('music');
  play(row)
};

/**
 * 播放音乐公共函数
 */
function play(curRecord: any) {
  // 要播放的音乐存在于当前音乐播放列表中
  if (hasMusic(curRecord)) {
    curPlayList.value.forEach((item, index) => {
      if (item.id === curRecord.id) {
        // 通过下标直接播放该歌曲
        musicStore.setMusic(index);
      }
    });
  } else {
    // 歌曲不存在当前播放的音乐列表中，获取当前播放下标
    const index = Number(musicStore.playIndex);
    // 当前播放列表没有歌曲，直接追加
    if (index == -1 && curPlayList.value.length == 0) {
      curPlayList.value.push(curRecord);
      return musicStore.setCurMusicRecord(curRecord, 0);
    }
    curPlayList.value.forEach((item, i) => {
      if (i === index) {
        curPlayList.value.splice(i + 1, 0, curRecord);
        musicStore.setMusic(i + 1);
      }
    });
  }
}

/**
 * 当前音乐播放列表是否存在该首音乐
 * @returns {Boolean} true存在 false不存在
 */
function hasMusic(record: any): boolean {
  return curPlayList.value.some((item: any) => item.id === record.id);
}

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  getSearchMusic();
};

defineOptions({
  name: "Single",
});
</script>

<template>
  <!-- 单曲 -->
  <div class="single" v-loading="loading">
    <div class="flex items-center justify-between mb-20px">
      <div class="mr-[10px]">
        <el-button class="play-all" round color="var(--el-color-primary)" @click="handlePlayAllSong">
          <span>播放全部</span>
          <template #icon>
            <svg-icon size="20px" icon-class="bofangliang" color="#fff" />
          </template>
        </el-button>

        <el-button round plain @click="TTUL('下载功能暂未实现')">
          <span>下载全部</span>
          <template #icon>
            <el-icon size="20">
              <Download />
            </el-icon>
          </template>
        </el-button>
      </div>

      <span class="text-xs text-#696969">找到（{{ queryParams.total }}）首单曲</span>
    </div>

    <el-table stripe row-key="id" style="width: 100%" empty-text="数据都跑空啦~" :data="table.data" highlight-current-row
      :header-cell-style="getRowClass" @row-contextmenu="handleOpenActionMenu" @row-dblclick="handleDbClickMusicItem">
      <!-- 索引列 -->
      <el-table-column type="index" align="left" label="序号" width="60" />
      <el-table-column :align="item.text != 'music_name' ? 'center' : 'left'" v-for="(item, index) in table.columns"
        :key="index" :label="item.label" :prop="item.prop" :width="item.width" :min-width="item.minWidth">
        <template #default="{ row }">
          <!-- 音乐名称 -->
          <div class="flex items-center flex-wrap" v-if="item.text === 'music_name'">
            <!-- 免费音乐 -->
            <el-tooltip effect="dark" :content="row.name" v-if="MusicInfoEnum.MusicFeeTypeEnum.FREE == row.fee ||
              MusicInfoEnum.MusicFeeTypeEnum.NONMEMBERFREE == row.fee
              " placement="top">
              <div class="oneline-hide" :class="{ 'w-180px': row.name.length > 20 }">
                {{ row.name }}
              </div>
            </el-tooltip>

            <!-- VIP音乐 -->
            <el-tooltip effect="dark" v-if="MusicInfoEnum.MusicFeeTypeEnum.VIP == row.fee" :content="row.name"
              placement="top">
              <div class="oneline-hide" :class="{ 'w-180px': row.name.length > 20 }">
                {{ row.name }}
              </div>
            </el-tooltip>

            <!-- 歌曲别名 -->
            <el-tooltip v-if="row.alia.length" v-for="alia in row.alia" effect="dark" :content="alia" placement="top">
              <div :class="{ 'w-100px': alia.length > 10 }" class="text-xs text-[rgb(188,188,188)] oneline-hide"
                :key="alia">
                （{{ alia }}）
              </div>
            </el-tooltip>

            <!-- vip音乐标签 -->
            <span class="music-tag vip" v-if="MusicInfoEnum.MusicFeeTypeEnum.VIP == row.fee">VIP</span>
            <!-- 高品质音乐标签 -->
            <span class="music-tag hi-res" v-if="MusicInfoEnum.MusicQualityEnum.HIRES == row.h?.sr">Hi-Res</span>
            <!-- 无损音乐SQ -->
            <span class="music-tag sq" v-if="MusicInfoEnum.MusicQualityEnum.SQ == row.sq?.sr">SQ</span>
            <!-- 是否存在mv -->
            <div class="music-tag mv flex items-center justify-center cursor-pointer" v-if="row.mv !== 0"
              @click="onTargetPage('/video/mv-detail', { mvid: row.mv })">
              MV<el-icon>
                <CaretRight />
              </el-icon>
            </div>
          </div>

          <!-- 歌手名称（可能存在多个歌手） -->
          <div v-if="item.text === 'singer'" class="truncate cursor-default">
            <span class="singer" v-if="row.ar.length" v-for="singer in row.ar" :key="singer.id" :title="singer.name">
              {{ singer.name }}
            </span>
          </div>

          <!-- 专辑名称（深层对象） -->
          <div v-if="item.text === 'album'">
            <div :class="{ 'w-[100px]': row.al?.name.length > 100 }"
              class="text-xs block cursor-pointer text-[rgb(188,188,188)] oneline-hide" :title="row.al?.name"
              @click="onTargetPage('/album/album-detail', { albumId: row.al?.id })">{{
                row.al?.name == "" ? "该专辑暂无名称" : row.al?.name
              }}</div>
          </div>

          <!-- 音乐时长 -->
          <div v-if="item.text === 'music_time'">
            {{ formatPlayTime(row.dt) }}
          </div>

          <!-- 歌曲热度 -->
          <div v-if="item.text === 'pop'">
            <el-progress color="#C4C4C5" :percentage="row?.pop" :show-text="false" :stroke-width="7" />
          </div>

          <!-- 展示其他不需要处理的项 -->
          <div v-if="item.prop != undefined">
            {{ row[item.prop] ?? "暂无数据" }}
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 @pagination="handlePagination" -->
    <pagination :total="queryParams.total" v-model:limit="queryParams.limit" v-model:page="queryParams.pageNum"
      @pagination="handlePagination" />

    <!-- 鼠标右键显示操作弹窗 -->
    <div v-show="actionVisble" class="action-menu" :style="{ left: rect.left + 'px', top: rect.top + 'px' }">
      <div class="action flex items-center" @click="handleShowMusicComment">
        <el-icon>
          <ChatLineSquare />
        </el-icon>
        <span class="ml-[10px]">查看评论(Comment)</span>
      </div>

      <div class="action flex items-center" @click="handlePlay">
        <el-icon>
          <ChatLineSquare />
        </el-icon>
        <span class="ml-[10px]">播放(Play)</span>
      </div>

      <div class="action flex items-center" @click="handleNextPlay">
        <el-icon>
          <ChatLineSquare />
        </el-icon>
        <span class="ml-[10px]">下一首播放(Next Play)</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.single {

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

// 每个歌手后面都加一个 “/”，最后一个除外
.singer {
  &:not(:last-child)::after {
    content: "/";
    padding: 0 5px;
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

.action-menu {
  position: absolute;
  z-index: 99;
  font-size: 12px;
  padding: 10px 0;
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
