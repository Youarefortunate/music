import request from "@/utils/request";
import { QrImageBase64Result } from "./type";

const apiPath = {
  qrKey: "/login/qr/key",
  qrImageBase64: "/login/qr/create",
  qrCodeLogin: '/login/qr/check'
};

/**
 * 1、调用此接口可生成一个 key
 */
export function getQrKey() {
  return request({
    url: apiPath.qrKey,
    method: "get",
  });
}

/**
 * 2、二维码生成接口
 * @param {QrImageBase64Result} params
 * params.key 由第一个接口生成
 * params.qrimg  传入后会额外返回二维码图片 base64 编码
 */
export function getQrImageBase64(params: QrImageBase64Result) {
  return request({
    url: apiPath.qrImageBase64,
    method: "get",
    params,
  });
}

/**
 * 3、扫码登录
 * @param {String} key 由第一个接口生成
 * 说明: 轮询此接口可获取二维码扫码状态,800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功
 * (803 状态码下会返回 cookies),如扫码后返回502,则需加上noCookie参数,如&noCookie=true
 * 
 */
 export function qrCodeLogin(key: string) {
  return request({
    url: apiPath.qrCodeLogin,
    method: "get",
    params: { key },
  });
}
