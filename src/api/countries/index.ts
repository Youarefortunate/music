import request from "@/utils/request";

const apiPath = {
  list: "/countries/code/list",
};

/**
 * 说明 : 调用此接口,可获取国家编码列表
 */
export function getCountriesList(uid: string) {
  return request({
    url: apiPath.list,
    method: "get",
  });
}