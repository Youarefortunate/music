// 筛选歌手数据
import * as ArtistEnum from "@/enums/ArtistEnum";

// 筛选歌手数据
export const data = {
  // 语种
  language: [
    { name: "全部", value: ArtistEnum.ArtistAreaEnum.all },
    { name: "华语", value: ArtistEnum.ArtistAreaEnum.mainland },
    { name: "欧美", value: ArtistEnum.ArtistAreaEnum.europe },
    { name: "小日本", value: ArtistEnum.ArtistAreaEnum.japan },
    { name: "韩国", value: ArtistEnum.ArtistAreaEnum.korea },
    { name: "其他", value: ArtistEnum.ArtistAreaEnum.other },
  ],
  // 分类
  category: [
    { name: "全部", value: ArtistEnum.ArtistTypeEnum.all },
    { name: "男歌手", value: ArtistEnum.ArtistTypeEnum.male },
    { name: "女歌手", value: ArtistEnum.ArtistTypeEnum.female },
    { name: "乐队组合", value: ArtistEnum.ArtistTypeEnum.band },
  ],
  // 筛选
  filter: [
    { name: "热门", value: -1 },
    { name: "A", value: "a" },
    { name: "B", value: "b" },
    { name: "C", value: "c" },
    { name: "D", value: "d" },
    { name: "E", value: "e" },
    { name: "F", value: "f" },
    { name: "G", value: "g" },
    { name: "H", value: "h" },
    { name: "I", value: "i" },
    { name: "J", value: "j" },
    { name: "K", value: "k" },
    { name: "L", value: "l" },
    { name: "M", value: "m" },
    { name: "N", value: "n" },
    { name: "O", value: "o" },
    { name: "P", value: "p" },
    { name: "Q", value: "q" },
    { name: "R", value: "r" },
    { name: "S", value: "s" },
    { name: "T", value: "t" },
    { name: "U", value: "u" },
    { name: "V", value: "v" },
    { name: "W", value: "w" },
    { name: "X", value: "x" },
    { name: "Y", value: "y" },
    { name: "Z", value: "z" },
    { name: "#", value: 0 },
  ],
};
// 过滤文本
export const filterText = {
  language: "语种",
  category: "分类",
  filter: "筛选",
};