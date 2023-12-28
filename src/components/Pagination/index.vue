<template>
  <div :class="{ hidden: hidden }" class="pagination float-right">
    <!-- v-if="total > pageSize" -->
    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :total="total"
      :page-sizes="hasPageSizes ? pageSizes : []"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { scrollTo } from "@/utils/scroll-to";

defineOptions({
  name: 'Pagination'
})

const props = defineProps({
  total: {
    required: true,
    type: Number as PropType<number>,
    default: 0,
  },
  page: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 20,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default() {
      return [10, 20, 30, 50];
    },
  },
  layout: {
    type: String,
    default: "prev, pager, next",
  },
  background: {
    type: Boolean,
    default: true,
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["pagination", "update:page", "update:limit"]);
// 当前页码
const currentPage = useVModel(props, "page", emit);

// 一页显示多少条数
// useVModel: v-model简写形式，参数1：属性变量，参数2：属性名， 参数3直接修改时相当于触发emit("update:limit", limit)
const pageSize = useVModel(props, "limit", emit);

// 是否需要每页显示个数选择器的选项设置
const hasPageSizes = computed<boolean>(() => {
  return props.layout.split(',').map(item => item.trim()).includes('sizes')
})

/**
 * 页码发生改变
 */
function handleSizeChange(val: number) {
  emit("pagination", { page: currentPage, limit: val });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}

/**
 * 条数发送改变
 */
function handleCurrentChange(val: number) {
  currentPage.value = val;
  emit("pagination", { page: val, limit: props.limit });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}
</script>

<style lang="scss" scoped>
.pagination {
  padding: 12px;

  &.hidden {
    display: none;
  }
}
</style>
