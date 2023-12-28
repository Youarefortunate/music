import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
// 布局组件
export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        // :path(.*) 匹配任何路径
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          title: "discover", // 发现音乐
          icon: "s-faxian",
          affix: true,
          keepAlive: true,
          size: "1.5em",
        },
      },

      {
        path: "401",
        component: () => import("@/views/error-page/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error-page/404.vue"),
        meta: { hidden: true },
      },
    ],
  },

  // 用户个人信息
  {
    path: "/user",
    name: "User",
    component: Layout,
    redirect: "/user/user-profile",
    children: [
      {
        path: "user-profile",
        name: "UserProfile",
        component: () => import("@/views/user-profile/index.vue"),
        meta: {
          title: "user_profile",
          hidden: true,
          keepAlive: true,
          activeMenu: '/dashboard'
        },
      },
    ],
  },

  // 歌单详情页
  {
    path: "/song",
    name: "Song",
    component: Layout,
    redirect: "/song/song-detail",
    children: [
      {
        path: "song-detail",
        name: "SongDetail",
        component: () => import("@/views/song-detail/index.vue"),
        meta: {
          title: "songlist_detail",
          hidden: true,
          keepAlive: true,
          // activeMenu: '/dashboard'
        },
      },
    ],
  },

  // 专辑详情页
  {
    path: "/album",
    name: "Album",
    component: Layout,
    redirect: "/album/album-detail",
    children: [
      {
        path: "album-detail",
        name: "AlbumDetail",
        component: () => import("@/views/album-detail/index.vue"),
        meta: {
          title: "album_detail",
          hidden: true,
          keepAlive: true,
        },
      },
    ],
  },

  // 搜索音乐-音乐详情页
  {
    path: "/search",
    name: "Search",
    component: Layout,
    redirect: "/search/search-music",
    children: [
      {
        path: "search-music",
        name: "SearchMusic",
        component: () => import("@/views/search-music/index.vue"),
        meta: {
          title: "search_music",
          hidden: true,
          keepAlive: true,
          activeMenu: '/dashboard'
        },
      },
    ],
  },

  {
    path: "/video",
    name: "Video",
    component: Layout,
    redirect: "/video/index",
    children: [
      {
        path: "index",
        name: "VideIndex",
        component: () => import("@/views/video/index.vue"),
        meta: {
          title: "video",
          icon: "s-shipin",
          size: "1.5em",
          keepAlive: true,
        },
      },
      {
        path: "all-mv",
        name: "AllMV",
        component: () => import("@/views/video/mv/AllMV.vue"),
        meta: {
          title: "all_mv",
          hidden: true,
          activeMenu: '/video/index',
          keepAlive: true
        },
      },
      {
        path: "mv-detail",
        name: "MVDetail",
        component: () => import("@/views/video/mv/MVDetail.vue"),
        meta: {
          title: "mv_detail",
          hidden: true,
          activeMenu: '/video/index',
          keepAlive: true
        },
      },
      {
        path: "video-detail",
        name: "VideoDetail",
        component: () => import("@/views/video/VideoDetail.vue"),
        meta: {
          title: "video_detail",
          hidden: true,
          activeMenu: '/video/index',
          keepAlive: true
        },
      },
    ],
  },

  {
    path: "/fm",
    name: "FM",
    component: Layout,
    redirect: "/fm/privatefm",
    children: [
      {
        path: "privatefm",
        name: "PrivateFM",
        component: () => import("@/views/private/index.vue"),
        meta: {
          title: "fm",
          icon: "s-fm",
          size: "1.5em",
          keepAlive: true,
        },
      },
    ],
  },

  

  {
    path: "/recently-played",
    name: "RecentlyPlayed",
    component: Layout,
    redirect: "/recently-played/index",
    children: [
      {
        path: "index",
        name: "RecentlyPlayedIndex",
        component: () => import("@/views/recently-played/index.vue"),
        meta: {
          title: "recently_played",
          icon: "s-zuijinbofang",
          size: "1.5em",
          keepAlive: true,
        },
      },
    ],
  },

  {
    path: "/music",
    name: 'Music',
    redirect: '/music/my-like',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: 'my-like',
        name: 'MyLike',
        component: () => import('@/views/song-detail/index.vue'),
        meta: { title: "my_like_music", icon: "s-woxihuandeyinyue", size: "1.5em", keepAlive: true, /** songId: '2815696205', */ jump: true },
      },
    ]
  },


  // 用户创建的歌单
  // {
  //   path: "/create",
  //   component: Layout,
  //   name: "CreateSongList",
  //   redirect: "/create/song-list1",
  //   meta: { title: "创建的歌单", icon: "s-chuangjiandegedan", size: "1.5em", role: ['create-songlist'] },
  //   children: [
  //     {
  //       path: 'song-list1',
  //       name: 'SongList1',
  //       component: () => import('@/views/song-detail/index.vue'),
  //       meta: { title: "创建的歌单1", songId: '8330511372', jump: true, icon: 's-gedan', size: "1.5em", keepAlive: true, },
  //     },
  //     {
  //       path: 'song-list2',
  //       name: 'SongList2',
  //       component: () => import('@/views/song-detail/index.vue'),
  //       meta: { title: "创建的歌单2", songId: '7949849687', jump: true, icon: 's-gedan', size: "1.5em", keepAlive: true, },
  //     },
  //     {
  //       path: 'song-list3',
  //       name: 'SongList3',
  //       component: () => import('@/views/song-detail/index.vue'),
  //       meta: { title: "创建的歌单3", songId: '7203135267', jump: true, icon: 's-gedan', size: "1.5em", keepAlive: true, },
  //     },
  //   ],
  // },
];

// 创建路由
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes as RouteRecordRaw[],
  // 刷新时滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

/**
 * 重置路由
 */
export function resetRouter() {
  router.replace({ path: "/" });
  location.reload();
}

export default router;
