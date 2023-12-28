import { reactive, nextTick } from "vue";
import { useMusicStoreHook } from "@/store/modules/music";
import * as MusicApi from "@/api/music";

const musicStore = useMusicStoreHook();

export type DomObject = {
  lyricContainer: HTMLElement | null;
  lyricContentUl: HTMLElement | null;
};

// 需要操作的dom对象
export const dom = reactive<DomObject>({
  lyricContainer: null,
  lyricContentUl: null,
});
// 解析完成之后的歌词数据
export const lyricData = ref<Array<any>>([]);

/**
 * 获取歌词
 * @param {String | Number} curId 当前播放音乐的id
 */
export async function getLyric(curId: number | string): Promise<any> {
  const res = await MusicApi.getSongLyric({ id: curId });
  const { code, lrc } = res.data;
  if (code != 200) {
    console.log(
      "获取歌曲歌词失败（文件路径: /common/model/lyric.ts）==>",
      res.data
    );
    return ElMessage.error(res.data.err.message || "获取歌曲歌词失败");
  }
  // console.log("获取歌词成功==>", res.data);
  // 解析歌词字符串
  return parseLrc(lrc.lyric);
}

/**
 * 解析歌词字符串，得到一个歌词对象，每个歌词对象
 * @description { time: 开始时间，words：歌词内容 }
 * @param {String} lyric 未格式化的歌词字符串
 */
export function parseLrc(lyric: string) {
  // 歌词对象数组
  let result: any = [];
  if (!lyric) {
    lyricData.value = [];
    return lyricData.value.push({ offset: 0, words: "这首歌暂时没有歌词哦" });
  }
  let lines = lyric.split("\n");
  lines = lines.filter((item) => item);

  lines.forEach((item) => {
    let parts = item.split("]");
    let timeStr = parts[0].trim().slice(1);
    // 有些歌曲没有返回时间那一部分，所有直接返回歌词
    if (Number.isNaN(parseTime(timeStr))) {
      let obj = {
        time: undefined,
        words: parts[0],
      };
      return result.push(obj);
    }
    // 歌词对象数据
    let obj = {
      time: parseTime(timeStr),
      words: parts[1],
    };
    return result.push(obj);
  });
  if (result[0].time == undefined) {
    result.unshift({ offset: 0, words: "该首歌不支持歌词滚动" });
  }
  lyricData.value = result;

  return lyricData.value;
}

/**
 * 将一个时间字符串解析为数字（秒）
 * @param {String} timeStr 时间字符串
 */
export function parseTime(timeStr: string) {
  let parts = timeStr.split(":");
  // 字符串数字前面带上一个"+"可将其转化成数字
  return +parts[0] * 60 + +parts[1];
}

/**
 * 计算出当前播放器播放到第几秒的情况下
 * lrcData数组中应该高亮显示的歌词下标
 * 如果没有任何一句歌词需要显示，则得到-1
 */
export function findIndex(lrcData: Array<any>): number {
  // 获取当前播放进度
  let curTime = musicStore.audioInfo.currentTime;
  for (let i = 0; i < lrcData.length; i++) {
    if (
      (lrcData[i].words as string).includes("纯音乐") &&
      lrcData.length == 1
    ) {
      return 0;
    }
    // 如果当前播放的时间小于歌词数组里面某一项的时间，证明还未播放到lrcData
    // 里面某一项的歌词，当前应该是处于改歌词的上一句歌词
    if (curTime < lrcData[i].time) {
      return i - 1;
    }
  }
  // 找遍了都没有找到，说明播放到最后一句了，返回最后一句的下标让其始终显示高亮
  return lrcData.length - 1;
}

/**
 * 创建歌词列表li
 */
export function createLyricLiElement() {
  // 返回的歌词不支持歌词滚动，只让第一行始终保持高亮
  if (lyricData.value[0]?.offset == 0) {
    nextTick(() => {
      // 去掉之前的active样式
      let li = dom.lyricContentUl!.querySelector(".lyric-active");
      if (li) {
        li.classList.remove("lyric-active");
      }
      dom.lyricContentUl!.style.transform = `translateY(0)`;
      let firstLi = dom.lyricContentUl!.children[0];
      if (firstLi) {
        firstLi.classList.add("lyric-active");
      }
    });
    return;
  }

  musicStore.audioInfo.audio.addEventListener("timeupdate", setOffset);
}

/**
 * 设置歌词ul元素的偏移量
 */
export function setOffset() {
  // 包裹歌词ul的容器高度
  let containerHeight = dom.lyricContainer!.clientHeight; // 380

  // 每一行歌词的固定高度
  let lineHeight = dom.lyricContentUl!.children[0].clientHeight;

  // 最大偏移量
  let maxOffset = dom.lyricContentUl!.clientHeight - containerHeight; // 1728
  // 获取当前歌词播放到lrcData歌词数组中的那个位置的下标
  let index = lyricData.value[0]?.offset == 0 ? 0 : findIndex(lyricData.value);

  // 获取该向上偏移多少数值
  let offset = (lineHeight * index) + (lineHeight / 2) - (containerHeight / 2 + 35); //  + paddingTop
  if (offset < 0) {
    offset = 0;
  }
  if (offset > maxOffset + containerHeight / 2) {
    offset = maxOffset + containerHeight / 2;
  }
  dom.lyricContentUl!.style.transform = `translateY(-${offset}px)`;

  // 去掉之前的active样式
  let li = dom.lyricContentUl!.querySelector(".lyric-active");
  if (li) {
    li.classList.remove("lyric-active");
  }
  li = dom.lyricContentUl!.children[index];
  // 歌词ul列表中的所有子元素数量length
  const ulLength = dom.lyricContentUl!.children.length;
  // 这里做一个递归调用，因为有可能下一项li也没有歌词，需要递归一直找到有歌词的li项为止
  // 防止超出下标报错
  const i = index + 1 >= ulLength ? ulLength - 1 : index + 1;
  // 下一项li
  const nextLightLi = dom.lyricContentUl!.children[i];
  // 去掉之前的active样式
  // if (nextLightLi) {
  //   nextLightLi.classList.remove("lyric-active");
  // }

  // 这里主要解决某些歌词为空的问题，这里就让歌词为空的li项直接让下一句li显示高亮
  // if (!li?.children.length) {
  //   // 移除当前无歌词li项的选中样式
  //   li?.classList.remove("lyric-active");
  //   // 下一个li项也没有歌词
  //   if (!nextLightLi?.children.length) {
  //     // 开始递归
  //     console.log("下一个li项也没有歌词，需要开始递归");
  //   }
  //   // 为下一项有歌词的li项添加选中样式
  //   nextLightLi?.classList.add("lyric-active");
  //   // console.log("当前li项无歌词，下一歌词li项==>", nextLightLi);
  // } else {
  //   nextLightLi?.classList.remove("lyric-active");
  // }

  if (li) {
    li.classList.add("lyric-active");
  }
}

// 监听下一首歌曲加载完毕播放时将滚动状态设置为初始位置
watch(
  () => [musicStore.isEnded, musicStore.loading],
  ([newEnded, newLoading]) => {
    if (newEnded && !newLoading) {
      resetLyricPosition();
    }
  }
);
/**
 * 重置歌词滚动位置为初始位置
 */
export function resetLyricPosition() {
  const activeLi = dom.lyricContentUl!.children;
  if (activeLi?.length) {
    for (let i = 0; i < activeLi!.length; i++) {
      if (activeLi[i].className.includes("lyric-active")) {
        activeLi[i].classList.remove("lyric-active");
      }
    }
  }
  dom.lyricContentUl!.style.transform = `translateY(0)`;
}
