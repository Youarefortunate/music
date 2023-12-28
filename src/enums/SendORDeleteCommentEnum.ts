/**
 * 发送评论枚举
 */
export enum SendCommentEnum {
  /** 发送 */
  send = 1,
  /** 回复评论 */
  reply = 2,
}

/** 数字，资源类型，对应歌曲、mv、专辑、歌单、电台等等 */
export enum SendType {
  /** 歌曲 */
  song = 0,
  /** mv */
  mv = 1,
  /** 歌单 */
  songList = 2,
  /** 专辑 */
  album = 3,
  /** 电台 */
  djprogram = 4,
  /** 视频 */
  video = 5,
  /** 动态 */
  dynamic = 6
}

/**
 * 删除评论枚举
 */
export enum DeleteCommentEnum {
  /** 删除 */
  delete = 0,
}

/** 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型 */
export enum DeleteType {
  /** 歌曲 */
  song = 0,
  /** mv */
  mv = 1,
  /** 歌单 */
  songList = 2,
  /** 专辑 */
  album = 3,
  /** 电台节目 */
  radioShow = 4,
  /** 视频 */
  video = 5,
  /** 动态 */
  dynamic = 6,
  /** 电台 */
  djprogram = 7,
}