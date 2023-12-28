import request from "@/utils/request";

// 歌单相关api
const apiPath = {
  toplist: "/toplist",
  detail: '/toplist/detail'
};

/**
 * 所有榜单
 * @description 说明 : 调用此接口,可获取所有榜单
 */
export function getTopList() {
  return request({
    url: apiPath.toplist,
    method: "get",
  });
}

/**
 * 所有榜单内容摘要
 * @description 说明 : 调用此接口,可获取所有榜单内容摘要
 */
export function getTopListDetail() {
  return request({
    url: apiPath.detail,
    method: "get",
  });
}