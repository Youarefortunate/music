import request from "@/utils/request";
import * as AlbumType from './type'

// 专辑相关api
const apiPath = {
  all: '/album/new',
  new: '/album/newest',
  detail: '/album',
  subscribe: '/album/sub',
  comment: '/comment/album'
};

/**
 * 全部新碟
 * @description 说明 : 登录后调用此接口 ,可获取全部新碟
 * @param {Number} params.limit : 返回数量 , 默认为 30
 * @param {Number} params.offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * @param {String} params.area : ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
 */
export function getAllAlbumList(params: AlbumType.AlbumTypeParam) {
  return request({
    url: apiPath.all,
    method: "get",
    params
  });
}

/**
 * 获取专辑内容
 * @description 说明 : 调用此接口 , 传入专辑 id, 可获得专辑内容
 * @param {Number} params.id: 专辑 id `必选`
 */
export function getAlbumDetail(id: string | number) {
  return request({
    url: apiPath.detail + '?id=' + id,
    method: "get",
  });
}

/**
 * 最新专辑
 * @description 说明 : 调用此接口 ，获取云音乐首页新碟上架数据
 */
export function getNewestAlbum() {
  return request({
    url: apiPath.new,
    method: "get",
  });
}

/**
 * 收藏/取消收藏专辑
 * @description 说明 : 调用此接口,可收藏/取消收藏专辑
 * @param {String | Number} params.t  类型: 1 为收藏,其他为取消收藏
 * @param {String | Number} params.id 专辑 id `必选`
 */
export function subscribedAlbum(params: AlbumType.SubscribedAlbumParams) {
  return request({
    url: apiPath.subscribe,
    method: "get",
    params
  });
}

/**
 * 获取专辑评论
 * @description 说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该专辑的所有评论 ( 不需要 登录 )
 * @param {String | Number} params.id: 专辑 id `必选`
 * @param {String | Number} params.limit: 取出评论数量 , 默认为 20 `可选`
 * @param {String | Number} params.offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值 `可选`
 * @param {String | Number} params.before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到) `可选`
 */
export function getAlbumComment(params: AlbumType.AlbumCommentParams) {
  return request({
    url: apiPath.comment,
    method: "get",
    params
  });
}
