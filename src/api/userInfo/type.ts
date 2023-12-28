/**
 * 更新头像参数
 * @param {Number} imgSize 图片尺寸,默认为 300
 * @param {Number} imgX 水平裁剪偏移,方形图片可不传,默认为 0
 * @param {Number} imgY 垂直裁剪偏移,方形图片可不传,默认为 0
 */ 
export interface UpdateAvatarParams {
  imgSize?: number,
  imgX?: number,
  imgY?: number,
} 

/**
 * 更新用户信息参数
 */
export interface UserInfoParams {
  gender: number | string,
  birthday: string | number,
  nickname: string,
  city: string | number,
  province: string | number,
  signature: string,
}