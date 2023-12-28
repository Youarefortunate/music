<script setup lang="ts">
import { useRouter } from "vue-router";
import * as SongListApi from "@/api/songList";
import { UserGenderEnum } from "@/enums/UserGenderEnum";

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

// 路由对象
const router = useRouter();
// 获取所有订阅者请求参数
const queryParams = reactive({
  // 总订阅人数
  total: 0,
  // 一次返回50条数据
  limit: 51,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
});

// 加载
const loading = ref(false);
// 收藏者数组
const subscribed = ref<any>([]);

// 获取该歌单全部的收藏者
function getAllSongListSubscribed() {
  // 开始加载
  loading.value = true;
  SongListApi.getAllSongListSubscribed({
    id: props.songId,
    limit: queryParams.limit,
    offset: queryParams.offset,
  })
    .then((res) => {
      const { code, total, subscribers } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取该歌单全部的收藏者失败"));
      }
      console.log("获取该歌单全部的收藏者成功==>", res.data);
      // 总订阅人数
      queryParams.total = total;
      // 收藏者数组
      subscribed.value = subscribers;
    })
    .catch((err) => {
      ElMessage.error(
        err || err.message || err || "获取该歌单全部的收藏者失败"
      );
    })
    .finally(() => (loading.value = false));
}

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  getAllSongListSubscribed();
};

// 前往其他用户主页
const handleToOtherUserProfile = (item: any) => {
  console.log("item==>", item);
  router.push({
    path: "/user/user-profile",
    query: {
      userId: item.userId,
    },
  });
};

onMounted(() => {
  // 获取该歌单全部的收藏者
  getAllSongListSubscribed();
});

defineOptions({
  name: "Collector",
});
</script>

<template>
  <div class="collector" v-loading="loading">
    <div
      v-if="subscribed.length"
      class="collector-list grid grid-flow-row justify-between grid-cols-3 lg:grid-cols-4 gap-5 2xl:grid-cols-4"
    >
      <div
        v-for="item in subscribed"
        :key="item.userId"
        class="collector-item flex items-center flex-col"
      >
        <!-- 用户头像 -->
        <el-image
          lazy
          class="w-[80%] shadow cursor-pointer"
          style="border-radius: 50%; border: 5px solid rgba(190, 190, 190, 0.2)"
          :src="item.avatarUrl"
          fit="cover"
          @click="handleToOtherUserProfile(item)"
        />

        <div class="flex items-center mt-[10px] cursor-pointer">
          <div class="text-[rgb(123,123,123)] text-center">
            {{ item.nickname }}
          </div>
          <!-- 用户性别 -->
          <div
            :class="{
              female: item.gender == UserGenderEnum.FEMALE,
              male: item.gender == UserGenderEnum.MALE,
            }"
            class="icon w-[18px] h-[18px] ml-[5px] flex items-center justify-center"
          >
            <i-ep-Male
              v-if="item.gender == UserGenderEnum.MALE"
              class="text-[12px]"
            ></i-ep-Male>
            <i-ep-Female
              v-else-if="item.gender == UserGenderEnum.FEMALE"
              class="text-[12px]"
            ></i-ep-Female>
          </div>
        </div>

        <el-tooltip effect="dark" :content="item.signature" placement="top">
          <div
            class="text-xs w-full text-center oneline-hide mt-[10px] text-[rgb(163,163,163)] cursor-pointer"
          >
            {{ item.signature }}
          </div>
        </el-tooltip>
      </div>
    </div>

    <div class="no-data h-200px flex items-center justify-center" v-else>
      <span class="text-13px text-#838080">还有人收藏该歌单哦</span>
    </div>

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
.icon {
  text-align: center;
  border-radius: 50%;
}

// 标签男样式
.male {
  background-color: rgb(191, 243, 255);

  svg {
    color: rgb(44, 188, 220);
  }
}

// 标签女样式
.female {
  background-color: rgb(255, 204, 231);
  svg {
    color: rgb(229, 139, 187);
  }
}
</style>
