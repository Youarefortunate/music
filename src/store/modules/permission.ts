import router from "@/router";
import { RouteRecordRaw } from "vue-router";
import { defineStore } from "pinia";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import * as SongListApi from "@/api/songList";
import { useUserStoreHook } from "@/store/modules/user";

const Layout = () => import("@/layout/index.vue");
const userStore = useUserStoreHook();

// setup
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);
  // 用户喜欢的歌单id
  const userLikeSongListId = ref<number | string | undefined>();
  // 用户创建的歌单
  const userSongList = ref<any>([]);
  // 用户收藏的歌单
  const userCollectSongList = ref<any>([]);

  // actions
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    routes.value = constantRoutes.concat(newRoutes);
  }
 
  /**
   * 生成动态路由
   */
  async function generateRoutes() {
    return new Promise<RouteRecordRaw[]>(async (resolve, reject) => {
      // 获取用户userId
      const userId: string | number = userStore.profile?.userId;
      // 通过用户userId获取用户歌单
      await SongListApi.getUserSongList({ uid: userId })
        .then((result) => {
          const { code, playlist } = result.data;
          if (code != 200) {
            return ElMessage.error('动态生成用户创建歌单、收藏歌单失败');
          }
          // 过滤用户歌单
          filterSongList(playlist, userId);
          // 生成登录之后的动态路由
          const accessedRoutes = filterAsyncRoutes();
          setRoutes(accessedRoutes);
          resolve(accessedRoutes);
        })
        .catch((err) => {
          reject(err);
        });
    })
  }

  /**
  * 递归过滤有权限的异步(动态)路由
  *
  * @param routes 接口返回的异步(动态)路由
  * @returns 返回用户有权限的异步(动态)路由
  */
  function filterAsyncRoutes(): RouteRecordRaw[] {
    const asyncRoutes: RouteRecordRaw[] = [];
    //#region 只有登录之后才会显示用户喜欢的音乐路由
    // 用户喜欢的音乐
    const userLikeMusic = constantRoutes.filter(route => route.path == '/music');
    
    // 用户喜欢的音乐
    if(userLikeSongListId.value) {
      userLikeMusic.forEach(r => {
        r.meta!.hidden = false;
        r.children![0].meta!.songId = userLikeSongListId.value;
      })
    } else {
      userLikeMusic[0].meta!.hidden = true;
    }
    //#endregion
    // 如果用户创建有歌单才显示
    if (userSongList.value.length) {
      const routeRecord: RouteRecordRaw = {
        path: '/create',
        name: 'CreateSongList',
        redirect: `/create/songList${userSongList.value[0].id}?songId=${userSongList.value[0].id}`,
        component: Layout,
        meta: { title: 'create_playlist', icon: "s-chuangjiandegedan", size: "1.5em" },
        children: []
      }
      userSongList.value.forEach((s: any) => {
        const child: RouteRecordRaw = {
          path: `/create/songList${s.id}`,
          name: `SongList${s.id}`,
          component: () => import('@/views/song-detail/index.vue'),
          meta: { title: s.name, songId: s.id, jump: true, icon: 's-gedan', size: "1.5em", keepAlive: true }
        }

        if (routeRecord.children!.length == 0 || (routeRecord.children!.length && !routeRecord.children!.some(c => c.meta?.songId == s.id))) {
          routeRecord.children!.push(child)
        }
      })
      asyncRoutes.push(routeRecord)
    }

    // 如果用户收藏有歌单才显示
    if (userCollectSongList.value.length) {
      const routeRecord: RouteRecordRaw = {
        path: '/collect',
        name: 'CollectSongList',
        redirect: `/collect/songList${userCollectSongList.value[0].id}?songId=${userCollectSongList.value[0].id}`,
        component: Layout,
        meta: { title: 'collect_playlist', icon: "s-shoucang", size: "1.5em" },
        children: []
      }
      userCollectSongList.value.forEach((s: any) => {
        const child: RouteRecordRaw = {
          path: `/collect/songList${s.id}`,
          name: `CollectList${s.id}`,
          component: () => import('@/views/song-detail/index.vue'),
          meta: { title: s.name, songId: s.id, jump: true, icon: 's-gedan', size: "1.5em", keepAlive: true }
        }

        if (routeRecord.children!.length == 0 || (routeRecord.children!.length && !routeRecord.children!.some(c => c.meta?.songId == s.id))) {
          routeRecord.children!.push(child)
        }
      })
      asyncRoutes.push(routeRecord)
    }
    return asyncRoutes;
  };

  /**
   * 过滤用户歌单
   * @param {Any} songlist 歌单列表
   * @param {Number | String} curUserId 当前登录的用户userId
   */
  function filterSongList(songlist: any, curUserId: number | string) {
    // 用户喜欢的歌单id
    userLikeSongListId.value =
      songlist.filter((item: any) => item.name.indexOf("喜欢的音乐") != -1)[0]
        ?.id || undefined;
    if (userLikeSongListId.value != undefined) {
      songlist = songlist.filter(
        (item: any) => item.id != userLikeSongListId.value
      );
    }
    // 用户自己创建的歌单
    userSongList.value =
      songlist.filter((item: any) => item.creator.userId == curUserId) || [];
    // 用户收藏的歌单
    userCollectSongList.value =
      songlist.filter((item: any) => item.creator.userId != curUserId) || [];
  }

   /**
   * 重置权限状态
   */
   function reset() {
    routes.value = constantRoutes;
    userLikeSongListId.value = undefined;
    userSongList.value = [];
    userCollectSongList.value = [];
  }

  return {
    routes,
    userLikeSongListId,
    userSongList,
    userCollectSongList,
    reset,
    setRoutes,
    generateRoutes,
  };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
