/**
 * 必选参数: key,由第一个接口生成
 * 可选参数: qrimg 传入后会额外返回二维码图片 base64 编码
 */
export interface QrImageBase64Result {
  key: string,
  qrimg: boolean
}