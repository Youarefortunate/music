import request from "@/utils/request";
import * as HighqualityType from './type'

// 精品歌单相关api
const apiPath = {
  highquality: "/top/playlist/highquality",
  tags: '/playlist/highquality/tags'
};

/**
 * 获取精品歌单
 * @description 说明 : 调用此接口 , 可获取精品歌单
 * @param {String} params.cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从精品歌单标签列表接口获取(/playlist/highquality/tags) `可选`
 * @param {Number} params.limit: 取出歌单数量 , 默认为 50 `可选`
 * @param {String} params.before: 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据 `可选`
 * @example /top/playlist/highquality?before=1503639064232&limit=3
 */
export function getHighqualitySongList(params: HighqualityType.HighqualitySongListParams) {
  return request({
    url: apiPath.highquality,
    method: "get",
    params
  });
}

/**
 * 精品歌单标签列表
 * @description 说明 : 调用此接口 , 可获取精品歌单标签列表
 */
export function getHighqualitySongListTag() {
  return request({
    url: apiPath.tags,
    method: "get",
  });
}