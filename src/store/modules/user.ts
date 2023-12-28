import { defineStore } from "pinia";
import { store } from "@/store";
import * as LogoutApi from "@/api/logout";
import { loginStatus } from "@/api/login";
// 响应式 LocalStorage/SessionStorage
import { useStorage } from "@vueuse/core";
import * as AuthUtils from "@/utils/auth";
import { isEmptyObject } from '@/utils'
import { useMusicStoreHook } from './music'
import { usePermissionStoreHook } from './permission'

const musicStore = useMusicStoreHook();

export const useUserStore = defineStore("user", () => {
  // state
  // 是否登录
  const isLogin = useStorage("isLogin", false);
  const token = useStorage("token", "");
  const cookie = useStorage("cookie", "");
  const profile = useStorage("profile", {} as any);
  // const account = useStorage("account", {} as any);

  // actions
  // 设置数据
  async function setData(data: any) {
    token.value = data.token;
    AuthUtils.setToken(data.token);
    cookie.value = data.cookie;
    AuthUtils.setCookie(data.cookie);
    // 获取当前登录状态，成功就会返回用户的profile、account信息
    await getLoginStatus();
    if(isEmptyObject(profile.value)) {
      console.log('profile数据为空==>', data);
      profile.value = data.profile;
    }

    console.log('设置用户数据==>', data);
  }

  /**
   * 获取当前登录状态
   */
  function getLoginStatus() {
    return new Promise<void>((resolve, reject) => {
      loginStatus()
      .then((res) => {
        const result = res.data;
        // 登录成功
        if(result.data.code == 200 && result.data.profile) {
          isLogin.value = true;
          // 这里线上拿到的为null不知道为什么，本地却可以拿到
          if(result.data.profile) {
            profile.value = result.data.profile;
          }
          // account.value = result.data.account;
          console.log("获取当前登录状态成功==>", result);
          resolve();
        } else {
          isLogin.value = false;
          reject(result.data.message)
        }
      })
      .catch((err) => {
        console.log("获取当前登录状态失败==>", err);
        // 清空token、cookie
        resetData()
        reject(err.message || '获取当前登录状态失败')
      });
    })
  }

  /**
   * 退出登录
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      LogoutApi.logout()
        .then(() => {
          // 重置state状态
          resetData();
          // 界面刷新
          location.reload();
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // 重置状态state
  function resetData() {
    token.value = "";
    cookie.value = "";
    // account.value = {};
    profile.value = {};
    isLogin.value = false;
    // 删除通过js-cookie保存的token、cookie
    AuthUtils.removeTokenCookie();
    // 重置音乐模块
    musicStore.reset();
  }

  return {
    token,
    cookie,
    profile,
    // account,
    isLogin,
    setData,
    logout,
    resetData,
    getLoginStatus,
  };
});

// 非setup
export function useUserStoreHook() {
  return useUserStore(store);
}
