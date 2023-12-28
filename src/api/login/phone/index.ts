import request from "@/utils/request";
import { CaptchaData, phoneLoginInfo } from "./type";

const apiPath = {
  cellphone: "/login/cellphone",
  captcha: "/captcha/sent",
  check: "captcha/verify",
};

/**
 * 手机号验证码登录
 */
export function phoneLogin(data: phoneLoginInfo) {
  // 对特殊字符进行编码，目的：避免传到后端那边出现乱码或者无法正常显示
  // let { password } = data
  // password = encodeURIComponent(password)
  return request({
    // get请求调用例子
    // url: apiPath.cellphone + '?phone=' + data.phone + '&password=' + data.password + '&md5_password=' + data.password + '&captcha=' + data.captcha,
    url: apiPath.cellphone,
    method: "post",
    params: data,
  });
}

/**
 * 通过手机号发送验证码
 */
export function sendCaptcha(phone: string) {
  return request({
    url: apiPath.captcha,
    method: "get",
    params: { phone },
  });
}

/**
 * 校验验证码是否正确, 调用此接口 ,传入手机号码和验证码, 可校验验证码是否正确
 * @param data.phone 手机号
 * @param data.captcha 验证码
 */
export function captchaCheck(data: CaptchaData) {
  return request({
    url: apiPath.check,
    method: "get",
    params: data,
  });
}
