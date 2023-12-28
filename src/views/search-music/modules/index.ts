import * as SearchMusicAPi from "@/api/search";
import { SearchMusicParams } from '@/api/search/type'
import Singer from './Singer.vue'
import Single from './Single.vue'
import Video from './Video.vue'
import User from './User.vue'

/**
 * 搜索
*/
export function search(params: SearchMusicParams) {
  return new Promise<any>((resolve, reject) => {
    // 获取搜索歌曲
    SearchMusicAPi.searchMusic(params).then((res) => {
      const { code, result } = res.data;
      if (code != 200) {
        return reject(new Error("搜索失败"));
      }
      resolve(result)
    })
      .catch((err) => {
        console.log("搜索失败==>", err);
        ElMessage.error(err || err.message || "搜索失败");
      })
  })
}

export {
  Singer,
  Single,
  Video,
  User
}