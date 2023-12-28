// MV相关枚举类型
/**
 * 获取全部mv 地区枚举类型
 * @description 全部,内地,港台,欧美,日本,韩国,不填则为全部 
 */ 
export enum AreaEnum {
  /** 全部 */
  all = '',
  /** 内地 */
  mainland = '内地',
  /** 港台 */
  hktw = '港台',
  /** 欧美 */
  us = '欧美',
  /** 日本 */
  jp = '日本',
  /** 韩国 */
  kr = '韩国',
}

/**
 * 获取全部mv 排序枚举类型
 * @description 上升最快,最热,最新,不填则为上升最快 
 */ 
export enum OrderEnum {
  /** 上升最快 */
  up = '上升最快',
  /** 最热 */
  hot = '最热',
  /** 最新 */
  new = '最新',
}

/**
 * 获取全部mv 类型枚举类型
 * @description 全部,官方版,原生,现场版,网易出品,不填则为全部
 */ 
export enum TypeEnum {
  /** 全部 */
  all = '全部',
  /** 官方版 */
  official = '官方版',
  /** 原生 */
  original = '原生',
  /** 现场版 */
  live = '现场版',
  /** 网易出品 */
  netease = '网易出品',
}

/**
 * mv详情，mv/视频分辨率
 * @description 1080：1080 720：超清 480：高清 240：标清
 */ 
export enum MVResolutionRatioEnum {
  /** 1080P */
  super = 1080,
  /** 720超清 */
  high = 720,
  /** 480高清 */
  medium = 480,
  /** 240标清 */
  low = 240,
}
