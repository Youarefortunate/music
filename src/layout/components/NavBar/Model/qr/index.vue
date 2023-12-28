<script lang="ts" setup>
import { useQrLoginStore } from "@/store/modules/qrLogin";
// 对话框加载二维码
let loading = ref(false);
// 二维码store
const qrLoginStore = useQrLoginStore();

// 刷新二维码
function refreshQrCode() {
  loading.value = true;
  qrLoginStore.refreshQrCode();
  loading.value = false;
}
// 两种定义emits方式
// const emits = defineEmits(["handleFinish"]);
const emits = defineEmits<{
  (e: "handleFinish", visible: boolean): void; // 函数类型 当传递的值的类型不是boolean时会报错
}>();


onMounted(async () => {
  // 开始加载
  loading.value = true;
  // 获取生成二维码 key
  await qrLoginStore.getQRKey();
  // 获取登录二维码
  await qrLoginStore.createQR();
  // 加载结束
  loading.value = false;
  // 轮询检测扫码状态接口
  qrLoginStore.checkQR().then((res) => {
    ElMessage.success(res);
    // 向父组件发送完成消息
    emits('handleFinish', false)
  });
});

// 页面销毁
onUnmounted(() => {
  qrLoginStore.isExpired = true;
});

defineOptions({
  name: "QrForm",
});
</script>

<template>
  <div class="h-[380px] flex flex-col items-center justify-center">
    <div class="mb-[30px] text-6">{{ qrLoginStore.scanCodeComplete ? '扫码成功' : '扫码登录' }}</div>

    <div class="qr-code w-[11.25rem] h-[11.25rem]" v-loading="loading">
      <!-- 二维码 -->
      <img v-if="!qrLoginStore.scanCodeComplete" class="w-full h-full object-contain" :src="qrLoginStore.src" />
      <!-- 扫码成功，扫码用户头像 -->
      <img v-else class="w-100% h-100% object-contain" :src="qrLoginStore.avatarUrl" />
    </div>

    <div class="text-[13.5px] mt-[18px]" v-if="!qrLoginStore.scanCodeComplete">
      当前二维码过期了?<span class="color-[rgb(59,115,194)] cursor-pointer" @click.stop="refreshQrCode">点击刷新</span>
    </div>

    <div v-else class="flex flex-col items-center mt-[18px]">
      <div class="text-[13.5px] truncate">
        用户：<span class="color-[rgb(59,115,194)] cursor-pointer" :title="qrLoginStore.nickname">{{
          qrLoginStore.nickname }}</span>
      </div>
      <div class="text-[13.5px] mt-10px">扫码成功，等待用户确认登录...</div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.qr-code {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #b5b5b5;
}
</style>
