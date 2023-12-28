<script lang="ts" setup>
import QrForm from "./qr/index.vue";
import PhoneForm from "./phone/index.vue";
import EmailForm from "./email/index.vue";
import { useUserStore } from '@/store/modules/user'

type ComponentType = "qr" | "phone" | "email";
const type = {
  qr: QrForm,
  phone: PhoneForm,
  email: EmailForm,
};

const userStore = useUserStore();
// 当前组件(默认手机号验证码登录)
const curComponent = ref<ComponentType>("qr");
// 注意，使用setup语法糖时，is关键字如果是字符串类型会导致组件无法识别，只能是组件实例
const componentId = computed(() => type[curComponent.value]);

// 对话框是否可见
let visible = ref<boolean>(false);
// 是否完成
const isFinish = ref<boolean>(false);

watch(() => [isFinish.value, userStore.isLogin], ([finish, isLogin]) => {
  if(finish && isLogin) {
    location.reload();
  }
})

// 显示对话框
async function show(show: boolean = false) {
  // 显示对话框
  visible.value = show;
  isFinish.value = false;
}

// 其他登录方式, 切换至手机号登录
function handleOtherLogin(type: ComponentType) {
  curComponent.value = type;
}

// 点击叉号关闭弹窗
const handleClose = (done: () => void) => {
  done();
};

// 子组件完成自定义事件，关闭弹窗
function handleFinish(show: boolean) {
  console.log("子组件完成，关闭对话框");
  visible.value = show;
  isFinish.value = true;
}

// 使得组件外部可以通过ref拿到该组件内部数据
defineExpose({
  show,
});
</script>

<template>
  <div class="dialog">
    <el-dialog
      v-model="visible"
      top="20vh"
      width="21%"
      destroy-on-close
      class="qr-dialog"
      :before-close="handleClose"
    >
      <!-- 当切换至手机号登录时，dialog头部显示二维码 -->
      <template #header v-if="curComponent == 'phone'">
        <el-tooltip
          class="tooltip"
          content="扫码登录更安全"
          placement="right"
          effect="customized"
        >
          <img
            @click="handleOtherLogin('qr')"
            class="w-[3.75rem] h-[3.75rem] cursor-pointer"
            src="~@/assets/qr-code-login/qr-code-half.png"
            alt="二维码登录"
          />
        </el-tooltip>
      </template>

      <template #header v-if="curComponent == 'email'">
        <div
          @click="handleOtherLogin('phone')"
          class="p-[18px] cursor-pointer flex color-[rgb(102,102,102)] items-center text-[13px]"
        >
          <i-ep-ArrowLeft />
          <span>返回其他登录方式</span>
        </div>
      </template>

      <!-- 动态渲染组件 -->
      <component
        :is="componentId"
        @handleFinish="handleFinish"
        @handleEmailLogin="handleOtherLogin('email')"
      />

      <template #footer>
        <div
          v-if="curComponent === 'qr'"
          @click="handleOtherLogin('phone')"
          class="other-login flex justify-center color-[rgb(102,102,102)] items-center cursor-pointer text-center mb-[30px] text-[11.5px]"
        >
          <span>选择其他方式登录</span>
          <i-ep-ArrowRight />
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
// el-dialog深层穿透样式(注意样式穿透在vue3时一定要在template中套上一个div或者其他标签，否则穿透效果无效)
:deep(.qr-dialog) {
  min-width: 350px;
  height: 32.6875rem;
  .el-dialog__header {
    padding: 0;
  }
  .el-dialog__body {
    //padding: 10px 20px;
  }
}

.other-login {
  color: #8f8f8f;
  transition: color 0.5s;
  &:hover {
    color: black;
  }
}
</style>
