import * as ArtistEnum from '@/enums/ArtistEnum'
/**
 * 获取歌手分类列表参数
*/ 
export interface ArtistListParams extends PageQueryParams {
  type: ArtistEnum.ArtistTypeEnum,
  area: ArtistEnum.ArtistAreaEnum,
  initial: string | number,
}