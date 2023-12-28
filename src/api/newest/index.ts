import request from "@/utils/request";
import * as NewestType from './type'

// 最新音乐相关api
const apiPath = {
  new: '/top/song'
};

/**
 * 新歌速递
 * @description 说明 : 调用此接口 , 可获取新歌速递
 * @param {Number} params.type: 地区类型 id,对应以下: 全部:0 华语:7 欧美:96 日本:8 韩国:16 `必选`
 */
export function getTopNewSong(params: NewestType.NewestTypeParam) {
  return request({
    url: apiPath.new,
    method: "get",
    params
  });
}
