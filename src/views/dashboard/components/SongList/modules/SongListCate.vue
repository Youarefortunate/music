<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import * as SongListEnum from "@/enums/SongListEnum";
import * as SongListApi from "@/api/songList";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

// 加载
const loading = ref(false);
// 是否可见
const visble = ref(false);
const emits = defineEmits(["update:modelValue"]);
const cateName = useVModel(props, "modelValue", emits);

watch(cateName, (cate: string) => {
  cateName.value = cate;
});
// 歌单分类类型
const cateType = [
  {
    icon: "yuzhong",
    name: "语种",
    category: SongListEnum.SongListCateEnum.yuzhong,
  },
  {
    icon: "fengge",
    name: "风格",
    category: SongListEnum.SongListCateEnum.fengge,
  },
  {
    icon: "changjing",
    name: "场景",
    category: SongListEnum.SongListCateEnum.changjing,
  },
  {
    icon: "xiaolian",
    name: "情感",
    category: SongListEnum.SongListCateEnum.qinggan,
  },
  {
    icon: "zhuti",
    name: "主题",
    category: SongListEnum.SongListCateEnum.zhuti,
  },
];
// 歌单全部分类数据
const subTags = ref<any>([]);

onMounted(() => {
  // 获取歌单全部分类
  getSongListAllCate();
});

// 获取歌单全部分类
function getSongListAllCate() {
  loading.value = true;
  SongListApi.getSongListCatList()
    .then((res) => {
      const { code, sub } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      subTags.value = sub || [];
    })
    .catch((err) => {
      console.log("获取歌单全部分类失败==>", err);
      ElMessage.error("获取歌单全部分类失败");
    })
    .finally(() => (loading.value = false));
}

// 切换分类
const handleSwitchCate = (sub: any) => {
  if (cateName.value == sub.name) return;
  cateName.value = sub.name;
  visble.value = false;
};

// 显示组件
function show(v?: boolean) {
  visble.value = v || !visble.value;
}

defineExpose({
  show,
});

// 组件名称
defineOptions({
  name: "SongListCate",
});
</script>

<template>
  <!-- 歌单类型分类 -->
  <div class="songlist-cate" v-show="visble">
    <el-card class="box-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>当前歌单分类：{{ cateName }}</span>
        </div>
      </template>

      <div class="cate-content" v-if="subTags.length">
        <div class="cate-item" v-for="(cate, index) in cateType" :key="index">
          <div class="cate-tip">
            <svg-icon color="#999999" size="30px" :icon-class="cate.icon" />
            <span class="text-xs ml-5px">{{ cate.name }}</span>
          </div>

          <div class="tag-text">
            <template v-for="sub in subTags">
              <el-link
                @click="handleSwitchCate(sub)"
                class="mr-10px relative"
                v-if="cate.category == sub.category"
                :style="{
                  color: cateName == sub.name ? 'var(--el-color-primary)' : '',
                }"
                :underline="false"
              >
                <span>{{ sub.name }}</span>
                <div class="hot" v-if="sub.hot">
                  <svg-icon icon-class="remen" size="18px" />
                </div>
              </el-link>
            </template>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
:deep(.box-card) {
  .el-card__body {
    padding: 0 var(--el-card-padding) var(--el-card-padding) 0;
  }
}
.songlist-cate {
  // width: 700px;
  width: 70%;
  min-width: 800px;
  position: absolute;
  left: 0;
  top: 45px;
  // 层级5比歌单项高一层
  z-index: 5;
}

.cate-content {
  .cate-item {
    display: grid;
    grid-template-columns: 200px 1fr;
    .cate-tip {
      color: #999999;
      text-align: center;
      padding-top: 15px;
    }
    .tag-text {
      padding: 16px 15px 0 15px;
      line-height: 40px;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      justify-items: baseline;
      .hot {
        position: absolute;
        right: -17px;
        top: 0px;
        color: red;
      }
    }
  }
}
</style>
