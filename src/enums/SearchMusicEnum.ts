/**
 * 搜索音乐的类型
 */
export enum SearchMusicType {
  /** 单曲 */
  single = 1,
  /** 专辑 */
  album = 10,
  /** 歌手 */
  singer = 100,
  /** 歌单 */
  playlist = 1000,
  /** 用户 */
  user = 1002,
  /** MV */
  mv = 1004,
  /** 歌词 */
  lyric = 1006,
  /** 电台 */
  radio = 1009,
  /** 视频 */
  video = 1014,
  /** 综合 */
  synthesize = 1018,
  /** 声音(搜索声音返回字段格式会不一样) */
  voice = 2000
}