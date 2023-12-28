import * as MusicInfoEnum from '@/enums/MusicInfoEnum';
import { SendCommentEnum, DeleteCommentEnum, SendType, DeleteType } from '@/enums/SendORDeleteCommentEnum'

/**
 * 喜欢音乐参数
 */
export interface LikeMusicParam {
  id: string | number;
  like: boolean;
}

/**
 * 获取音乐url请求参数
 */
export interface MusicURLByIdsParam {
  id: string | number;
  level: MusicInfoEnum.MusicLevelEnum;
}

/**
 * 获取歌曲评论参数
*/
export interface MusicCommentParam extends PageQueryParams {
  id: string | number;
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

/**
 * 获取歌单所有歌曲参数
*/ 
export interface GetPlayListAllSongParams {
  id: string | number,
  // 返回数量 , 默认为 30
  limit?: number,
  // 偏移数量，用于分页, 规则(当前页码 - 1) * limit
  offset?: number
}
