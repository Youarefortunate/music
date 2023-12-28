import * as FmApi from "@/api/fm";
import { HttpStatusCode } from "axios";
import { ElMessageBox, ElMessage } from "element-plus";

/**
 * 将音乐丢入垃圾桶
 * @description 说明 : 调用此接口 , 传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶
 * @param {String | Number} id: 歌曲 id
 */
export function fmTrash(id: string | number): Promise<HttpStatusCode> {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm("将该音乐从私人fm移除吗？", "FM音乐移入垃圾桶", {
      confirmButtonText: "移除",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      FmApi.fmTrash(id).then((res) => {
        const { code } = res.data;
        if (code != 200) {
          reject(code);
          return ElMessage.error("移除失败");
        }
        resolve(code);
        ElMessage.success("移除成功，将不再推荐该歌曲");
      });
    });
  });
}
