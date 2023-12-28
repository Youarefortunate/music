import type { LocationQueryValue } from 'vue-router'
import { SubscribeType } from '@/enums/SubscribeEnum'
import { SendCommentEnum, DeleteCommentEnum, SendType, DeleteType } from '@/enums/SendORDeleteCommentEnum'
/**
 * 获取用户歌单参数
*/
export interface PlaylistParams {
  uid: string | number,
  // 返回数量 , 默认为 30
  limit?: number,
  // 偏移数量，用于分页, 规则(当前页码 - 1) * limit
  offset?: number
}

/**
 * 歌单详情参数 
 */
export interface SongDetailParams {
  id: string | LocationQueryValue[],
  s?: string | number
}

/**
 * 歌单全部订阅者
 */
export interface SongListSubscribed {
  id: string | number,
  limit?: string | number,
  offset?: string | number,
}

/**
 * 一个歌单的所有评论
*/
export interface SongListCommentParams {
  id: string | number,
  limit?: string | number,
  offset?: string | number,
  before?: number,
}

/**
 * 歌单收藏参数
*/
export interface SubscribedSongParams {
  id: string | number,
  t: SubscribeType,
}

/**
 * 发送/删除评论
*/
export interface SendOrDeleteCommentParams {
  t: SendCommentEnum | DeleteCommentEnum,
  type: SendType | DeleteType,
  id: string | number,
  content?: string,
  /** 回复的评论id(回复评论时必填) */
  commentId?: string | number,
}

export type SongListOrderType = 'hot' | 'new'
/**
 * 歌单 ( 网友精选碟 )参数
*/
export interface SongListParams extends PageQueryParams {
  // 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为 'hot'
  order?: SongListOrderType,
  cat?: string,
}