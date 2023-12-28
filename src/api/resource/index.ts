import request from "@/utils/request";
import * as ResourceType from './type'

// 评论相关api
const apiPath = {
  like: '/resource/like',
};

/**
 * 资源点赞( MV,电台,视频)
 * @description 说明 : 调用此接口 , 可对 MV,电台,视频点赞
 * @param {String | Number} params.id: 资源 id `必选`
 * @param {String | Number} params.t: 操作,1 为点赞,其他为取消点赞 `必选`
 * @param {String | Number} params.type  资源类型,对应以下类型：0: 歌曲 1: mv 2: 歌单 3: 专辑 4: 电台节目 5: 视频 6: 动态 7: 电台 `必选`
 * @example /resource/like?t=1&type=1&id=5436712
 * @description 注意：如给动态点赞，不需要传入 id，需要传入 threadId,可通过 event,/user/event 接口获取，如： /resource/like?t=1&type=6&threadId=A_EV_2_6559519868_32953014
 */
export function LikeTheResource(params: ResourceType.LikeTheResourceParams) {
  return request({
    url: apiPath.like,
    method: "get",
    params
  });
}