import { toRefs } from "vue";
import { defineStore } from "pinia";
import { store } from "@/store";
import { useStorage } from "@vueuse/core";
import * as MusicApi from "@/api/music";
import { isEmptyObject } from "@/utils";
import * as MusicInfoEnum from "@/enums/MusicInfoEnum";
import { ElNotification } from "element-plus";
import _ from "lodash";

export type MusicInfoType = {
  curPlayList: Array<any>;
  playIndex: number | string;
  curPlayMode: MusicInfoEnum.MusicPlayModeEnum;
  curMusicRecord: any;
  musicUrl: string | undefined;
  curplayId: number | string;
};

export const useMusicStore = defineStore("music", () => {
  // state
  /** 是否显示音乐详情页 */
  const showMusicDetail = ref(false);
  /** 是否显示当前播放列表 */
  const showCurPlayList = ref(false);
  /** 加载 */
  const loading = ref(false);
  /** 是否播放结束，主要用于外部判断音频是否播放结束好进行某些处理 */
  const isEnded = ref(false);
  /** 有时候如果想添加新的属性到用了useStorage的对象中的话，会发现浏览器那边没有显示新添加的属性，使用log打印出来是undefined，解决办
   * 法是将下面的对象里面的默认属性先给他变回为空对象，浏览器那边清空缓存，刷新页面之后，再粘贴回去(包含新的属性)即可 */
  /** 音乐信息 */
  const musicInfo = useStorage<MusicInfoType>("musicInfo", {
    /** 当前播放列表 */
    curPlayList: [] as any,
    /** 当前播放曲目在播放列表数组中的索引值 */
    playIndex: 0,
    /** 当前音乐播放模式(默认按列表顺序, 值有order按列表播放、loop单曲循环、random随机播放) */
    curPlayMode: MusicInfoEnum.MusicPlayModeEnum.ORDER,
    /** 当前播放音乐记录 */
    curMusicRecord: {},
    /** 当前播放的音乐url */
    musicUrl: "",
    /** 当前播放音乐的id */
    curplayId: 0,
  });

  /** 音频 */
  const audioInfo = reactive({
    /** 音频实例 */
    audio: new Audio(),
    /** 当前音频的播放状态 */
    status: false,
    /** 当前播放时长 */
    currentTime: 0,
    /** 总播放时长 */
    duration: 0,
    /** 音乐是否静音 */
    muted: false,
    /** 音量，默认音量60 */
    volume: 60,
    /** 是否循环播放 */
    loop: false,
    /** 加载完成自动播放 */
    loadFinishPlay: false,
  });

  const { curPlayList, curPlayMode, curMusicRecord, musicUrl, curplayId } =
    toRefs(musicInfo.value);

  const { status, muted, volume } = toRefs(audioInfo);

  const playIndex = computed<number>({
    get() {
      musicInfo.value.playIndex = curPlayList.value?.findIndex(
        (song) => song.id === curplayId.value
      );
      // musicInfo.value.playIndex > -1 ? musicInfo.value.playIndex : 0
      return musicInfo.value.playIndex;
    },
    set(val: number) {
      musicInfo.value.playIndex = val;
    },
  });

  const playList = computed({
    get() {
      return curPlayList.value;
    },
    set(val: Array<any>) {
      curPlayList.value = val;
    }
  })

  /**
   * 开始播放
   * @param {Number | String} id 音乐id，如果没传就从当前正在播放记录中取
   */
  async function playMusic(id?: number | string) {
    // 开始加载
    loading.value = true;
    // 判断当前播放记录是否为空
    if (isEmptyObject(curMusicRecord.value)) {
      return;
    }
    musicUrl.value = await getMusicURLByIds(id ?? curMusicRecord.value.id);
    if (musicUrl.value) {
      // 创建音频
      createAudio();
    }
  }

  /**
   * 通过音乐id获取音乐播放的url(标准音质)
   */
  function getMusicURLByIds(musicId: string | number) {
    return new Promise<string | undefined>((resolve, reject) => {
      MusicApi.getMusicURLByIds({
        id: musicId,
        level: MusicInfoEnum.MusicLevelEnum.STANDARD,
      })
        .then((res) => {
          const { code, message } = res.data;
          if (code != 200) {
            return reject(message || "获取音乐播放url失败");
          }
          resolve(res.data.data[0].url);
          console.log("通过音乐id获取音乐播放的url(标准音质)成功==>", res.data);
        })
        .catch((err) => {
          reject(err || err.message || "获取音乐播放url失败");
        });
    });
  }

  /**
   * 创建音频
   */
  async function createAudio() {
    // 设置音频url
    audioInfo.audio.src = musicUrl.value as string;
    // 设置音频默认音量
    audioInfo.audio.volume = volume.value / 100;
    // 示意即使用户可能不会播放该音频，但获取元数据 (例如音频长度) 还是有必要的
    audioInfo.audio.preload = "metadata";

    // 音频进入可以播放状态，但不保证后面可以流畅播放
    await onCanplay();

    // 音频播放进度更新事件
    await onTimeUpdate();

    // 音频自然播放结束事件
    await onEnded();
  }

  /**
   * 音频进入可以播放状态，但不保证后面可以流畅播放
   * 当可以播放，但需要进一步缓冲时发生
   */
  async function onCanplay() {
    return new Promise<boolean>((resolve) => {
      audioInfo.audio.oncanplay = async (e: Event) => {
        console.log(
          "音频进入可以播放状态，但不保证后面可以流畅播放==>onCanplay()",
          e
        );
        // 开始播放
        const statusPlay = await play();

        if (statusPlay.status) {
          // 结束加载
          loading.value = false;
          // 设置当前播放状态为正在播放
          setCurPlayStatus(true);
          // 返回音频播放成功
          resolve(true);
        }
      };
    });
  }

  /**
   * 音频播放进度更新事件
   * 发生以指示当前播放位置
   */
  async function onTimeUpdate() {
    return new Promise<void>((resolve) => {
      audioInfo.audio.ontimeupdate = (e: Event) => {
        isEnded.value = false;
        // console.log('音频播放进度更新事件放==>onTimeUpdate()', e);
        // 获取当前播放位置(单位：s)，只有在当有合法src时返回，时间不整，保留小数后6位
        audioInfo.currentTime = Number(audioInfo.audio.currentTime.toFixed(6));

        // 音乐总时长
        audioInfo.duration = Number(audioInfo.audio.duration.toFixed(6));
        // 播放结束
        if (audioInfo.currentTime == audioInfo.duration) {
          resolve();
        }
      };
    });
  }

  /**
   * 音频自然播放结束事件
   */
  async function onEnded() {
    return new Promise<void>((resolve) => {
      audioInfo.audio.onended = (e: Event) => {
        // 播放结束
        isEnded.value = true;
        // 当前音乐播放模式为顺序播放, 自然播放结束之后, 自动根据当前音乐播放模式播放下一首
        switch (curPlayMode.value) {
          case MusicInfoEnum.MusicPlayModeEnum.LOOP: // 单曲循环
            loopPlay();
            break;
          case MusicInfoEnum.MusicPlayModeEnum.RANDOM: // 随机播放
            randomPlay();
            break;
          case MusicInfoEnum.MusicPlayModeEnum.ORDER: // 列表播放
            next();
            break;
          default:
            next();
        }
        resolve();
      };
    });
  }

  /**
   * 继续播放
   * @description 这里在store外面使用时最好不要直接调用，直接调用可能会导致出现各种奇奇怪怪的报错，
   * 最好是调用setCurMusicRecord通过设置当前播放音乐信息来播放音乐
   */
  function play() {
    return new Promise<any>((resolve, reject) => {
      // 页面刷新后音频的url会丢失，这里判断一下如果没有重新赋值，重新播放
      if (!audioInfo.audio.src) {
        createAudio();
      }

      audioInfo.audio
        .play()
        .then(() => {
          setCurPlayStatus(true);
          resolve({ status: true });
        })
        .catch((err) => {
          setCurPlayStatus(false);
          // 触发该播放的原因可能是音频已经失效，需要重新获取一下播放的音频url
          // 注 : 部分用户反馈获取的 url 会 403,hwaphon找到的解决方案是当获取到音乐的 id 后，将 https://music.163.com/song/media/outer/url?id=id.mp3 以 src 赋予 Audio 即可播放
          const errMsg = err.message.split(" ").join("").trim();
          if (
            errMsg == "Failedtoloadbecausenosupportedsourcewasfound." ||
            !musicInfo.value.musicUrl
          ) {
            console.log(
              "音频播放获取得到403或者没有音频url，需要重新获取该音乐的可播放url==>",
              err.message
            );
            const curId = curMusicRecord.value.id;
            audioInfo.audio.src = "";
            playMusic(curId);
            resolve({ status: true });
            return;
          }
          console.error("调用audio实例play()失败回调catch==>", err);
          reject((err && err.message) || "播放失败");
          ElMessage.error((err && err.message) || "播放失败");
        });
    });
  }

  // 暂停
  function pause() {
    audioInfo.audio.pause();
    setCurPlayStatus(false);
  }

  /**
   * 上一首歌曲
   */
  function previous() {
    // 随机播放
    if (curPlayMode.value == MusicInfoEnum.MusicPlayModeEnum.RANDOM) {
      return randomPlay();
    }
    const index =
      Number(playIndex.value) - 1 < 0
        ? curPlayList.value.length - 1
        : Number(playIndex.value) - 1;
    // 切换上一首前把当前歌曲暂停
    // actionPause()
    // 设置音乐切换
    setMusic(index);
  }

  /**
   * 下一首歌曲
   */
  function next() {
    // 随机播放
    if (curPlayMode.value == MusicInfoEnum.MusicPlayModeEnum.RANDOM) {
      return randomPlay();
    }
    const index =
      Number(playIndex.value) >= curPlayList.value.length - 1
        ? 0
        : Number(playIndex.value) + 1;
    // 切换下一首前把当前歌曲暂停
    // actionPause()
    // 设置音乐切换
    setMusic(index);
  }

  /**
   * 操作时，比如下一首音乐，上一首音乐，将当前正在播放的音乐暂停，状态归0，还未切换到下一首或者上一首
   */
  function actionPause() {
    // 每当歌曲切换时，清空上一首播放音乐的src
    audioInfo.audio.src = "";
    // 暂停播放
    pause();
    // 设置当前播放状态为播放结束
    status ? setCurPlayStatus(false) : "";
  }

  /**
   * 设置音乐切换
   */
  function setMusic(index: number) {
    // 要播放的下一首音乐
    const music = curPlayList.value[index];
    console.log("通过传入的index获取到需要播放的哪项音乐的信息==>", music);
    actionPause();
    // 设置当前播放音乐信息
    setCurMusicRecord(music, index);
    // 重置进度条播放状态
    audioInfo.currentTime = 0;
    audioInfo.audio.currentTime = 0;
    audioInfo.duration = 0;
  }

  /**
   * 设置音量大小
   */
  function setVolume(volume: number) {
    // 最大音量100
    volume = volume > 100 ? 100 : volume;
    // 最小音量0
    volume = volume < 0 ? 0 : volume;
    // 静音
    if (volume == 0) {
      muted.value = true;
      audioInfo.audio.muted = true;
    } else {
      muted.value = false;
      audioInfo.audio.muted = false;
      audioInfo.audio.volume = volume / 100;
    }
  }

  /**
   * 切换音乐播放模式, 三种：order顺序播放(默认)、loop单曲循环、random随机播放
   */
  function setMusicPlayMode(item: any) {
    let tip = "顺序播放";
    switch (item.mode) {
      case "order":
        tip = "单曲循环";
        curPlayMode.value = MusicInfoEnum.MusicPlayModeEnum.LOOP;
        break;
      case "loop":
        tip = "随机播放";
        curPlayMode.value = MusicInfoEnum.MusicPlayModeEnum.RANDOM;
        break;
      case "random":
        tip = "顺序播放";
        curPlayMode.value = MusicInfoEnum.MusicPlayModeEnum.ORDER;
        break;
      default:
        curPlayMode.value = MusicInfoEnum.MusicPlayModeEnum.ORDER;
    }

    ElNotification({
      title: "音乐模式切换",
      message: `已切换至${tip}模式`,
      type: "success",
      duration: 1000,
    });
  }

  /**
   * 循环播放音乐
   */
  function loopPlay() {
    setTimeout(() => {
      audioInfo.currentTime = 0;
      play();
    }, 1500);
  }

  /**
   * 随机播放
   */
  function randomPlay() {
    // sample方法 从集合中获取随机元素
    const randomMusic = _.sample(curPlayList.value);
    console.log("随机音乐==>", randomMusic);
    curPlayList.value.forEach((item, index) => {
      if (item.id === randomMusic.id) {
        // 切换下一首前把当前歌曲暂停
        actionPause();
        setMusic(index);
      }
    });
  }

  /**
   * 进度条改变，用户滑动进度条(slider)
   */
  function sliderChange(val: number) {
    audioInfo.currentTime = val;
    audioInfo.audio.currentTime = val;
  }

  /**
   * 设置当前播放状态
   */
  function setCurPlayStatus(state: boolean = false) {
    status.value = state;
  }

  /**
   * 保存当前播放的音乐信息
   * @param {Any} music 设置当前播放的音乐信息
   * @param {Number} index 指定从那首歌曲的下标开始播放
   * @param {Boolean} state 是否需要立即进行播放，默认为true
   */
  function setCurMusicRecord(
    music: any,
    index?: number,
    state: boolean = true
  ) {
    if (curMusicRecord.value?.id === music.id && !status.value) {
      // 当前正在播放的歌曲暂停时，修改状态继续播放
      play();
      return;
    }
    // 指定从那首歌曲的下标开始播放
    if (index != undefined) {
      playIndex.value = index;
    }
    // 当前播放音乐id
    curplayId.value = music.id;
    // 保存当前播放音乐信息
    curMusicRecord.value = music;
    // 通过id获取可播放的音频url
    state && playMusic(music.id);
  }

  /**
   * 播放进度时间格式化
   */
  function formatTime(second: number) {
    function padStart(num: number) {
      return (num | 0).toString().padStart(2, "0");
    }
    return padStart((second / 60) % 60) + ":" + padStart(second % 60);
  }

  // 重置音乐store状态
  function reset() {
    /** 音乐详情页隐藏 */
    showMusicDetail.value = false;
    /** 当前音乐播放列表隐藏 */
    showCurPlayList.value = false;
    /** 音乐加载重置 */
    loading.value = false;
    /** 重置是否播放结束状态 */
    isEnded.value = false;
    /** 清空当前音乐列表播放数组 */
    curPlayList.value = [];
    /** 重置当前音乐播放下标 */
    playIndex.value = 0;
    /** 重置音乐状态 */
    // status.value = false
    /** 重置当前播放模式 */
    curPlayMode.value = MusicInfoEnum.MusicPlayModeEnum.ORDER;
    /** 清空当前播放音乐信息 */
    curMusicRecord.value = {};
    /** 清空当前播放音乐url */
    musicUrl.value = "";
    /** 音乐暂停 */
    pause();
    /** 清空音频audio对象里面的可播放音频url */
    audioInfo.audio.src = "";
    // 重置音频或视频对象并加载新媒体资源
    // audioInfo.audio.load();
    /** 重置当前音乐播放进度 */
    audioInfo.currentTime = 0;
    audioInfo.audio.currentTime = 0;
    /** 重置音乐总时长 */
    audioInfo.duration = 0;
  }

  return {
    muted,
    status,
    loading,
    isEnded,
    curplayId,
    playIndex,
    volume,
    showMusicDetail,
    showCurPlayList,
    playList,
    curPlayList,
    curPlayMode,
    curMusicRecord,
    musicUrl,
    audioInfo,
    musicInfo,
    setCurMusicRecord,
    setMusicPlayMode,
    reset,
    play,
    pause,
    previous,
    next,
    setMusic,
    setVolume,
    createAudio,
    playMusic,
    sliderChange,
    formatTime,
    setCurPlayStatus,
    onTimeUpdate,
  };
});

// 在单文件中使用pinia，不这样做会报错，pinia未安装注册
export function useMusicStoreHook() {
  return useMusicStore(store);
}
