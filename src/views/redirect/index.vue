<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const { params, query } = route;
const { path } = params;

// 重定向到根目录
router.replace({
  path: "/" + path,
  query,
});
</script>

<template>
  <div></div>
</template>
