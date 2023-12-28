import * as CommentEnum from '@/enums/CommentEnum'
import { SendCommentEnum, DeleteCommentEnum, SendType, DeleteType } from '@/enums/SendORDeleteCommentEnum'

/**
 * 点赞评论参数
*/
export interface LikeTheCommentsParams {
  id?: string | number;
  cid: string | number;
  t: CommentEnum.LikeTheCommentEnum;
  type: CommentEnum.CommentTypeEnum;
  /** 动态点赞会用到 */ 
  threadId?: string | number;
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