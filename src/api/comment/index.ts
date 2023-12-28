import request from "@/utils/request";
import * as CommentType from './type'

// 评论相关api
const apiPath = {
  like: '/comment/like',
  sendOrDeleteComment: '/comment',
};

/**
 * 给评论点赞
 * @description 说明 : 调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对 应评论点赞 ( 需要登录 )
 * @param {String | Number} params.id  资源 id, 如歌曲 id,mv id
 * @param {String | Number} params.cid 评论id
 * @param {String | Number} params.t   是否点赞 , 1 为点赞 ,0 为取消点赞
 * @param {String | Number} params.type: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型
 * @example /comment/like?id=29178366&cid=12840183&t=1&type=0 对应给 https://music.163.com/#/song?id=29178366 最热门的评论点赞
 * @description 注意： 动态点赞不需要传入 id 参数，需要传入动态的 threadId 参数,如：/comment/like?type=6&cid=1419532712&threadId=A_EV_2_6559519868_32953014&t=0， threadId 可通过 /event，/user/event 接口获取
 */
export function LikeTheComments(params: CommentType.LikeTheCommentsParams) {
  return request({
    url: apiPath.like,
    method: "get",
    params
  });
}

/**
 * 发送/删除评论
 * @description 说明 : 调用此接口,可发送评论或者删除评论
 * @param {Number} params.id:对应资源 id `必选`
 * @param {Number} params.t:0 删除, 1 发送, 2 回复 `必选`
 * @param {Number} params.content :要发送的内容
 * @param {Number} params.commentId :回复的评论 id (回复评论时必填)（仅在回复他人评论时用到）
 * @param {Number | String} params.type: 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型: 0: 歌曲 1: mv 2: 歌单 3: 专辑 4: 电台 5: 视频 6: 动态 `必选`
 * @example /comment?t=1&type=1&id=5436712&content=test (往广岛之恋 mv 发送评论: test)
 * @link https://binaryify.github.io/NeteaseCloudMusicApi/#/?id=%e5%8f%91%e9%80%81%e5%88%a0%e9%99%a4%e8%af%84%e8%ae%ba
 */
export function sendOrDeleteComment(params: CommentType.SendOrDeleteCommentParams) {
  return request({
    url: apiPath.sendOrDeleteComment,
    method: "get",
    params
  });
}
