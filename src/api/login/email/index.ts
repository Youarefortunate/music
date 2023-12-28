import request from "@/utils/request";
import { EmailInfo } from "./type";

const apiPath = {
  email: "/login",
};

/**
 * 邮箱登录
 * 完成登录后 , 会在浏览器保存一个 Cookies 用作登录凭证 , 大部分 API 都需要用到这个 Cookies,非跨域情况请求会自动带上 Cookies,跨域情况参考调用前须知
 * v3.30.0 后支持手动传入 cookie,登录接口返回内容新增 cookie 字段,保存到本地后,get 请求带上?cookie=xxx (先使用 encodeURIComponent() 编码 cookie 值) 
 * 或者 post 请求 body 带上 cookie 即可
 */
export function loginEmail(data: EmailInfo) {
  return request({
    url: apiPath.email,
    method: "get",
    params: data,
  });
}
