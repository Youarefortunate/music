/**
 * 资源点赞type枚举
 * @description 0: 歌曲, 1: mv, 2: 歌单, 3: 专辑, 4: 电台节目, 5: 视频, 6: 动态, 7: 电台
*/
export enum ResourceTypeEnum {
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

/**
 * 给资源点赞枚举
 */ 
export enum LikeTheResourceEnum {
  /** 点赞 */
  like = 1,
  /** 取消点赞 */
  unlike = 0,
}