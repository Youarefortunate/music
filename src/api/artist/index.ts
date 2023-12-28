import request from "@/utils/request";
import * as ArtistType from './type'

// 歌手相关api
const apiPath = {
  artist: '/artist/list'
};

/**
 * 歌手分类列表
 * @description 说明 : 调用此接口,可获取歌手分类列表
 * @param {Number | String} params.limit : 返回数量 , 默认为 30 `可选`
 * @param {Number | String} params.offset : 偏移数量，用于分页 , 如 : 如 :( 页数 -1)*30, 其中 30 为 limit 的值, 默认为 0 `可选`
 * @param {Number | String} params.initial: 按首字母索引查找参数 `可选`
 * @param {Number | String} params.area: 哪一个地区的歌手，-1:全部 7华语 96欧美 8:日本 16韩国 0:其他 `可选`
 * @param {Number | String} params.type: 搜索的歌手类型，-1:全部 1:男歌手 2:女歌手 3:乐队 `可选`
 * @example 例1 /artist/list?type=1&area=96&initial=b 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列, 热门传-1,#传 0
 * @example 例2 /artist/list?type=1&area=96&initial=b /artist/list?type=2&area=2&initial=b
 */
export function getArtistList(params: ArtistType.ArtistListParams) {
  return request({
    url: apiPath.artist,
    method: "get",
    params
  });
}
