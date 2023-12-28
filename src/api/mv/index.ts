import request from "@/utils/request";
import * as MVType from './type'

// mv相关api
const apiPath = {
  all: '/mv/all',
  first: '/mv/first',
  rcmd: '/mv/exclusive/rcmd',
  rank: '/top/mv',
  detail: '/mv/detail',
  info: '/mv/detail/info',
  url: '/mv/url',
  comment: '/comment/mv',
  sub: '/mv/sub'
};

/**
 * 全部 mv
 * @description 说明 : 调用此接口 , 可获取全部 mv
 * @param {Number} params.limit: 取出数量 , 默认为 30 `可选`
 * @param {Number} params.offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*50, 其中 50 为 limit 的值 , 默认 为 0 `可选`
 * @param {Number} params.order: 排序,可选值为上升最快,最热,最新,不填则为上升最快 `可选`
 * @param {Number} params.area: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部 `可选`
 * @param {Number} params.type: 类型,可选值为全部,官方版,原生,现场版,网易出品,不填则为全部 `可选`
 */
export function getAllMVList(params: MVType.AllMVListParam) {
  return request({
    url: apiPath.all,
    method: "get",
    params
  });
}

/**
 * 最新 mv
 * @description 说明 : 调用此接口 , 可获取最新 mv
 * @param {Number} params.limit: 取出数量 , 默认为 30 `可选`
 * @param {Number} params.area: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部 `可选`
 */
export function getNewestMV(params: MVType.NewestMVParam) {
  return request({
    url: apiPath.first,
    method: "get",
    params
  });
}

/**
 * 网易出品 mv
 * @description 说明 : 调用此接口 , 可获取网易出品 mv
 * @param {Number} params.limit: 取出数量 , 默认为 30 `可选`
 * @param {Number} params.offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认 为 0 `可选`
 */
export function getRCMDMV(params: MVType.RCMDMVParam) {
  return request({
    url: apiPath.rcmd,
    method: "get",
    params
  });
}

/**
 * mv 排行
 * @description 说明 : 调用此接口 , 可获取 mv 排行
 * @param {Number} params.area: 地区,可选值为内地,港台,欧美,日本,韩国,不填则为全部 `可选`
 * @param {Number} params.limit: 取出数量 , 默认为 30 `可选`
 * @param {Number} params.offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认 为 0 `可选`
 */
export function getMVRanking(params: MVType.MVRankingParam) {
  return request({
    url: apiPath.rank,
    method: "get",
    params
  });
}

/**
 * 获取 mv 数据
 * @description 说明 : 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应 MV 数据 , 数据包含 mv 名字 , 歌手 , 发布时间 , 
 * mv 视频地址等数据 , 其中 mv 视频 网易做了防盗链处理 , 可能不能直接播放 , 需要播放的话需要调用 ' mv 地址' 接口
 * @param {Number} mvid: mv 的 id `必选`
 */
export function getMVDetail(mvid: number) {
  return request({
    url: apiPath.detail + '?mvid=' + mvid,
    method: "get",
  });
}

/**
 * 获取 mv 点赞转发评论数数据
 * @description 说明 : 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应 MV 点赞转发评论数数据
 * @param {Number} mvid: mv 的 id `必选`
 */
export function getMVDetailInfo(mvid: number) {
  return request<MVType.MVDetailInfo>({
    url: apiPath.info + '?mvid=' + mvid,
    method: "get",
  });
}

/**
 * mv 地址
 * @description 说明 : 调用此接口 , 传入 mv id,可获取 mv 播放地址
 * @param {Number | String} params.id: mv id `必选`
 * @param {Number} params.r: 分辨率,默认 1080,可从 /mv/detail 接口获取分辨率列表 `可选`
 */
export function getMVUrl(params: MVType.MVUrlParams) {
  return request({
    url: apiPath.url,
    method: "get",
    params
  });
}


/**
 * 获取mv评论
 * @description 说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 mv 的所有评论 ( 不需要 登录 )
 * @param {String | Number} params.id: mv id `必选`
 * @param {String | Number} params.limit: 取出评论数量 , 默认为 20 `可选`
 * @param {String | Number} params.offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值 `可选`
 * @param {String | Number} params.before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到) `可选`
 */
export function getMVComment(params: MVType.MVCommentParams) {
  return request({
    url: apiPath.comment,
    method: "get",
    params
  });
}

/**
 * 收藏/取消收藏 MV
 * @description 说明 : 调用此接口,可收藏/取消收藏 MV
 * @param {String | Number} params.t  类型: 1:收藏, 2:取消收藏 `必选`
 * @param {String | Number} params.mvid : MV id `必选`
 */
export function subscribedMV(params: MVType.SubscribedMVParams) {
  return request({
    url: apiPath.sub,
    method: "get",
    params
  });
}


