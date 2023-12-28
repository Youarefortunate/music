// 歌手相关枚举类型
/**
 * 搜索歌手的类型
 */ 
export enum ArtistTypeEnum {
  /** 全部 */
  all = -1,
  /** 男歌手 */
  male = 1,
  /** 女歌手 */
  female = 2,
  /** 乐队 */
  band = 3,
}

/**
 * 哪一个地区的歌手枚举类型
 */ 
export enum ArtistAreaEnum {
  /** 全部 */
  all = -1,
  /** 华语 */
  mainland = 7,
  /** 欧美 */
  europe = 96,
  /** 韩国 */
  korea = 16,
  /** 日本 */
  japan = 8,
  /** 其他 */ 
  other = 0,
}