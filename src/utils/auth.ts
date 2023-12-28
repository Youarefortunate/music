import Cookies from "js-cookie";

const tokenKey = 'token'
const cookieKey = 'cookieKey'

/**
 * 设置 token
 */ 
export const setToken = (token: string) => {
  Cookies.set(tokenKey, token)
}

/**
 * 设置 cookie
 */ 
export const setCookie = (cookie: string) => {
  Cookies.set(cookieKey, cookie)
}

/**
 * 获取token
 */ 
export const getToken = () => {
  return Cookies.get(tokenKey)
}

/**
 * 获取cookie
 */ 
export const getCookie = () => {
  return Cookies.get(cookieKey)
}

// 删除 cookie、token 
export const removeTokenCookie = () => {
  getToken() && Cookies.remove(tokenKey)
  getCookie() && Cookies.remove(cookieKey)
}
