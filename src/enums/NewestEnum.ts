// 最新音乐相关枚举类型
/**
 * 新歌速递枚举类型
 * 全部:0 华语:7 欧美:96 日本:8 韩国:16
 */
export enum NewSongTypeEnum {
  /** 全部 */
  all = 0,
  /** 华语 */
  zh = 7,
  /** 欧美 */
  ea = 96,
  /** 日本 */
  jp = 8,
  /** 韩国 */
  kr = 16,
}

/**
 * 新碟上架枚举类型
 * ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
 */
export enum NewDiscTypeEnum {
  /** 全部 */
  all = 'ALL',
  /** 华语 */
  zh = 'ZH',
  /** 欧美 */
  ea = 'EA',
  /** 日本 */
  jp = 'JP',
  /** 韩国 */
  kr = 'KR',
}