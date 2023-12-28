import request from "@/utils/request";

// 私人FM相关api
const apiPath = {
  fm: '/personal_fm',
  trash: '/fm_trash'
};

/**
 * 私人 FM
 * @description 说明 : 私人 FM( 需要登录 )
 */
export function getPersonalFM() {
  return request({
    url: apiPath.fm,
    method: "get",
  });
}

/**
 * 垃圾桶
 * @description 说明 : 调用此接口 , 传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶
 * @param {Number | String} id: 歌曲 id
 */
export function fmTrash(id: number | string) {
  return request({
    url: apiPath.trash + '?id=' + id,
    method: "get",
  });
}


