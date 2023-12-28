/**
 * 是否为免费音乐
 */
export enum MusicFeeTypeEnum {
  /** 免费或无版权 */
  FREE = 0,
  /** 会员 */
  VIP = 1,
  /** 购买专辑 */
  BUYAL = 4,
  /** 非会员可免费播放低音质，会员可播放高音质及下载 */
  NONMEMBERFREE = 8,
}

/**
 * 音乐品质
 */
export enum MusicQualityEnum {
  /** 高品质音乐 */
  HIRES = 48000,
  /** sq无损音乐 */
  SQ = 44100,
}

// /**
//  * 喜欢音乐枚举
//  */
// export enum MusicLikeTypeEnum {
//   /** 喜欢 */
//   LIKE = true,
//   /** 不喜欢 */
//   UNLIKE = false,
// }

/**
 * 音乐的播放状态
 */
export enum MusicPlayStatusEnum {
  /** 播放 */
  PLAY = 1,
  /** 暂停 */
  PAUSE = 0,
}

/**
 * 音乐的音质等级
 * 播放音质等级, 分为 standard => 标准,higher => 较高, exhigh=>极高, 
 * lossless=>无损, hires=>Hi-Res, jyeffect => 高清环绕声, sky => 沉浸环绕声, jymaster => 超清母带
 */
export enum MusicLevelEnum {
  /** 标准 */
  STANDARD = 'standard',
  /** 较高 */
  HIGHER = 'higher',
  /** 极高 */
  EXHIGH = 'exhigh',
  /** 无损 */
  LOSSLESS = 'lossless',
  /** hires */
  HIRES = 'hires',
  /** 高清环绕声 */
  JYEFFECT = 'jyeffect',
  /** 沉浸环绕声 */
  SKY = 'sky',
  /** 超清母带 */
  JYMASTER = 'jymaster',
}

/**
 * 音乐播放模式
 */
export enum MusicPlayModeEnum {
  /** 列表播放 */
  ORDER = 'order',
  /** 单曲循环 */
  LOOP = 'loop',
  /** 随机播放 */
  RANDOM = 'random',
}