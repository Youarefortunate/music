<script setup lang="ts">
const props = defineProps({
  // 专辑详情
  album: {
    type: Object,
    default: () => {},
  },
});

const desc = ref("");
onMounted(() => {
  const text = props.album.description.split("");

  const r = text
    .map((m: string) => {
      if (m == "\n") {
        return "<br/>";
      }
      return m;
    })
    .join("");

  desc.value = (r as string).replaceAll("<br/><br/>", "<br/>");
});

defineOptions({
  name: "AlbumDesc",
});
</script>

<template>
  <div class="album-desc">
    <h4>专辑介绍</h4>

    <div class="desc">{{ album.description || "该专辑暂无描述" }}</div>
  </div>
</template>

<style lang="scss" scoped>
.desc {
  text-indent: 25px;
  color: #666666;
  font-size: 15px;
  // line-height: 35px;
  white-space: pre-line;
}
</style>
