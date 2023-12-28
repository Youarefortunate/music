<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import * as HighqualityApi from "@/api/highquality";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const emits = defineEmits(["update:modelValue"]);
const cateName = useVModel(props, "modelValue", emits);
// 加载
const loading = ref<boolean>(false);
// 是否可见
const visble = ref(false);
const highTags = ref<Array<any>>([]);

watch(visble, (v) => {
  if (v) {
    // 获取精品歌单全部分类
    getSongListAllCate();
  }
});

// 获取精品歌单全部分类
function getSongListAllCate() {
  loading.value = true;
  HighqualityApi.getHighqualitySongListTag()
    .then((res) => {
      const { code, tags } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      highTags.value = tags || [];
      highTags.value.unshift({
        id: -1,
        name: "全部",
      });
      console.log("获取精品歌单全部分类成功==>", res.data);
    })
    .catch((err) => {
      console.log("获取精品歌单全部分类失败==>", err);
      ElMessage.error("获取精品歌单全部分类失败");
    })
    .finally(() => (loading.value = false));
}

// 切换分类
const handleSwitchCate = (cate: any) => {
  if (cateName.value == cate.name) return;
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

// 组件名称
defineOptions({
  name: "HighqualityCate",
});
</script>

<template>
  <div class="high-qality-cate" v-show="visble">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>当前歌单分类：{{ cateName }}</span>
        </div>
      </template>

      <div class="cate-content" v-if="highTags.length">
        <div class="cate-item" v-for="(cate, index) in highTags" :key="index">
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

<style scoped lang="scss">
.high-qality-cate {
  width: 500px;
  position: absolute;
  left: -400px;
  top: 45px;
  // 层级5比歌单项高一层
  z-index: 5;
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
