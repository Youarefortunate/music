/**
 * 获取精品歌单参数
*/ 
export interface HighqualitySongListParams {
  // tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从精品歌单标签列表接口获取(/playlist/highquality/tags)
  cat?: string,
  // 返回数量 , 默认为 50
  limit?: number,
  // 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据
  before?: number
}