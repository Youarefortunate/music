<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import * as SearchMusicEnum from "@/enums/SearchMusicEnum";
import { UserGenderEnum } from "@/enums/UserGenderEnum";
import { Plus } from "@element-plus/icons-vue";
import { search } from "./index";
import { TTUL } from "@/utils/globalMethods";

const route = useRoute();
const router = useRouter();
// 列表加载
const loading = ref(false);
// 用户列表
const users = ref<any[]>([]);
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
  type: SearchMusicEnum.SearchMusicType.user,
});

onMounted(() => {
  // 搜索用户
  getUserList();
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

// 搜索用户
function getUserList() {
  // 开始加载
  loading.value = true;
  // 获取搜索结果
  search({
    keywords: queryParams.keywords,
    limit: queryParams.limit,
    offset: queryParams.offset,
    type: queryParams.type,
  })
    .then((res) => {
      queryParams.total = res?.userprofileCount || 0;
      users.value = res?.userprofiles || [];
      console.log("搜索用户成功==>", res);
    })
    .finally(() => {
      loading.value = false;
    });
}

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

// 分页事件触发回调
const handlePagination = (val: any) => {
  // 分页参数
  queryParams.offset = (val.page - 1) * val.limit;
  // 重新获取数据
  getUserList();
};

defineOptions({
  name: "User",
});
</script>

<template>
  <div class="user" v-loading="loading">
    <div v-if="users.length" class="user-list flex flex-wrap">
      <div
        v-for="item in users"
        :key="item.userId"
        class="user-item"
        @click="handleToOtherUserProfile(item)"
      >
        <!-- 用户头像 -->
        <div class="user-avatar mr-10px">
          <el-image class="avatar-cover" :src="item.avatarUrl + '?param=100y100'" fit="cover" />
          <img
            v-if="item.avatarDetail?.identityIconUrl"
            class="ident"
            :src="item.avatarDetail?.identityIconUrl"
          />
        </div>

        <!-- 用户昵称、签名等 -->
        <div class="user-info">
          <!-- 用户昵称 -->
          <div class="flex items-center">
            <span class="font-bold text-20px mr-5px">{{ item.nickname }}</span>
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
          <!-- 用户个性签名 -->
          <div class="signature flex items-center">
            <div
              style="max-width: 60%"
              class="oneline-hide"
              :class="{ 'w-200px': item.signature.length > 30 }"
            >
              <span class="text-xs text-#61666D my-10px">{{
                item.signature || "该用户暂无签名"
              }}</span>
            </div>
            <el-tag
              type="warning"
              size="small"
              effect="dark"
              v-if="item.avatarDetail?.identityIconUrl"
              class="ml-5px"
              checked
              >网易音乐人</el-tag
            >
          </div>
          <div class="mt-10px">
            <el-button
              type="primary"
              style="width: 120px"
              :icon="Plus"
              @click.stop="TTUL('关注功能暂未完成')"
            >
              <span>关注</span>
              <template #icon>
                <el-icon><Plus /></el-icon>
              </template>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 空数据 -->
    <div class="empty-user" v-else>
      <span
        >没有找到有关“<span class="text-#0680D7">{{
          queryParams.keywords
        }}</span
        >用户</span
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
.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 60px;
  flex: 0 0 50%;
  max-width: 50%;
  padding: 10px;
  &:hover {
    background-color: #eae8e8;
    border-radius: 5px;
    cursor: pointer;
  }

  .user-avatar {
    flex: 20%;
    position: relative;
    .avatar-cover {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 2px solid rgba(190, 190, 190, 0.2);
    }
    .ident {
      object-fit: cover;
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
    }
  }
  .user-info {
    flex: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
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
  }
}

.empty-user {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  width: 100%;
  height: calc(100vh - 600px);
}
</style>
