import * as NewestEnum from '@/enums/NewestEnum'
import { SubscribeType } from '@/enums/SubscribeEnum'

/**
 * 获取全部专辑列表参数
*/
export interface AlbumTypeParam extends PageQueryParams {
  area: NewestEnum.NewDiscTypeEnum,
}

/**
 * 专辑收藏参数
*/
export interface SubscribedAlbumParams {
  id: string | number,
  t: SubscribeType,
}

/**
 * 一个专辑的所有评论
*/
export interface AlbumCommentParams extends PageQueryParams {
  id: string | number,
}