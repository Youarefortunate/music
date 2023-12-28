/**
 * 手机号验证码登录数据
 */
export interface phoneLoginInfo {
  phone: string,
  password?: string,
  countrycode?: number,
  md5_password?: string,
  captcha?: string
}


/**
 * 校验验证码数据
 */
export interface CaptchaData {
  phone: string,
  captcha: string
}
