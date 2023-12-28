<script setup lang="ts">
import { useRoute } from 'vue-router'
import * as HighqualityApi from "@/api/highquality";
import * as HighqualityType from "@/api/highquality/type";
import { QuestionFilled, Filter, ArrowLeft } from "@element-plus/icons-vue";
import { useNumberFormat } from "@/utils";
import HighqualityCate from "./HighqualityCate.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["update:modelValue"]);
// 是否可见
const visible = useVModel(props, "modelValue", emits);

const route = useRoute();
// 加载
const loading = ref<boolean>(false);
// 获取精品歌单参数
const highqualityQuery = reactive<HighqualityType.HighqualitySongListParams>({
  cat: "全部",
  limit: 50,
  before: 0,
});
// 分页参数
const pageParam = reactive({
  total: 0,
  lasttime: 0,
  // 页码
  pageNum: 1,
});

const HighqualityCateRef = ref();
const HighqualityListRef = ref();
// 精品歌单列表
const songList = ref<any>([]);
// 是否触底
const isBottom = ref(false);
// 是否还有更多数据
const hasMore = ref(false);

watch(
  () => highqualityQuery.cat,
  (newSub) => {
    if (newSub) {
      songList.value = [];
      highqualityQuery.before = 0;
      handleRefresh();
    }
  }
);

watch(() => route.path, (path) => {
  console.log('path==>', path);
})

watch(visible, (v) => {
  if (v) {
    // 获取精品歌单
    getHighquality();
    window.addEventListener(
      "scroll",
      (e: Event) => {
        handleScroll();
      },
      true
    );
  } else {
    window.removeEventListener("scroll", handleScroll);
  }
});

onMounted(() => {
  // 获取精品歌单
  getHighquality();
});


// 获取精品歌单
function getHighquality() {
  loading.value = true;
  HighqualityApi.getHighqualitySongList(highqualityQuery)
    .then((res) => {
      const { code, playlists, total, lasttime, more } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      songList.value = songList.value.concat(playlists);
      pageParam.total = total;
      highqualityQuery.before = lasttime;
      hasMore.value = more;
      console.log("获取精品歌单成功==>", res.data);
    })
    .catch((err) => {
      // 获取数据失败
      console.log("获取精品歌单失败==>", err || err.message);
    })
    .finally(() => {
      loading.value = false;
      isBottom.value = false;
    });
}

// 显示歌单分类
const handleShowQualityCate = () => {
  HighqualityCateRef.value?.show();
};

/**
 * 监听精品歌单列表容器滚动事件（此处的@scroll无效，暂时找不到解决办法，原因是精品歌单列表并没有产生滚动效果）
 */
const handleScroll = useDebounceFn(
  () => {
    // 获取html元素dom
    const container = document.documentElement;
    // 判断是否触底
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight
    ) {
      if (!hasMore.value) return;
      handleRefresh();
      isBottom.value = true;
    }
  },
  300,
  { maxWait: 5000 }
);

// 刷新列表数据
function handleRefresh(bool: boolean = true) {
  bool && getHighquality();
}

function show(v: boolean) {
  visible.value = v || !visible.value;
}

defineExpose({
  show,
});

// 组件名称
defineOptions({
  name: "Highquality",
});
</script>

<template>
  <div class="highquality">
    <!-- 标题 -->
    <div class="w-full flex items-center justify-between mb-20px">
      <div class="flex items-center">
        <el-icon
          size="25px"
          class="cursor-pointer"
          title="返回歌单列表页"
          @click="() => (visible = false)"
          ><ArrowLeft
        /></el-icon>
        <h3 class="mr-5px">精品歌单</h3>
        <a
          target="_blank"
          href="https://music.163.com/#/topic?id=202001"
          title="如何成为精品歌单"
          class="flex items-center justify-center"
        >
          <el-icon size="20px" @click=""><QuestionFilled /></el-icon>
        </a>
      </div>

      <div class="relative">
        <el-button plain round :icon="Filter" @click="handleShowQualityCate">
          <span>{{
            highqualityQuery.cat == "全部" ? "全部歌单" : highqualityQuery.cat
          }}</span>
        </el-button>

        <HighqualityCate
          v-model="highqualityQuery.cat"
          ref="HighqualityCateRef"
        />
      </div>
    </div>

    <!-- 歌单列表 -->
    <div v-loading="loading" class="highquality-list" ref="HighqualityListRef">
      <div
        v-for="item in songList"
        :key="item.id"
        class="song-box overflow-hidden rounded-5px"
      >
        <div class="img-box mr-10px w-200px h-200px">
          <!-- 播放量 -->
          <div class="counts text-white text-sm">
            <svg-icon icon-class="bofangliang" color="#fff" />
            <span class="ml-1">{{ useNumberFormat(item.playCount) }}</span>
          </div>

          <!-- 该歌单是否为精品歌单 -->
          <div class="high-qality" v-if="item.highQuality">
            <svg-icon size="20px" icon-class="jingpingedan" />
          </div>

          <!-- 背景图片 -->
          <el-image
            @click="
              onTargetPage('/song/song-detail', {
                songId: item?.id,
              })
            "
            style="border-radius: 5px"
            :src="item.coverImgUrl + '?param=200y200'"
            fit="cover"
            :title="item.name"
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

        <div class="songlist-desc">
          <!-- 精品歌单名称 -->
          <div class="oneline-hide" :class="{ 'w-85%': item.name.length > 25 }">
            {{ item.name }}
          </div>
          <div class="creator-name flex items-center">
            <!-- 精品歌单创建者昵称 -->
            <div
              class="text-13px oneline-hide mx-4px text-#6C6C6C"
              :class="{ 'w-35%': item.creator?.nickname.length > 25 }"
            >
              By
              <el-link
                style="font-size: 12px"
                :underline="false"
                @click="
                  onTargetPage('/user/user-profile', {
                    userId: item?.creator?.userId,
                  })
                "
                >{{ item.creator?.nickname }}</el-link
              >
            </div>
            <img
              v-if="item.creator?.avatarDetail?.identityIconUrl"
              class="ident-icon object-cover w-[15px] h-[15px]"
              :src="item.creator?.avatarDetail?.identityIconUrl"
            />
          </div>

          <!-- 歌单标签 -->
          <div>
            <el-tag type="danger" effect="plain">
              {{ item.tag }}
            </el-tag>
          </div>

          <!-- 歌单文案 -->
          <div
            class="text-11px oneline-hide text-#CCCCCC"
            :class="{ 'w-85%': item.copywriter.length > 25 }"
          >
            {{ item.copywriter }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="is-bottom"
      v-loading="isBottom"
      element-loading-text="加载更多精品歌单中..."
      element-loading-background="rgba(255,255,255,0)"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.highquality-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 30px;
  // overflow-y: scroll;
  .song-box {
    display: flex;
    align-items: center;
  }

  .songlist-desc {
    height: 100%;
    padding: 20px 0 40px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}
.is-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90%;
  height: 100px;
}
</style>
