<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import * as SearchMusicEnum from "@/enums/SearchMusicEnum";
import { User } from "@element-plus/icons-vue";
import { search } from "./index";

const route = useRoute();
const router = useRouter();
// 歌手列表加载
const loading = ref(false);
// 歌手列表
const artists = ref<any[]>([]);
// 请求参数
const queryParams = reactive({
  // 总搜索数量
  total: 0,
  // 一次返回50条数据
  limit: 70,
  // 偏移量，用于分页
  offset: 0,
  // 页码
  pageNum: 1,
  // 搜索关键字
  keywords: "",
  // 搜索的音乐类型，默认搜索单曲
  type: SearchMusicEnum.SearchMusicType.singer,
});

onMounted(() => {
  // 搜索歌手
  getSingerList();
});

watch(
  () => route.query,
  (newVal) => {
    if (newVal) {
      queryParams.keywords = newVal.keywords as string;
    }
  },
  { immediate: true }
);

// 搜索歌手
function getSingerList() {
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
      queryParams.total = res?.artistCount || 0;
      artists.value = res?.artists || [];
      console.log("搜索歌手成功==>", res);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  getSingerList();
};

// 前往其他用户主页
const handleToOtherUserProfile = (item: any) => {
  console.log("item==>", item);
  // router.push({
  //   path: '/user/user-profile',
  //   query: {
  //     userId: item.id,
  //   }
  // })
};

defineOptions({
  name: "Singer",
});
</script>

<template>
  <!-- 歌手 -->
  <div class="singer" v-loading="loading">
    <div
      v-if="artists.length"
      class="singer-list grid grid-flow-row justify-between grid-cols-5 lg:grid-cols-5 gap-5 2xl:grid-cols-6"
    >
      <div
        v-for="item in artists"
        :key="item.id"
        class="singer-item flex items-center flex-col"
      >
        <!-- 用户头像  -->
        <el-image
          lazy
          v-if="item.img1v1Url.indexOf('6y-UleORITEDbvrOLV0Q8A') == -1"
          class="w-full shadow cursor-pointer"
          style="border: 5px solid rgba(190, 190, 190, 0.2)"
          :src="item.img1v1Url + '?param=100y100'"
          fit="cover"
          :title="item.name"
          @click="handleToOtherUserProfile(item)"
        />
        <!-- 没有头像的 -->
        <el-image
          v-else
          fit="cover"
          class="w-full shadow cursor-pointer"
          @click="handleToOtherUserProfile(item)"
          style="border: 5px solid rgba(190, 190, 190, 0.2)"
          src="http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg"
        />

        <div
          class="w-full flex items-center justify-between mt-[10px] cursor-pointer px-5px"
        >
          <div
            class="text-[rgb(123,123,123)] text-12px oneline-hide"
            style="max-width: 70%"
          >
            {{ item.name }}
          </div>

          <div class="user" v-if="item.accountId">
            <el-icon color="#fff"><User /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 空数据 -->
    <div class="empty-singer" v-else>
      <span
        >没有找到有关“<span class="text-#0680D7">{{
          queryParams.keywords
        }}</span
        >”歌手</span
      >
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

<style lang="scss" scoped>
.user {
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: rgb(123, 123, 123);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f94f44;
}

.empty-singer {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  width: 100%;
  height: calc(100vh - 600px);
}
</style>
