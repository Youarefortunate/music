import { defineStore, storeToRefs } from "pinia";
import { store } from "@/store";
import { useStorage } from "@vueuse/core";
import { useMusicStoreHook } from "./music";
import { isEmptyObject } from "@/utils";

type FootMode = "music" | "fm";

// 音乐模块
const musicStore = useMusicStoreHook();
const { curMusicRecord } = storeToRefs(musicStore);

export const useFootStore = defineStore("foot", () => {
  // state
  // 当前音乐播放模式，默认正常音乐播放模式
  const footMode = useStorage<FootMode>("footMode", "music");
  // fm相关数据
  const fmInfo = reactive({
    // 数据
    fmData: [] as Array<any>,
    // 当前第几张图片在显示
    curIndex: 0,
    // 当前播放fm音乐
    curRecord: {} as any,

  })

  // action
  /**
   * 是否显示音乐详情页
   * @param {Boolean} s 是否显示音乐详情页
   */
  function showMusicDetail(s: boolean) {
    // 没有音乐，播放模式不是普通的音乐播放
    if (isEmptyObject(curMusicRecord.value) || footMode.value !== "music")
      return;
    musicStore.showMusicDetail = s;
  }

  /**
   * 进入私人fm音乐播放模式
   */
  function enterFmMode(mode: FootMode = 'fm') {
    footMode.value = mode;
    musicStore.reset();
  }

  /**
   * 是否为fm音乐播放模式
   */
  function isFmPlayMode(): boolean {
    return footMode.value == "fm";
  }

  return {
    footMode,
    fmInfo,
    showMusicDetail,
    enterFmMode,
    isFmPlayMode
  };
});

// 非setup
export function useFootStoreHook() {
  return useFootStore(store);
}
