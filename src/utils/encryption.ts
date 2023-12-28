import { MD5 } from "crypto-js";

/**
 * 使用MD5对密码进行加密
 * @param password 需要加密的密码
 * @returns 返回md5加密之后的字符串结果
 */
export function encryptMD5(password: string) {
  return MD5(password).toString();
}
