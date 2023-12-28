<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";
import * as UserProfileApi from "@/api/userInfo";
import * as SongListApi from "@/api/songList";
import { PlaylistParams } from "@/api/songList/type";
import { city } from "@/staticData/userProfile/city";
import { useStorage } from "@vueuse/core";
import type { TabsPaneContext } from "element-plus";
import { UserGenderEnum } from "@/enums/UserGenderEnum";
import {
  EditPen,
  Position,
  Star,
  User,
  Location,
  CollectionTag,
} from "@element-plus/icons-vue";
import { isEmptyObject } from "@/utils";
import { CreatedPlaylistCount, SubPlaylistCount } from "./modules";
import EditProfileForm from "./modules/EditProfileForm.vue";

// 路由
const router = useRouter();
const route = useRoute();
// 加载
const loading = ref<boolean>(false);
// 用户store
const userStore = useUserStore();
// 用户现居城市
// const cityLive = useStorage<string>("cityLive", "");
const cityLive = ref("");
// 当前用户详情数据
const detail = ref<any>({});
// 当前用户个人信息
const profile = ref<any>({});
// 用户歌单列表动态tab组件渲染类型声明
type TabsComponents = "createdPlaylistCount" | "subPlaylistCount";
// 用户歌单列表动态tab组件渲染数据
const tabsComponents = {
  createdPlaylistCount: CreatedPlaylistCount,
  subPlaylistCount: SubPlaylistCount,
};
// 当前活跃标签页
const curActiveTab = ref<TabsComponents>("createdPlaylistCount");
// 歌单列表
const playList = ref<Array<any>>([]);
// 获取用户歌单参数
const songListInfo = reactive<PlaylistParams>({
  uid: 0,
  // 返回数量
  limit: 20,
  // 偏移数量，用于分页 , 如 :( 页数 - 1)*30, 其中 30 为 limit 的值 , 默认为 0
  offset: 0,
});
// 是否还存在更多歌单数据
const hasMore = ref<boolean>(false);

// 偏移数量，用于分页 , 如 :( 页数 - 1)*30, 其中 30 为 limit 的值 , 默认为 0
// const offset = computed(() => (pageInfo.pageNum - 1) * songListInfo.limit!);
// 动态组件is属性值
const tabsComponentId = computed(() => tabsComponents[curActiveTab.value]);

type DescInfo = {
  isclick?: boolean;
  label: string;
  width?: number;
  icon: any;
  span?: number;
  content: string;
};
const descInfo: Array<DescInfo> = [
  {
    label: "动态",
    width: 100,
    isclick: true,
    icon: Position,
    content: "eventCount",
  },
  { label: "关注", width: 100, isclick: true, icon: Star, content: "follows" },
  {
    label: "粉丝",
    width: 100,
    isclick: true,
    icon: User,
    content: "followeds",
  },
  { label: "所在地区", width: 100, icon: Location, content: "cityLive" },
  { label: "个人介绍", span: 2, icon: CollectionTag, content: "signature" },
];

// 编辑个人信息表单ref
const EditProfileFormRef = ref<any>("");

// 是否为当前用户
const isLoginUser = computed<boolean>(() => {
  return songListInfo.uid === userStore.profile.userId;
});
// 是否为当前页面
const isUserProfilePage = computed<boolean>(() => {
  return route.path == '/user/user-profile';
})

onMounted(() => {
  Object.freeze(city);
});

// 用户id
watch(
  () => route.query.userId,
  (newVal) => {
    if (newVal) {
      songListInfo.uid = newVal as string | number;
    } else {
      // 如果没有传用户id，则使用当前登录的用户id
      songListInfo.uid = userStore.profile.userId;
    }
    isUserProfilePage.value && loadData();
  },
  { immediate: true, deep: true }
);

// 加载数据
function loadData() {
  // 开始加载
  loading.value = true;
  // 获取用户详情
  UserProfileApi.getUserDetail(songListInfo.uid)
    .then(async (res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(new Error("获取用户详情失败"));
      }

      // 获取归属地数据
      cityLive.value = getCityLive(res.data.profile);

      // if (!cityLive.value || cityLive.value == '未知城市' || !isLoginUser) {
      // }
      res.data.profile["cityLive"] = cityLive.value;
      detail.value = res.data;
      profile.value = res.data.profile;
      console.log("获取用户详情成功==>", res.data);
      // 获取用户歌单
      const err = await getUserSongList();
      if (err.message) {
        console.error("这个是获取用户歌单失败的提示==>", err.message);
      }
    })
    .catch((err) => {
      console.log("获取用户详情失败==>", err);
    })
    .finally(() => (loading.value = false));
}

// 获取用户歌单
function getUserSongList() {
  return new Promise<any>((resolve, reject) => {
    SongListApi.getUserSongList({ ...songListInfo })
      .then((res) => {
        const { code, playlist, more } = res.data;
        if (code != 200) {
          reject({ code, message: "获取用户歌单失败" });
        }
        console.log("获取用户歌单成功==>", res.data);
        playList.value = playlist;
        hasMore.value = more;
        resolve(playlist);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 编辑用户信息
const handleEditProfile = () => {
  // 显示弹窗
  EditProfileFormRef.value.show(true);
};

// 用户点击了某一项歌单
const handleSongItem = (item: any) => {
  console.log("用户点击了某一项歌单==>", item);
  // 跳转到歌单详情页
  router.push({
    path: "/song",
    query: {
      songId: item.id,
    },
  });
};

/**
 * 获取归属地
 */
function getCityLive(profile: any): string {
  const c = city.filter(
    (item) => item.id == profile.city || item.id == profile.province
  );
  const province = c[0]?.provinceName ?? "";
  const cityName = c[1]?.cityName ?? "";
  const cityLive = province + cityName;
  if (cityLive == "") {
    return "未知城市";
  }
  const r = c.length > 0 ? cityLive : "未知城市";
  return r;
}

// 子组件触发分页事件回调
function handlePagination(value: any, more?: boolean) {
  // 设置偏移量
  songListInfo.offset = (value.page - 1) * songListInfo.limit! || 0;
  if (more != undefined) {
    hasMore.value = more;
  }
  // 重新获取用户歌单，只有当more为true时才重新获取
  hasMore.value && getUserSongList();
}

// 标签页选项发生变化
function handleTabsClick(tab: TabsPaneContext, event: Event) {
  // 重置获取用户歌单参数
  Object.assign(songListInfo, {
    offset: 0,
    limit: 20,
  });
}

// 编辑个人信息表单完成，重新获取数据
function handleRefresh() {
  // 同时更新pinia里面的数据
  userStore.getLoginStatus().then(() => {
    // 重新获取数据
    loadData();
  });
}
</script>

<template>
  <div class="user-profile" v-if="!isEmptyObject(detail)" v-loading="loading">
    <!-- 顶部头像以及用户信息 -->
    <div class="avatar mb-[50px] grid">
      <div class="flex justify-center items-center">
        <a :href="profile?.avatarUrl" target="_blank" title="查看头像">
          <el-image
            lazy
            style="border-radius: 50%"
            class="w-[200px] h-[200px]"
            :src="profile?.avatarUrl + '?param=200y200'"
            fit="fill"
          />
        </a>
      </div>
      <div class="detail">
        <div class="nickname">
          <div class="text-[25px] font-bold">{{ profile?.nickname }}</div>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <el-image
                v-if="detail.profile.vipRights?.associator?.iconUrl"
                style="width: 35px; height: 13px"
                :src="detail.profile.vipRights?.associator?.iconUrl"
                fit="cover"
              />
              <!-- 用户标签，例如流行歌单达人 -->
              <div class="flex items-center" v-if="detail.identify">
                <el-image
                  v-if="detail.identify?.imageUrl"
                  style="width: 20px; height: 20px"
                  :src="detail.identify?.imageUrl"
                  fit="cover"
                />
                <div class="identify h-[20px] text-[rgb(255,160,33)]">
                  {{ detail.identify?.imageDesc }}
                </div>
              </div>
              <!-- 用户等级 -->
              <a href="https://music.163.com/#/user/level" target="_blank">
                <el-tag type="info" effect="light" round size="small"
                  >Lv{{ detail.level }}</el-tag
                >
              </a>
              <!-- 用户性别 -->
              <div
                :class="{
                  female: profile?.gender == UserGenderEnum.FEMALE,
                  male: profile?.gender == UserGenderEnum.MALE,
                }"
                class="icon w-[18px] h-[18px] ml-[5px] flex items-center justify-center"
              >
                <i-ep-Male
                  v-if="profile?.gender == UserGenderEnum.MALE"
                  class="text-[12px]"
                ></i-ep-Male>
                <i-ep-Female
                  v-else-if="profile?.gender == UserGenderEnum.FEMALE"
                  class="text-[12px]"
                ></i-ep-Female>
              </div>
            </div>

            <!-- 编辑个人信息按钮（仅有当是当前用户时才显示） -->
            <el-button
              v-if="profile.userId === userStore.profile.userId"
              round
              :icon="EditPen"
              @click="handleEditProfile"
              >编辑个人信息</el-button
            >
          </div>
          <el-divider />
        </div>

        <div class="desc">
          <el-descriptions :column="3" border>
            <el-descriptions-item
              v-for="(item, index) in descInfo"
              :key="index"
              :label="item.label"
              :width="`${item.width}px`"
              min-width="100px"
              :span="item.span"
              :align="item.span ? 'left' : 'center'"
            >
              <template #label>
                <div class="flex items-center">
                  <el-icon>
                    <component :is="item.icon" />
                  </el-icon>
                  <span class="ml-[5px]">{{ item.label }}</span>
                </div>
              </template>
              <div
                :class="{
                  'is-click': item.isclick,
                }"
              >
                {{ profile[item.content] }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>

    <!-- 标签选项 -->
    <div class="tabs-container">
      <el-tabs
        v-model="curActiveTab"
        class="tabs mb-[10px]"
        @tab-click="handleTabsClick"
      >
        <el-tab-pane label="创建的歌单" name="createdPlaylistCount" />
        <el-tab-pane label="收藏的歌单" name="subPlaylistCount" />
      </el-tabs>
    </div>

    <!-- 创建的歌单列表以及收藏的歌单列表，动态渲染组件 -->
    <component
      v-if="playList.length"
      :more="hasMore"
      :is="tabsComponentId"
      :playList="playList"
      :songListInfo="songListInfo"
      @pagination="handlePagination"
      @handleSongItem="handleSongItem"
    />

    <!-- 编辑个人信息dialog -->
    <EditProfileForm ref="EditProfileFormRef" @handleFinish="handleRefresh" />
  </div>
</template>

<style lang="scss" scoped>
.user-profile {
  padding-top: 20px;
  padding-right: 30px;
}

.avatar {
  // 设置间隙
  grid-gap: 10px;
  grid-template-columns: 250px 1fr;
}

.detail {
  display: grid;
  // 两行，第一行1fr，第二行2fr
  // grid-template-rows: 1fr 2fr;
}

.nickname {
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

  .identify {
    background-color: rgb(255, 243, 220);
    padding: 0 10px 0 14px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    border-radius: 0 10px 10px 0;
    transform: translateX(-10px);
    position: relative;
    z-index: -1;
  }
}

.desc {
  .is-click {
    cursor: pointer;

    &:hover {
      font-weight: bold;
    }
  }
}

// tabs标签页样式穿透
:deep(.tabs) {
  .el-tabs__item.is-active {
    font-size: 20px;
    font-weight: bold;
    transition: all 0.1s;
  }
}
</style>
