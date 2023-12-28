/**
 * 评论类型type枚举
*/
export enum CommentTypeEnum {
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
 * 给评论点赞枚举
 */ 
export enum LikeTheCommentEnum {
  /** 点赞 */
  like = 1,
  /** 取消点赞 */
  unlike = 0,
}