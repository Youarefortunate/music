import request from "@/utils/request";

// 视频相关api
const apiPath = {
  song: '/record/recent/song'
};

/**
 * 最近播放-歌曲
 * @description 说明 : 调用此接口 , 可获得最近播放-歌曲
 * @param {Number} limit : 返回数量 , 默认为 100 `可选`
 */
export function getRecentlyMusicList(limit: number = 100) {
  return request({
    url: apiPath.song + '?limit=' + limit,
    method: "get",
  });
}
