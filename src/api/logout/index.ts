import request from "@/utils/request";

const apiPath = {
  logout: '/logout'
}

/**
 * 说明 : 调用此接口 , 可退出登录
 */
export function logout() {
  return request({
    url: apiPath.logout,
    method: "post",
  });
}