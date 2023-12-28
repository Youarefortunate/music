<script setup lang="ts">
import * as SearchApi from "@/api/search";
import { useStorage } from "@vueuse/core";
import { useRouter } from "vue-router";
import {
  Delete,
  Close,
  Search,
  Service,
  User,
  Football,
  Operation,
} from "@element-plus/icons-vue";
import * as SearchMusicEnum from "@/enums/SearchMusicEnum";

type SuggestType = {
  guess: Array<any>;
  songs: Array<any>;
  artists: Array<any>;
  playlists: Array<any>;
  albums: Array<any>;
  order?: Array<any>;
};

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:modelValue"]);
// (组件v-model绑定值)
const keyVal = useVModel(props, "modelValue", emits);

// 路由对象
const router = useRouter();
const visble = ref(false);
// 加载
const loading = ref(false);
// 用户搜索过的历史记录
const searchHistory = useStorage<string[]>("searchHistory", []);
// 热搜榜数组
const hotSearchData = ref<any>([]);
// 搜素建议数组
const searchSuggestData = ref<any>([]);
const keyword = ref<string | number>("");
// 搜索建议数据
let suggest = reactive<SuggestType>({
  // 猜你想搜
  guess: [],
  // 单曲
  songs: [],
  // 歌手
  artists: [],
  // 歌单
  playlists: [],
  // 专辑
  albums: [],
});

// 禁用页面滚动
watch(visble, (newVal) => {
  if (newVal) {
    getMusicHotDetail();
    // 隐藏body的滚动条
    document.body.style.overflow = "hidden";
    document.body.addEventListener("click", close);
  } else {
    document.body.style.overflow = "";
    document.body.removeEventListener("click", () => {
      visble.value = false;
    });
  }
});

watch(keyword, (newVal) => {
  if (newVal) {
    getSearchSuggest();
  }
});

/**
 * 搜索框获取焦点时触发，获取热搜榜
 */
function getMusicHotDetail() {
  // 开始加载
  loading.value = true;
  SearchApi.musicHotDetail()
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return console.error("获取热搜列表(详细)失败");
      }
      hotSearchData.value = data;
      console.log("获取热搜列表(详细)成功==>", res.data);
    })
    .finally(() => (loading.value = false));
}

/**
 * 获取搜索建议
 */
function getSearchSuggest() {
  // 开始加载
  loading.value = true;
  Promise.all([getSearchSuggestByMobile(), getSearchSuggestByPC()])
    .then((res) => {
      console.log("获取搜索建议成功==>", res);

      suggest.songs = (res[1] as SuggestType).songs || [];
      suggest.albums = (res[1] as SuggestType).albums || [];
      suggest.artists = (res[1] as SuggestType).artists || [];
      suggest.playlists = (res[1] as SuggestType).playlists || [];
      suggest.order = (res[1] as SuggestType).order || [];
      // console.log("获取全部搜索建议成功", suggest);
    })
    .finally(() => (loading.value = false));
}

/**
 * 获取移动端搜索建议
 */
function getSearchSuggestByMobile() {
  return new Promise((resolve, reject) => {
    SearchApi.searchSuggest({
      keywords: keyword.value.toString(),
      type: "mobile",
    })
      .then((res) => {
        const { code, result } = res.data;
        if (code != 200) {
          return reject("获取移动端搜索建议失败");
        }
        searchSuggestData.value = result.allMatch;
        resolve(result.allMatch);
        console.log("获取移动端搜索建议成功==>", res.data);
      })
      .catch((err) => reject(err || err.message));
  });
}

/**
 * 获取PC端搜索建议
 */
function getSearchSuggestByPC() {
  return new Promise((resolve, reject) => {
    SearchApi.searchSuggest({
      keywords: keyword.value.toString(),
    })
      .then((res) => {
        const { code, result } = res.data;
        if (code != 200) {
          return reject("获取PC端搜索建议失败");
        }
        resolve(result);
        console.log("获取PC端搜索建议成功==>", result);
      })
      .catch((err) => reject(err || err.message));
  });
}

// 点击热搜榜
const handleClickHotRecord = (item: any) => {
  console.log("点击热搜榜==>", item);
  onToSearch(item.searchWord);
};

// 点击某一个历史搜素记录
const handleClickHistoryRecord = (item: string) => {
  keyVal.value = item;
  onToSearch(item);
};

/**
 * 删除某一个历史搜索
 */
const handleDeleteHistory = (index: number) => {
  searchHistory.value.length && searchHistory.value.splice(index, 1);
};
/**
 * 删除全部历史搜索
 */
const handleDeleteAllHistory = () => {
  searchHistory.value.length &&
    searchHistory.value.splice(0, searchHistory.value.length);
};

// 点击猜你想搜的某一项
const handleSearchSuggest = (item: any) => {
  console.log("item==>", item);
  onToSearch(item?.keyword)
};

function show(show: boolean, value?: string | number) {
  visble.value = show;
  keyword.value = value ?? "";
}

function close(e: MouseEvent) {
  if (!visble.value) return;
  const hotSearchDom = document.querySelector(".hot-search") as HTMLElement;
  const searchSuggestDom = document.querySelector(
    ".search-suggest"
  ) as HTMLElement;
  const searchMusicDom = document.querySelector(".search-music") as HTMLElement;

  const hotRect = hotSearchDom.getBoundingClientRect();
  // e.clientX >= rect.left：在弹窗左侧范围内
  const hotx = e.clientX >= hotRect.left && e.clientX <= hotRect.right;
  const hoty = e.clientY >= hotRect.top && e.clientY <= hotRect.bottom;

  const suggestRect = searchSuggestDom.getBoundingClientRect();
  const suggestx =
    e.clientX >= suggestRect.left && e.clientX <= suggestRect.right;
  const suggesty =
    e.clientY >= suggestRect.top && e.clientY <= suggestRect.bottom;

  const inputRect = searchMusicDom.getBoundingClientRect();
  const inputRectx =
    e.clientX >= inputRect.left && e.clientX <= inputRect.right;
  const inputRecty =
    e.clientY >= inputRect.top && e.clientY <= inputRect.bottom;

  // 在弹窗区域内
  if ((hotx && hoty) || (suggestx && suggesty)) {
    return;
  }
  // 在搜索框内
  if (inputRectx && inputRecty) {
    return;
  }
  visble.value = false;
}
/**
 * 跳转搜索音乐界面
 */
function onToSearch(
  keywords: string,
  type: SearchMusicEnum.SearchMusicType = SearchMusicEnum.SearchMusicType.single
) {
  router.push({
    path: "/search",
    query: {
      keywords,
      // 单曲搜索
      type,
    },
  });
  visble.value = false;
}

defineExpose({
  show,
  close,
});

defineOptions({
  name: "HotSearch",
});
</script>

<template>
  <div class="search-dialog" v-show="visble">
    <!-- 热搜榜 -->
    <div
      class="hot-search hidden"
      :style="{ display: !!keyword ? 'none' : 'block' }"
    >
      <!-- 搜索历史 -->
      <div class="search-history" v-if="searchHistory.length">
        <div class="title">
          <span class="font-360">搜索历史</span>
          <el-icon color="#636363" @click="handleDeleteAllHistory"
            ><Delete
          /></el-icon>
        </div>
        <div class="history-list">
          <span
            class="item"
            v-for="(history, index) in searchHistory"
            @click.stop="handleClickHistoryRecord(history)"
          >
            <span
              class="mr-3px pr-5px oneline-hide"
              :style="{ width: history.length > 20 ? '40px' : '' }"
              >{{ history }}</span
            >
            <el-icon
              size="15"
              @click.stop="handleDeleteHistory(index)"
              class="delete"
              ><Close
            /></el-icon>
          </span>
        </div>
      </div>

      <!-- 热搜榜 -->
      <div
        class="hot-list mt-20px"
        v-loading="loading"
        :class="{ height: !loading ? '400px' : '' }"
      >
        <div class="color-#636363 text-15px mb-15px font-360 pl-20px">
          热搜榜
        </div>

        <div
          v-if="hotSearchData.length"
          v-for="(item, index) in hotSearchData"
          :key="item"
          class="hot-item flex items-center"
          @click="handleClickHotRecord(item)"
        >
          <div class="w-13% pl-10px order-index">{{ index + 1 }}</div>
          <div class="flex flex-col">
            <div class="flex items-center">
              <span class="searchWord mr-5px text-14px">{{
                item.searchWord
              }}</span>
              <img
                v-if="item.iconUrl"
                :style="{
                  width:
                    item.iconType == 5 || item.iconType == 4 ? '12px' : '27px',
                }"
                class="mr-5px object-cover"
                :src="item.iconUrl"
              />
              <span class="text-12px color-#B5B5B5">{{ item.score }}</span>
            </div>
            <div class="text-13px mt-8px color-#B5B5B5">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索建议  -->
    <div
      v-loading="loading"
      class="search-suggest"
      :style="{ display: !!keyword ? 'block' : 'none' }"
    >
      <!-- 猜你想搜 -->
      <div class="guess-search mb-20px">
        <div class="title">
          <el-icon color="#636363"><Search /></el-icon>
          <span class="font-300 ml-5px">猜你想搜</span>
        </div>
        <ul class="content" v-if="searchSuggestData.length">
          <li
            v-for="(item, index) in searchSuggestData"
            :key="index"
            @click="handleSearchSuggest(item)"
          >
            <span>{{ item.keyword }}</span>
            <!-- 喜欢歌曲 -->
            <svg-icon
              v-if="item.alg.indexOf('Like') > -1"
              class="cursor-pointer"
              style="color: #ec4141;"
              size="20px"
              icon-class="unlike-music"
            />
            <!-- 听过的歌曲 -->
            <el-tag
              v-if="item.alg.indexOf('Heard') > -1"
              class="ml-2"
              type="info"
              size="small"
              >听过</el-tag
            >
          </li>
        </ul>
      </div>

      <!-- 单曲 -->
      <div class="songs mb-20px" v-if="suggest.songs.length">
        <div class="title pl-15px text-15px">
          <el-icon color="#636363"><Service /></el-icon>
          <span class="font-300 ml-5px">单曲</span>
        </div>

        <ul class="content">
          <li
            v-for="(item, index) in suggest.songs"
            :key="index"
            @click="handleSearchSuggest(item)"
          >
            <span>
              <span>{{ item.name }}&nbsp;-&nbsp;</span>
              <span
                class="mr-10px"
                v-if="item.artists.length"
                v-for="artists in item.artists"
                :key="artists.id"
                >{{ artists.name }}</span
              >
            </span>
          </li>
        </ul>
      </div>

      <!-- 歌手 -->
      <div class="artists mb-20px" v-if="suggest.artists.length">
        <div class="title pl-15px text-15px">
          <el-icon color="#636363"><User /></el-icon>
          <span class="font-300 ml-5px">歌手</span>
        </div>

        <ul class="content">
          <li
            v-for="(item, index) in suggest.artists"
            :key="index"
            @click="handleSearchSuggest(item)"
          >
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 专辑 -->
      <div class="albums mb-20px" v-if="suggest.albums.length">
        <div class="title pl-15px text-15px">
          <el-icon color="#636363"><Football /></el-icon>
          <span class="font-300 ml-5px">专辑</span>
        </div>

        <ul class="content">
          <li
            v-for="(item, index) in suggest.albums"
            :key="index"
            @click="handleSearchSuggest(item)"
          >
            <span>
              <span>{{ item.name }}&nbsp;-&nbsp;</span>
              <span class="mr-10px">{{ item.artist?.name }}</span>
            </span>
          </li>
        </ul>
      </div>

      <!-- 歌单 -->
      <div class="playlists mb-20px" v-if="suggest.playlists.length">
        <div class="title pl-15px text-15px">
          <el-icon color="#636363"><Operation /></el-icon>
          <span class="font-300 ml-5px">歌单</span>
        </div>

        <ul class="content">
          <li
            v-for="(item, index) in suggest.playlists"
            :key="index"
            @click="handleSearchSuggest(item)"
          >
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin flex-center {
  display: flex;
  align-items: center;
}

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

.title {
  margin-bottom: 15px;
  @include flex-center();
  & span:first-child {
    margin-right: 5px;
    font-size: 15px;
    color: #636363;
  }
}

.search-dialog {
  width: 400px;
  height: 600px;
  position: absolute;
  top: calc($logoAndNavHeight);
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  @include flex-center;
  justify-content: center;
}

.hot-search {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  // visibility: hidden;
  // opacity: 0;
  // 隐藏滚动条
  // &::-webkit-scrollbar {
  //   display: none;
  // }
  transition: all 0.3s linear;
  color: #5d5c5c;
  color: var(--el-text-color-primary);
  background-color: var(--el-color-white);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 10px;
  border: 1px solid var(--el-card-border-color);

  @include scroll-bar;
  .search-history {
    padding: 20px;
    padding-bottom: 0;

    .history-list {
      display: flex;
      flex-wrap: wrap;
      .item {
        position: relative;
        @include flex-center();
        color: #626161;
        font-size: 11px;
        border-radius: 50px;
        padding: 4px 16px 4px 13px;
        border: 1px solid #c0c0c0;
        margin-top: 10px;
        .delete {
          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          display: none;
        }
        &:not(:last-child) {
          margin-right: 10px;
        }
        &:hover {
          .delete {
            display: block;
          }
          cursor: pointer;
          background-color: #f2f2f2;
        }
      }
    }
  }

  .hot-list {
    .hot-item {
      padding: 10px 20px;
      &:hover {
        cursor: pointer;
        background-color: #f2f2f2;
      }
      &:last-child {
        margin-bottom: 20px;
      }
    }
    @for $i from 1 to 5 {
      .hot-item:nth-child(#{$i}) {
        .searchWord {
          font-weight: bold;
        }
        .order-index {
          color: #ff001e;
        }
      }
    }
  }
}

.search-suggest {
  width: 90%;
  height: 600px;
  overflow-y: scroll;
  // 隐藏滚动条
  // &::-webkit-scrollbar {
  //   display: none;
  // }
  transition: all 0.3s linear;
  color: #5d5c5c;
  color: var(--el-text-color-primary);
  background-color: var(--el-color-white);
  box-shadow: var(--el-box-shadow-light);
  border-radius: 10px;
  border: 1px solid var(--el-card-border-color);
  @include scroll-bar;
  .guess-search {
    padding-top: 20px;
    .title {
      padding-left: 15px;
      font-size: 15px;
    }
  }

  .content li {
    font-weight: 300;
    color: #7d7d7d;
    font-size: 13px;
    @include flex-center;
    padding: 10px 10px 10px 36px;
    &:hover {
      cursor: pointer;
      background-color: #f2f2f2;
    }
  }
}
</style>
