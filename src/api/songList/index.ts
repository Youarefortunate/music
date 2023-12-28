import request from "@/utils/request";
import * as SongListType from './type'

// 歌单相关api
const apiPath = {
  playlist: "/user/playlist",
  detail: '/playlist/detail',
  subscribed: '/playlist/subscribers',
  comment: '/comment/playlist',
  subscribe: '/playlist/subscribe',
  sendOrDeleteComment: '/comment',
  subcount: '/user/subcount',
  cate: '/playlist/hot',
  songlist: '/top/playlist',
  catlist: '/playlist/catlist'
};

/**
 * 获取用户歌单
 * @description 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单
 * @param {String} params.uid 用户id `必选`
 * @param {Number} params.limit 返回数量 , 默认为 30 `可选`
 * @param {String} params.offset 偏移数量，用于分页 , 如 :( 页数 - 1)*30, 其中 30 为 limit 的值 , 默认为 0 `可选`
 */
export function getUserSongList(params: SongListType.PlaylistParams) {
  return request({
    url: apiPath.playlist,
    method: "get",
    params
  });
}

/**
 * 获取歌单详情
 * @description 说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 
 * 传入歌单 id, 可 以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，但
 * 是返回的 trackIds 是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 song/detail 接口获
 * 取所有歌曲的详情 (https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452)
 * @param {String} params.id 歌单id `必选`
 * @param {Number} params.s 歌单最近的 s 个收藏者,默认为 8 `可选`
 */
export function getSongListDetailById(params: SongListType.SongDetailParams) {
  return request({
    url: apiPath.detail,
    method: "get",
    params
  });
}

/**
 * 获取一个歌单的全部收藏者
 * @description 说明 : 调用此接口 , 传入歌单 id 可获取歌单的所有收藏者
 * @param {String | Number} params.id 歌单id
 * @param {String | Number} params.limit limit: 取出评论数量 , 默认为 20
 * @param {String | Number} params.offset  偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值
 */
export function getAllSongListSubscribed(params: SongListType.SongListSubscribed) {
  return request({
    url: apiPath.subscribed,
    method: "get",
    params
  });
}

/**
 * 获取歌单评论
 * @description 说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该歌单的所有评论 ( 不需要 登录 )
 * @param {String | Number} params.id 歌单id
 * @param {String | Number} params.limit limit: 取出评论数量 , 默认为 20
 * @param {String | Number} params.offset  偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值
 * @param {String | Number} params.before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到)
 */
export function getSongListComment(params: SongListType.SongListCommentParams) {
  return request({
    url: apiPath.comment,
    method: "get",
    params
  });
}

/**
 * 收藏/取消收藏歌单
 * @description 说明 : 调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单
 * @param {String | Number} params.t  类型: 1:收藏, 2:取消收藏
 * @param {String | Number} params.id 歌单 id
 */
export function subscribedSong(params: SongListType.SubscribedSongParams) {
  return request({
    url: apiPath.subscribe,
    method: "get",
    params
  });
}

/**
 * 发送/删除评论
 * @description 说明 : 调用此接口,可发送评论或者删除评论
 * @link https://binaryify.github.io/NeteaseCloudMusicApi/#/?id=%e5%8f%91%e9%80%81%e5%88%a0%e9%99%a4%e8%af%84%e8%ae%ba
 */
export function sendOrDeleteComment(params: SongListType.SendOrDeleteCommentParams) {
  return request({
    url: apiPath.sendOrDeleteComment,
    method: "get",
    params
  });
}

/**
 * 获取用户信息 , 歌单，收藏，mv, dj 数量
 * @description 说明 : 登录后调用此接口 , 可以获取用户信息 , 歌单，收藏，mv, dj 数量
 */
export function getUserSubcount() {
  return request({
    url: apiPath.subcount,
    method: "get",
  });
}

/**
 * 热门歌单分类
 * @description 说明 : 调用此接口,可获取歌单分类,包含 category 信息
 */
export function getHotSongListCate() {
  return request({
    url: apiPath.cate,
    method: "get",
  });
}

/**
 * 歌单分类
 * @description 说明 : 调用此接口,可获取歌单分类,包含 category 信息
 */
export function getSongListCatList() {
  return request({
    url: apiPath.catlist,
    method: "get",
  });
}

/**
 * 歌单 ( 网友精选碟 )
 * @description 说明 : 调用此接口 , 可获取网友精选碟歌单
 * @param params.order: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为 'hot' `可选`
 * @param params.cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从歌单分类接口获取(/playlist/catlist)
 * @param params.limit: 取出歌单数量 , 默认为 50
 * @param params.offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*50, 其中 50 为 limit 的值
 * @example /top/playlist?limit=10&order=new
 */
export function getSongList(params: SongListType.SongListParams) {
  return request({
    url: apiPath.songlist,
    method: "get",
    params
  });
}

