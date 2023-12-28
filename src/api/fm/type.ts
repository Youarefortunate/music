import * as MVEnum from '@/enums/MVEnum'
import { SubscribeType } from '@/enums/SubscribeEnum'
/**
 * 全部 mv参数类型
*/ 
export interface AllMVListParam extends PageQueryParams {
  area?: MVEnum.AreaEnum,
  order?: MVEnum.OrderEnum,
  type?: MVEnum.TypeEnum
}

/**
 * 最新mv参数类型
*/ 
export interface NewestMVParam {
  area?: MVEnum.AreaEnum,
  limit?: number,
}

/**
 * mv排行参数类型
*/
export interface MVRankingParam extends PageQueryParams {
  area?: MVEnum.AreaEnum,
}

/**
 * 网易出品mv参数类型
*/
export interface RCMDMVParam extends PageQueryParams {
}

/**
 * 获取mv的可播放地址参数类型
*/
export interface MVUrlParams {
  id: number | string,
  r?: MVEnum.MVResolutionRatioEnum
}

/**
 * 获取mv点赞转发评论返回数据类型
*/
export interface MVDetailInfo {
  code?: number,
  commentCount: number,
  liked: boolean,
  likedCount: number,
  shareCount: number,
}

/**
 * 获取mv评论参数类型
*/
export interface MVCommentParams extends PageQueryParams {
  id: string | number,
}

/**
 * 收藏mv参数类型
*/
export interface SubscribedMVParams {
  mvid: string | number,
  t: SubscribeType,
}
