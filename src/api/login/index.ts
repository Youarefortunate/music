import request from "@/utils/request";

const apiPath = {
  status: "/login/status",
};

/**
 * 说明 : 调用此接口,可获取登录状态
 */
export function loginStatus() {
  return request({
    url: apiPath.status,
    method: "get",
  });
}
