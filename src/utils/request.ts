import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
// import NProgress from "./progress";
import { useUserStoreHook } from '@/store/modules/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  // 表示跨域请求时是否需要使用凭证
  withCredentials: true,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8",
    "X-Requested-With": "XMLHttpRequest"
  },
});

// 请求拦截
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 开启进度条动画
    // NProgress.start();
    // console.log("请求拦截==>", config);

    // const userStore = useUserStoreHook();
    // if (userStore.token) {
    //   config.headers.Authorization = userStore.token;
    // }
    // 301 错误基本都是没登录就调用了需要登录的接口,如果登录了还是提示 301, 基本都是缓存把数据缓存起来了,解决方法是加时间戳或者等待 2 分钟或者重启服务重新登录后再调用接口
    // 防止报错，加上时间戳
    config.params = {
      ...config.params,
      timestamp: Date.now(),
    };
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 关闭进度条动画
    // NProgress.done();
    // console.log("响应拦截==>", response);
    const { data } = response;
    // 请求成功
    if (data.code == 200) {
      return response;
    }
    // 301 错误基本都是没登录就调用了需要登录的接口
    if (data.code == 301) {
      ElMessage.error("未登录, 如已登录请清空上次缓存!!");
      return Promise.reject(new Error("发生301错误"));
    }
    // 部分接口如登录接口不能调用太频繁 , 否则可能会触发 503 错误或者 ip 高频错误
    if (data.code == 503) {
      ElMessage.error("接口调用频繁");
      return Promise.reject(new Error("发生503错误"));
    }
    if (data.code == 460) {
      ElMessage.error(
        "由于网易限制,此项目在国外服务器或部分国内云服务上使用会受到限制"
      );
      return Promise.reject(new Error("460 cheating异常"));
    }

    // 二维码过期
    // if (data.code == 800) {
    //   ElMessage.error("二维码已过期，请重新扫码");
    //   return Promise.reject({ code: 800, message: "二维码已过期，请重新扫码" });
    // }

    return Promise.resolve(response);
  },
  (error: any) => {
    // 关闭进度条动画
    // NProgress.done();
    return Promise.reject(error.response?.data || error.message);
  }
);

// 导出axios实例
export default service;
