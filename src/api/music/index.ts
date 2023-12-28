import request from "@/utils/request";
import * as MusicType from './type'

// 音乐相关api
const apiPath = {
  like: '/like',
  urlV1: '/song/url/v1',
  comment: '/comment/music',
  lyric: '/lyric',
  sendOrDeleteComment: '/comment',
  detail: '/song/detail',
  getSongListAllSong: '/playlist/track/all'
};

/**
 * 喜欢音乐
 * @description 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * @param {Number | String} params.id 歌曲id
 * @param {Boolean} params.like 布尔值 , 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 */
export function likeMusic(params: MusicType.LikeMusicParam) {
  return request({
    url: apiPath.like,
    method: "get",
    params
  });
}

/**
 * 获取音乐 url - 新版
 * @description 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 
 *  可以获取对应的音乐的 url,未登录状态或者非会员返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间),注 : 部分用户反馈获取的 url
 *  会 403,hwaphon找到的解决方案是当获取到音乐的 id 后，将 https://music.163.com/song/media/outer/url?id=id.mp3 以 src 赋予 Audio 即可播放
 * @param {Number | String} params.id 音乐 id
 * @param {Boolean} params.level  播放音质等级, 分为 standard => 标准,higher => 较高, exhigh=>极高, lossless=>无损, hires=>Hi-Res, 
 * jyeffect => 高清环绕声, sky => 沉浸环绕声, jymaster => 超清母带
 */
export function getMusicURLByIds(params: MusicType.MusicURLByIdsParam) {
  return request({
    url: apiPath.urlV1,
    method: "get",
    params
  });
}

/**
 * 歌曲评论
 * @description 说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该音乐的所有评论 ( 不需要登录 )
 * @param {Number | String} params.id 歌曲id
 * @param {Number | String} params.limit: 取出评论数量 , 默认为 20
 * @param {Number | String} params.offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*20, 其中 20 为 limit 的值
 * @param {Number | String} params.before: 分页参数,取上一页最后一项的 time 获取下一页数据(获取超过 5000 条评论的时候需要用到)
 */
export function getMusicComment(params: MusicType.MusicCommentParam) {
  return request({
    url: apiPath.comment,
    method: "get",
    params
  });
}

/**
 * 获取歌词
 * @description 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 * @param {Number | String} params.id 歌曲id
 */
export function getSongLyric(params: MusicType.MusicCommentParam) {
  return request({
    url: apiPath.lyric,
    method: "get",
    params
  });
}

/**
 * 发送/删除评论
 * @description 说明 : 调用此接口,可发送评论或者删除评论
 * @link https://binaryify.github.io/NeteaseCloudMusicApi/#/?id=%e5%8f%91%e9%80%81%e5%88%a0%e9%99%a4%e8%af%84%e8%ae%ba
 */
export function sendOrDeleteComment(params: MusicType.SendOrDeleteCommentParams) {
  return request({
    url: apiPath.sendOrDeleteComment,
    method: "get",
    params
  });
}

/**
 * 获取歌曲详情
 * @description 说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 , 隔开), 可获得歌曲详情(dt为歌曲时长)
 * @param {String} ids 音乐 id，可以是一个也可以是多个，多个用逗号隔开
 * @example1 /song/detail?ids=347230
 * @example2 /song/detail?ids=347230,347231
 */
export function getSongDetailByIds(ids: string) {
  return request({
    url: apiPath.detail,
    method: "get",
    params: { ids }
  });
}

/**
 * 获取歌单所有歌曲
 * @description 说明 : 由于网易云接口限制，歌单详情只会提供 10 首歌，通过调用此接口，传入对应的歌单id，即可获得对应的所有歌曲
 * @param {Number|String} params.id  歌单 id
 * @param {Number} params.limit  限制获取歌曲的数量，默认值为当前歌单的歌曲数量
 * @param {Number} params.offset  默认值为0
 * 注：关于offset，你可以这样理解，假设你当前的歌单有200首歌,你传入limit=50&offset=0等价于limit=50，你会得到第1-50首歌曲
 * 你传入limit=50&offset=50，你会得到第51-100首歌曲，如果你设置limit=50&offset=100，你就会得到第101-150首歌曲
 */
export function getSongListAllSong(params: MusicType.GetPlayListAllSongParams) {
  return request({
    url: apiPath.getSongListAllSong,
    method: "get",
    params
  });
}