<script setup lang="ts">
import * as VideoApi from '@/api/video'

const props = defineProps({
  cat: {
    type: String,
    default: "",
  },
  catId: {
    type: Number,
    default: 0,
  }
});

const emits = defineEmits(["update:cat", 'update:catId']);
const cateName = useVModel(props, "cat", emits);
const cateId = useVModel(props, "catId", emits);
// 加载
const loading = ref<boolean>(false);
// 是否可见
const visble = ref(false);
const tags = ref<Array<any>>([]);

watch(visble, (v) => {
  if (v) {
    // 获取视频全部分类
    !tags.value.length && getSongListAllCate();
  }
});

// 获取视频全部分类
function getSongListAllCate() {
  loading.value = true;
  VideoApi.getAllCateList()
    .then((res) => {
      const { code, data } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      tags.value = data || [];
      tags.value.unshift({
        id: -1,
        name: "全部",
      });
      console.log("获取视频全部分类成功==>", res.data);
    })
    .catch((err) => {
      console.log("获取视频全部分类失败==>", err);
      ElMessage.error("获取视频全部分类失败");
    })
    .finally(() => (loading.value = false));
}

// 切换分类
const handleSwitchCate = (cate: any) => {
  if (cateName.value == cate.name) return;
  console.log('切换视频分类==>', cate);
  cateId.value = cate.id;
  cateName.value = cate.name;
  visble.value = false;
};

// 显示组件
function show(v?: boolean) {
  visble.value = v || !visble.value;
}

defineExpose({
  show,
});

defineOptions({
  name: "VideoAllCate",
});
</script>

<template>
  <div class="all-cate" v-show="visble">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>当前视频分类：{{ cateName }}</span>
        </div>
      </template>

      <div class="cate-content" v-if="tags.length">
        <div class="cate-item" v-for="(cate, index) in tags" :key="index">
          <el-link
            @click="handleSwitchCate(cate)"
            class="mr-10px relative"
            :style="{
              color: cateName == cate.name ? 'var(--el-color-primary)' : '',
            }"
            :underline="false"
          >
            <span>{{ cate.name }}</span>
          </el-link>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
@mixin scroll-bar($width: 10px) {
  /*定义滚动条外层轨道的样式*/
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: rgba(255,255,255, 0);
  }
  /*定义滚动条整体的样式*/
  &::-webkit-scrollbar {
    width: $width;
    // height: 100px;
    background-color: rgba(255, 255, 255, 0);
  }
  /*滚动条里面可以拖动的那个*/
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.all-cate {
  width: 80%;
  height: calc(100vh - 300px);
  position: absolute;
  left: 0;
  top: 45px;
  // 层级5比歌单项高一层
  z-index: 5;
  overflow-y: scroll;
  @include scroll-bar;
  .cate-content {
    padding: 0 0 10px 20px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    justify-items: baseline;
    .cate-item {
      line-height: 40px;
    }
  }
}
</style>
