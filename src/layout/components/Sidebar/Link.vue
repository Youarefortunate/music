<script lang="ts" setup>
import { computed } from "vue";
import { isExternal } from "@/utils/index";
import { useRouter, RouteMeta } from "vue-router";

import { useAppStore } from "@/store/modules/app";

const appStore = useAppStore();

const sidebar = computed(() => appStore.sidebar);
const device = computed(() => appStore.device);

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  meta: {
    type: Object as PropType<RouteMeta>,
    default: () => ({}),
  },
});

const router = useRouter();
function push() {
  if (device.value === "mobile" && sidebar.value.opened == true) {
    appStore.closeSideBar(false);
  }

  if (props.meta?.jump) {
    const path = props.to.split("?")[0];
    return router.push({
      path,
      query: {
        songId: props.meta.songId as string,
      },
    });
  }

  router.push(props.to).catch((err) => {
    console.error(err);
  });
}
</script>

<template>
  <a v-if="isExternal(to)" :href="to" target="_blank" rel="noopener">
    <slot></slot>
  </a>
  <div v-else @click="push">
    <slot></slot>
  </div>
</template>
