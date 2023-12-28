<script setup lang="ts">
// Element plus国际化
import { ElConfigProvider } from 'element-plus'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

</script>

<template>
  <el-config-provider :local="appStore.locale" :size="appStore.size">
    <router-view />
  </el-config-provider>
</template>
