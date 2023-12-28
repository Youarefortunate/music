import request from "@/utils/request";
import { AxiosPromise } from "axios";

const apiPath = {
  banner: "/banner",
  RecommendSongList: "/personalized",
};

/**
 * 获取pc端轮播图
 * @param {Number} type 资源类型,对应以下类型,默认为 0 即 PC
 */
export function getBanner(type: number = 0) {
  return request({
    url: apiPath.banner,
    method: "get",
    params: { type },
  });
}

/**
 * 获取推荐歌单 (无需登录)
 * @param {Number} limit 取出数量 , 默认为 30 (不支持 offset)
 */
export function getRecommendSongList(limit?: number) {
  return request({
    url: apiPath.RecommendSongList,
    method: "get",
    params: { limit },
  });
}
