import request from "@/utils/request";
import * as SearchType from './type'

// 音乐相关api
const apiPath = {
  search: '/cloudsearch' || '/search',
  default: '/search/default',
  hot: '/search/hot',
  hotDetail: '/search/hot/detail',
  suggest: '/search/suggest',
};

/**
 * 搜索音乐
 * @description 说明 : 调用此接口 , 传入搜索关键词可以搜索该音乐 / 专辑 / 歌手 / 歌单 / 用户 , 
 * 关键词可以多个 , 以空格隔开 , 如 " 周杰伦 搁浅 "( 不需要登录 ), 可通过 /song/url 接口传入歌曲 id 获取具体的播放链接
 * @param {String} params.keywords : 关键词
 * @param {String | NUmber} params.limit : 返回数量 , 默认为 30 
 * @param {String | NUmber} params.offset : 偏移数量，用于分页 , 如 : 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * @param {String | NUmber} params.type: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合, 2000:声音(搜索声音返回字段格式会不一样)
 */
export function searchMusic(params: SearchType.SearchMusicParams) {
  return request({
    url: apiPath.search,
    method: "get",
    params
  });
}

/**
 * 默认搜索关键词
 * @description 说明 : 调用此接口 , 可获取默认搜索关键词
 */
export function defaultSearchKey() {
  return request({
    url: apiPath.default,
    method: "get",
  });
}

/**
 * 热搜列表(简略)
 * @description 说明 : 调用此接口,可获取热门搜索列表
 */
export function musicHot() {
  return request({
    url: apiPath.hot,
    method: "get",
  });
}

/**
 * 热搜列表(详细)
 * @description 说明 : 调用此接口,可获取热门搜索列表
 */
export function musicHotDetail() {
  return request({
    url: apiPath.hotDetail,
    method: "get",
  });
}

/**
 * 搜索建议
 * @description 说明 : 调用此接口 , 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单信息
 * @param {String} params.keywords : 关键词
 * @param {String} params.type : 关键词type : 如果传 'mobile' 则返回移动端数据
 */
export function searchSuggest(params: SearchType.SearchSuggestParams) {
  return request({
    url: apiPath.suggest,
    method: "get",
    params
  });
}

