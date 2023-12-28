import { useDebounceFn } from '@vueuse/core'

/**
 * 检查一个元素是否具有class类名
 * @param {HTMLElement} ele
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele: HTMLElement, cls: string) {
  return !!ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
}

/**
 * 往一个元素里面添加一个类名
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function addClass(ele: HTMLElement, cls: string) {
  if (!hasClass(ele, cls)) ele.className += " " + cls;
}

/**
 * 移除某个元素中的类名
 * @param {HTMLElement} ele
 * @param {string} cls
 */
export function removeClass(ele: HTMLElement, cls: string) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}

/**
 * 是否为外部链接
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path: string) {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path);
  return isExternal;
}

/**
 * 数量格式化
 */
export function useNumberFormat(number: number): string | number {
  if (number > 100000000) {
    return Number((number / 100000000).toFixed(1)) + " 亿";
  }
  if (number > 10000000) {
    return Number((number / 10000000).toFixed(1)) + " 千万";
  }
  if (number > 10000) {
    return Number((number / 10000).toFixed(1)) + " 万";
  }
  return number;
}

/**
 * 判断是否为空对象
 * @param {*} object 源对象
 * @returns {Boolean} true: 空对象，false: 不为空
 */
export function isEmptyObject(object: any): boolean {
  if (typeof object !== 'object' || object === null || object === undefined) {
    return true;
  }
  return Object.keys(object).length === 0
}

/**
 * 时间戳格式化
 * @param {Number} timestamp 时间戳
 * @param {String} format 格式方式 YYYY-MM-DD
 * @returns 
 */
export const formatDate = (timestamp: number, format = 'YYYY-MM-DD hh:mm:ss'): string => {
  // 时间戳为10位需*1000，时间戳为13位不需乘1000
  const date = timestamp.toString.length === 10 ? new Date(timestamp * 1000) : new Date(timestamp)

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const formatMap: { [key: string]: any } = {
    YYYY: year.toString(),
    MM: month.toString().padStart(2, '0'),
    DD: day.toString().padStart(2, '0'),
    hh: hour.toString().padStart(2, '0'),
    mm: minute.toString().padStart(2, '0'),
    ss: second.toString().padStart(2, '0')
  }
  return format.replace(/YYYY|MM|DD|hh|mm|ss/g, (match) => formatMap[match])
}

/**
 * 格式化播放时长
 * @param time 播放时长，时间戳
 * @param format 格式化字符串
*/
export function formatPlayTime(time: number, format = 'mm:ss') {
  const date = new Date(time)
  const minute = date.getMinutes() // 分
  const second = date.getSeconds() // 秒

  // 左侧补0
  const formatMap: { [key: string]: any } = {
    mm: minute.toString().padStart(2, '0'),
    ss: second.toString().padStart(2, '0')
  }
  return format.replace(/mm|ss/g, (match) => formatMap[match])
}

/**
 * 监听是否出现竖向滚动条，需要页面加载完毕之后才可调用
 * @returns {Boolean} true 出现滚动条 false未出现滚动条
 */
export function checkScrollbar(): boolean {
  const container = document.querySelector('body')
  return container!.scrollHeight > container!.clientHeight;
}

