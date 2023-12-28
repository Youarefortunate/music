import { defineStore } from "pinia";
import * as QrLoginApi from "@/api/login/qrLogin";
import { toRefs } from "vue";
// 响应式 LocalStorage/SessionStorage
import { useStorage } from "@vueuse/core";
import { useUserStoreHook } from "./user";

/**
 * 二维码数据
 */
interface QrInfo {
  unikey: string;
  src: string;
  isExpired: boolean;
  scanCodeComplete: boolean;
  timer: number | null;
  nickname: string;
  avatarUrl: string;
}

// 用户模块
const userStore = useUserStoreHook();

// 二维码登录store
export const useQrLoginStore = defineStore("qrLogin", () => {
  // state
  const cookie = useStorage("cookie", "");
  const info = reactive<QrInfo>({
    // key
    unikey: "",
    // base64图片
    src: "",
    // 二维码是否过期
    isExpired: true,
    // 定时器，轮询扫码状态
    timer: null,
    // 二维码扫码是否成功
    scanCodeComplete: false,
    // 扫码成功用户名称
    nickname: "",
    // 用户头像
    avatarUrl: ''
  });

  // actions
  // 1、获取二维码需要登录的key
  async function getQRKey() {
    const { data: res } = await QrLoginApi.getQrKey();
    if (res.code !== 200) {
      ElMessage.error(res.msg);
    } else {
      info.unikey = res.data.unikey;
    }
  }

  // 2、根据获取的key生成二维码图片
  async function createQR() {
    const { data: res } = await QrLoginApi.getQrImageBase64({
      key: info.unikey,
      qrimg: true,
    });
    if (res.code !== 200) {
      ElMessage.error(res.msg);
    } else {
      // 二维码不过期
      info.isExpired = false;
      // console.log('获取二维码图片==>', res);

      info.src = res.data.qrimg;
    }
  }

  /** 3、轮询检测扫码状态接口
   * @description 注意：网易云移动端扫码登录一天用户只能扫三次码，超过了次数二维码就无法识别了
   * @description 说明: 轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功(803状态码下会返回cookies)
   */
  async function checkQR() {
    return new Promise<string>((resolve) => {
      info.timer = window.setInterval(async () => {
        const { data: res } = await QrLoginApi.qrCodeLogin(info.unikey);
        if (res.code === 801) {
          console.log("801等待用户扫码中...");
        }
        console.log("轮询检测扫码状态==>", res);

        // 状态码过期
        if (res.code === 800) {
          QRCodeExpired();
          console.log("800二维码授权过期==>", res);
        }

        if (res.code === 802) {
          info.scanCodeComplete = true;
          info.nickname = res.nickname || '';
          info.avatarUrl = res.avatarUrl || '';
          console.log("扫码成功，等待确认==>", res);
        }

        // 扫码成功返回cookie
        if (res.code === 803) {
          console.log("803二维码授权成功==>", res);
          // 扫码登录成功返回cookie, 保存cookie值
          cookie.value = res.cookie;
          // 授权成功，将二维码状态设置为过期，并清除定时器
          QRCodeExpired();
          // 获取用户登录状态
          const result = await userStore.getLoginStatus();
          resolve(res.message);
          info.scanCodeComplete = false;
        }
      }, 3000);
    });
  }

  // 刷新二维码
  async function refreshQrCode() {
    // 判断当前是否还存在定时轮询请求, 如果有则先清空再重新获取key生成二维码图片
    if (info.timer) {
      QRCodeExpired();
    }
    // 重新获取生成二维码的key
    await getQRKey();
    // 获取登录二维码
    info.unikey && (await createQR());
    // 等待扫码结果
    info.src && (await checkQR());
  }

  // 二维码过期
  function QRCodeExpired() {
    clearInterval(info.timer as number);
    info.isExpired = true;
    info.scanCodeComplete = false;
  }

  // 主要作用是判断定时器是否存在，存在并且 isExpired 二维码状态已经过期，则清空定时器还原初始状态
  watch(
    () => info.isExpired,
    (newVal) => {
      // 二维码是否过期
      if (newVal && info.timer) {
        clearInterval(info.timer);
        info.timer = null;
      }
    }
  );

  return {
    ...toRefs(info),
    getQRKey,
    createQR,
    checkQR,
    refreshQrCode,
  };
});
