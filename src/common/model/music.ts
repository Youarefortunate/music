import * as MusicApi from "@/api/music";
import * as MusicInfoEnum from "@/enums/MusicInfoEnum";

/**
   * 通过音乐id获取音乐播放的url(标准音质)
   */
export function getMusicURLByIds(musicId: string | number) {
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