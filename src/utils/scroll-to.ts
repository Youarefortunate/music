const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

/**
 * Because it's so fucking difficult to detect the scrolling element, just move them all
 * @param {number} amount
 * @param {HTMLElement} dom 指定的dom对象
 */
const move = (amount: number, dom?: HTMLElement | null) => {
  document.documentElement.scrollTop = amount;
  (document.body.parentNode as HTMLElement).scrollTop = amount;
  document.body.scrollTop = amount;
  // 移动指定元素
  if(dom != null) {
    dom.scrollTop = amount;
  }
};

const position = () => {
  return (
    document.documentElement.scrollTop ||
    (document.body.parentNode as HTMLElement).scrollTop ||
    document.body.scrollTop
  );
};

/**
 * @param {number} to 跳转到哪里
 * @param {number} duration 动画过渡时间
 * @param {Function} callback 结束回调事件
 * @param {HTMLElement} dom 置顶的dom对象
 */
export const scrollTo = (to: number, duration: number, dom?: HTMLElement | null, callback?: any) => {
  let start: number;
  if (dom != null) {
    start = dom!.scrollTop || (document.body.parentNode as HTMLElement).scrollTop || document.body.scrollTop || 0;
  } else {
    start = position();
  }
  


  const change = to - start;
  const increment = 20;
  let currentTime = 0;
  duration = typeof duration === "undefined" ? 500 : duration;
  const animateScroll = function () {
    // increment the time
    currentTime += increment;
    // find the value with the quadratic in-out easing function
    const val = easeInOutQuad(currentTime, start, change, duration);
    // move the document.body
    move(val, dom);
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll);
    } else {
      if (callback && typeof callback === "function") {
        // the animation is done so lets callback
        callback();
      }
    }
  };
  animateScroll();
};
