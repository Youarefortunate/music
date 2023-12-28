<!-- svg组件封装 -->
<script setup>
const props = defineProps({
  // 使用svg icon的前缀名称
  prefix: {
    type: String,
    default: "icon",
  },
  // svg名称
  iconClass: {
    type: String,
    required: false,
  },
  // icon颜色
  color: String,
  hoverColor: String,
  // icon大小
  size: {
    type: String,
    default: "1em",
  },
});

// 格式：icon-xxx
const symbolId = computed(() => `#${props.prefix}-${props.iconClass}`);
</script>

<template>
  <svg aria-hidden class="svg-icon"  :style="`width: ${size};height: ${size}`">
    <use :xlink:href="symbolId" :fill="color"></use>
  </svg>
</template>

<style lang="scss" scoped>
.svg-icon {
  display: inline-block;
  outline: none;
  width: 1em;
  height: 1em;
  vertical-align: -0.15em; /* 因icon大小被设置为和字体大小一致，而span等标签的下边缘会和字体的基线对齐，故需设置一个往下的偏移比例，来纠正视觉上的未对齐效果 */
  // fill: currentColor; /* 定义元素的颜色，currentColor是一个变量，这个变量的值就表示当前元素的color值，如果当前元素未设置color值，则从父元素继承 */
  overflow: hidden;
}
</style>
