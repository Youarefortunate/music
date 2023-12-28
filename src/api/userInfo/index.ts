import request from "@/utils/request";
import { UpdateAvatarParams, UserInfoParams } from './type'
const apiPath = {
  detail: "/user/detail",
  account: '/user/account',
  subcount: '/user/subcount',
  updateAvatar: '/avatar/upload',
  updateUserInfo: '/user/update',
};
// import { useUserStoreHook } from '@/store/modules/user'
// const useStore = useUserStoreHook()

/**
 * 说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情
 * @param {String} uid 登录之后拿到的用户id
 */
export function getUserDetail(uid: string | number) {
  return request({
    url: apiPath.detail + '?uid=' + uid,
    method: "get",
  });
}

/**
 * 说明 : 登录后调用此接口 , 可获取用户账号信息
 */
export function getAccountDetail() {
  return request({
    url: apiPath.account,
    method: "get",
  });
}

/**
 * 说明 : 登录后调用此接口 , 可以获取用户信息 , 歌单，收藏，mv, dj 数量
 */
export function getSubcountDetail() {
  return request({
    url: apiPath.subcount,
    method: "get",
  });
}

/**
 * 说明 : 登录后调用此接口,使用'Content-Type': 'multipart/form-data'上传图片 formData(name 为'imgFile'),
 * 可更新头像(参考: https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/public/avatar_update.html ),
 * 支持命令行调用,参考module_example目录下avatar_upload.js
 */
export function updateAvatar(data: FormData, query?: UpdateAvatarParams) {
  return request({
    // ?imgSize=${query?.imgSize}cookie=${useStore.cookie}&imgX=${query?.imgX}&imgY=${query?.imgY}
    url: apiPath.updateAvatar,
    method: "post",
    data: data
  });
}

/**
 * 更新用户信息
 * @description 说明 : 登录后调用此接口 , 传入相关信息,可以更新用户信息
 *  gender: 性别 0:保密 1:男性 2:女性
 *  birthday: 出生日期,时间戳 unix timestamp
 *  nickname: 用户昵称
 *  province: 省份id
 *  city: 城市id
 *  signature：用户签名
 */
export function updateUserInfo(info: UserInfoParams) {
  return request({
    url: apiPath.updateUserInfo,
    method: "get",
    params: info
  });
}


