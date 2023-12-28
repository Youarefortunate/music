// 筛选歌手数据
import * as MVEnum from "@/enums/MVEnum";

export type DataKey = 'area' | 'type' | 'order'

export type Item = {
  name: string,
  value: MVEnum.AreaEnum | MVEnum.TypeEnum | MVEnum.OrderEnum
}

export type DataType = Record<DataKey, Array<Item>>

// 全部mv分类
export const data: DataType = {
  // 地区
  area: [
    { name: "全部", value: MVEnum.AreaEnum.all },
    { name: "内地", value: MVEnum.AreaEnum.mainland },
    { name: "港台", value: MVEnum.AreaEnum.hktw },
    { name: "欧美", value: MVEnum.AreaEnum.us },
    { name: "韩国", value: MVEnum.AreaEnum.kr },
    { name: "小日本", value: MVEnum.AreaEnum.jp },
  ],
  // 类型
  type: [
    { name: "全部", value: MVEnum.TypeEnum.all },
    { name: "官方版", value: MVEnum.TypeEnum.official },
    { name: "原生", value: MVEnum.TypeEnum.original },
    { name: "现场版", value: MVEnum.TypeEnum.live },
    { name: "网易出品", value: MVEnum.TypeEnum.netease },
  ],
  // 排序
  order: [
    { name: "上升最快", value: MVEnum.OrderEnum.up },
    { name: "最热", value: MVEnum.OrderEnum.hot },
    { name: "最新", value: MVEnum.OrderEnum.new },
  ],
};


// 过滤文本
export const filterText = {
  area: "地区",
  type: "类型",
  order: "排序",
};
