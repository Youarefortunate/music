import { SubscribeType } from '@/enums/SubscribeEnum'

/**
 * 获取视频标签/分类下的视频参数
*/ 
export interface VideoGroupParams {
  id: number | string,
  offset?: number
}

/**
 * 获取mv点赞转发评论返回数据类型
*/
export interface VideoDetailInfo {
  code?: number,
  commentCount: number,
  liked: boolean,
  likedCount: number,
  shareCount: number,
}

/**
 * 获取video评论参数类型
*/
export interface VideoCommentParams extends PageQueryParams {
  id: string | number,
}

/**
 * 收藏video参数类型
*/
export interface SubscribedVideoParams {
  id: string | number,
  t: SubscribeType,
}
