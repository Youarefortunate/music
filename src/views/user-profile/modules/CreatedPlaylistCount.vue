<script setup lang="ts">
import { toRefs } from "vue";
import { useNumberFormat } from "@/utils";
import _ from "lodash";
import * as SongListApi from "@/api/songList";

const props = defineProps({
  // 是否还存在更多歌单数据
  more: Boolean,
  // 歌单列表
  playList: {
    required: true,
    type: Array<any>,
    default: () => [],
  },
  // 获取用户歌单列表参数
  songListInfo: {
    type: Object,
    default: () => ({}),
  },
});

// 响应式解构
const { uid, limit, offset } = toRefs(props.songListInfo);

// 数据加载
const loading = ref(false);
// 分页组件参数
const pageInfo = reactive({
  pageNum: 1,
  // 当more为true时，总条数
  total: 0,
  // 是否存在更多数据
  hasMore: false,
  noMoreList: [] as Array<any>,
});

// 列表
const list = ref<Array<any>>([]);

// 只有当重新获取用户歌单时才会触发watch
watch(
  () => props.playList,
  async (newVal) => {
    if (newVal.length && !props.more) {
      // 过滤掉非用户自定义创建的歌单
      pageInfo.noMoreList = _.cloneDeep(
        newVal.filter((item) => item.creator.userId == uid.value)
      );
      // 默认展示多少条数据
      list.value = pageInfo.noMoreList.slice(offset.value, limit.value);
      console.log(
        "more为false时，用户创建的歌单total数==>",
        pageInfo.noMoreList
      );
      // 总条数
      pageInfo.total = pageInfo.noMoreList.length;
    } else {
      // 过滤掉非用户自定义创建的歌单
      // list.value = _.cloneDeep(
      //   newVal.filter((item) => item.creator.userId == uid.value)
      // );
      // 第一次获取追加进noMoreList数组
      pageInfo.noMoreList = _.cloneDeep(
        newVal.filter((item) => item.creator.userId == uid.value)
      );
      loading.value = true;
      await moreIsTrueGetTotal(pageInfo.pageNum + 1);
      pageInfo.total = pageInfo.noMoreList.length;
      // 默认展示多少条数据
      list.value = pageInfo.noMoreList.slice(offset.value, limit.value);
      loading.value = false;
      console.log("用户创建的歌单(more为true时)==>", pageInfo.noMoreList);
    }
  },
  { immediate: true, deep: true }
);

// more为true时获取总条数
async function moreIsTrueGetTotal(index: number = 2) {
  return new Promise<any>(async (resolve) => {
    const offset = (index - 1) * limit.value;
    // 开始循环获取用户剩余歌单
    const hasMore = await getUserSongList(offset);
    // 判断是否还有更多数据
    return resolve(hasMore);
  }).then((res) => {
    pageInfo.hasMore = res;
    // more为true，证明还是存在更多数据
    if (res) {
      // 递归追加
      moreIsTrueGetTotal(index + 1);
    } else {
      return Promise.resolve();
    }
  });
}

/**
 * 循环放松请求获取用户剩余的歌单条数，没请获取limit条，直到more为false无更多数据
 * @param offset 页码偏移量
 */
function getUserSongList(offset: number) {
  return new Promise<boolean>((resolve, reject) => {
    SongListApi.getUserSongList({
      uid: props.songListInfo.uid,
      limit: props.songListInfo.limit,
      offset,
    })
      .then((res) => {
        const { code, playlist, more } = res.data;
        if (code != 200) {
          return reject(false);
        }
        // 循环追加
        pageInfo.noMoreList = _.cloneDeep([
          ...pageInfo.noMoreList,
          ...playlist.filter((item: any) => item.creator.userId == uid.value),
        ]);
        resolve(more);
      })
      .catch(() => {
        // 请求失败，不再追加数据
        reject(false);
        // 清空
        pageInfo.noMoreList = [];
      });
  });
}

const emits = defineEmits<{
  (e: "handleSongItem", item: any): void;
  (e: "pagination", value: any, hasMore?: boolean): void;
}>();

// 分页事件触发
const handlePagination = (value: any) => {
  emits("pagination", value, pageInfo.hasMore);
  // 判断截取数量
  // 剩余需要截取的数量已经小于了规定的每页显示的条数数量，则直接截取剩余的全部
  if (pageInfo.noMoreList.length - offset.value < limit.value) {
    list.value = pageInfo.noMoreList.slice(offset.value);
  } else {
    // 否则就继续截取规定的条数
    list.value = pageInfo.noMoreList.slice(
      offset.value,
      limit.value * pageInfo.pageNum
    );
  }
};

// 点击某一项歌单
const handleSongItem = (item: any) => {
  emits("handleSongItem", item);
};

defineOptions({
  name: "CreatedPlaylistCount",
});
</script>

<template>
  <!-- 用户自定义创建的歌单列表 -->
  <div class="create-play-list" v-loading="loading">
    <div
      v-if="list.length"
      class="song-list grid grid-flow-row grid-cols-4 lg:grid-cols-4 gap-5 2xl:grid-cols-4"
    >
      <div v-for="item in list" :key="item.createTime" class="song-box">
        <div class="img-box" @click="handleSongItem(item)">
          <!-- 播放量 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.playCount) }}</span>
          </div>

          <el-image
            lazy
            class="w-full"
            style="border-radius: 5px; border: 2px solid #eee"
            :src="item.coverImgUrl + '?param=254y254'"
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
        <div
          class="song-name oneline-hide text-sm"
          @click="handleSongItem(item)"
        >
          {{ item.name }}
        </div>
        <div class="text-xs text-[rgb(130,130,130)]">
          {{ item.trackCount }}首
        </div>
      </div>
    </div>

    <!-- 空数据 -->
    <div class="empty" v-else>
      <!-- <i-ep-FolderOpened class="empty-icon" /> -->
      <svg-icon icon-class="empty_data" />
      <span>没有创建的歌单哦😊</span>
    </div>

    <!-- 分页组件 -->
    <pagination
      :total="pageInfo.total"
      v-model:limit="songListInfo.limit"
      v-model:page="pageInfo.pageNum"
      @pagination="handlePagination"
    />
  </div>
</template>
