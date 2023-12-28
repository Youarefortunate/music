import { useMusicStore } from "@/store/modules/music";
import { storeToRefs } from "pinia";


const musicStore = useMusicStore();
const { curPlayList } = storeToRefs(musicStore);

/**
 * 播放音乐公共函数
 * @param {Any} curRecord 当前需要播放的音乐信息
 * @description 双击播放、鼠标右键播放等
 */
export function playMusicAction(curRecord: any) {
  // 要播放的音乐存在于当前音乐播放列表中
  if (hasMusic(curRecord)) {
    curPlayList.value.forEach((item, index) => {
      if (item.id === curRecord.id) {
        // 通过下标直接播放该歌曲
        musicStore.setMusic(index);
      }
    });
  } else {
    // 歌曲不存在当前播放的音乐列表中，获取当前播放下标
    const index = Number(musicStore.playIndex);
    // 当前播放列表没有歌曲，直接追加
    if (index == -1 && curPlayList.value.length == 0) {
      curPlayList.value.push(curRecord);
      return musicStore.setCurMusicRecord(curRecord, 0);
    }
    curPlayList.value.forEach((item, i) => {
      if (i === index) {
        curPlayList.value.splice(i + 1, 0, curRecord);
        musicStore.setMusic(i + 1);
      }
    });
  }
}

/**
 * 将该音乐设置为下一首播放
 * @param {Any} curRecord 当前需要设置下一首播放的音乐信息
 * @description 首先判断这一首歌在存不存在播放列表中，存在：则将这首歌先删除，再移动到当前播放音乐的下一首歌曲位置
 * 不存在：则直接添加到当前播放音乐的下一首歌曲位置
 */
export function setNextPlay(curRecord: any) {
  // 歌曲不存在当前播放的音乐列表中，获取当前播放下标
  const index = Number(musicStore.playIndex);
  // 要播放的音乐存在于当前音乐播放列表中
  if (hasMusic(curRecord)) {
    curPlayList.value.forEach((item, i) => {
      if (item.id === curRecord.id) {
        // 先删除原歌曲所在的位置
        curPlayList.value.splice(i, 1);
        // 再重新追加到当前播放音乐的下一首歌曲位置
        curPlayList.value.splice(index + 1, 0, curRecord);
      }
    });
  } else {
    // 当前播放列表没有歌曲，直接追加
    if (index == -1 && curPlayList.value.length == 0) {
      curPlayList.value.push(curRecord);
      return musicStore.setCurMusicRecord(curRecord, 0);
    }
    // 该歌曲不在当前播放的音乐列表中，直接追加到当前播放音乐的下一首歌曲位置
    curPlayList.value.splice(index + 1, 0, curRecord);
  }
};

/**
 * 当前音乐播放列表是否存在该首音乐
 * @returns {Boolean} true存在 false不存在
 */
export function hasMusic(record: any): boolean {
  return curPlayList.value.some((item: any) => item.id === record.id);
}