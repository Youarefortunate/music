import request from "@/utils/request";
import * as VideoType from './type'

// 视频相关api
const apiPath = {
  all: '/video/timeline/all',
  recommend: '/video/timeline/recommend',
  catelist: '/video/category/list',
  grouplist: '/video/group/list',
  group: '/video/group',
  detail: '/video/detail',
  info: '/video/detail/info',
  url: '/video/url',
  comment: '/comment/video',
  sub: '/video/sub'
};

/**
 * 获取全部视频列表
 * @description 说明 : 调用此接口,可获取视频分类列表,分页参数只能传入 offset
 * @param {Number} offset: 默认 0 `可选`
 */
export function getAllVideoList(offset?: number) {
  return request({
    url: apiPath.all,
    method: "get",
    params: { offset }
  });
}

/**
 * 获取推荐视频
 * @description 说明 : 调用此接口, 可获取推荐视频,分页参数只能传入 offset
 * @param {Number} offset: 默认 0 `可选`
 */
export function getRecommendVideo(offset?: number) {
  return request({
    url: apiPath.recommend,
    method: "get",
    params: { offset }
  });
}

/**
 * 获取视频分类列表
 * @description 说明 : 调用此接口 , 可获取视频分类列表，这个接口是部分分类的接口
 */
export function getPartCateList() {
  return request({
    url: apiPath.catelist,
    method: "get",
  });
}

/**
 * 获取全部视频标签列表
 * @description 说明 : 调用此接口 , 可获取视频标签列表，这个是全部的
 */
export function getAllCateList() {
  return request({
    url: apiPath.grouplist,
    method: "get",
  });
}

/**
 * 获取视频标签/分类下的视频
 * @description 说明 : 调用此接口 , 传入标签/分类id,可获取到相关的视频,分页参数只能传入 offset
 * @param {Number | String} params.id: videoGroup 的 id `必选`
 * @param {Number} params.offset: 默认 0 `可选`
 */
export function getVideoGroup(params: VideoType.VideoGroupParams) {
  return request({
    url: apiPath.group,
    method: "get",
    params
  });
}

/**
 * 视频详情
 * @description 说明 : 调用此接口 , 可获取视频详情
 * @param {String} id: 视频 的 id `必选`
 */
export function getVideoDetailInfo(id: string) {
  return request({
    url: apiPath.detail + '?id=' + id,
    method: "get",
  });
}

/**
 * 获取视频点赞转发评论数数据
 * @description 说明 : 调用此接口 , 传入 vid ( 视频 id ) , 可获取对应视频点赞转发评论数数据
 * @param {Number} vid: 视频 id `必选`
 */
export function getMVDetailInfo(vid: string) {
  return request<VideoType.VideoDetailInfo>({
    url: apiPath.info + '?vid=' + vid,
    method: "get",
  });
}

/**
 * video 地址
 * @description 说明 : 调用此接口 , 传入视频 id,可获取视频播放地址
 * @param {String} params.id: 视频 的 id `必选`
 */
export function getVideoUrl(id: string) {
  return request({
    url: apiPath.url + '?id=' + id,
    method: "get",
  });
}

/**
 * 视频评论
 * @description 说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 视频 的所有评论 ( 不需要登录 )
 * @param {String | Number} params.id: 视频的 id `必选`
 * @param {String | Number} params.limit: 取出评论数量 , 默认为 20 `可选`
 * @param {String | Number} params.offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值 `可选`
 * @param {String | Number} params.before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到) `可选`
 */
export function getVideoComment(params: VideoType.VideoCommentParams) {
  return request({
    url: apiPath.comment,
    method: "get",
    params
  });
}

/**
 * 收藏视频
 * @description 说明 : 调用此接口,可收藏视频
 * @param {String | Number} params.id : 视频 id `必选`
 * @param {String | Number} params.t : 1 为收藏,其他为取消收藏 `可选`
 */
export function subscribedVideo(params: VideoType.SubscribedVideoParams) {
  return request({
    url: apiPath.sub,
    method: "get",
    params
  });
}
