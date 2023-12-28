<script lang="ts" setup>
import { nextTick } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Message, Lock } from "@element-plus/icons-vue";
import * as EmailApi from "@/api/login/email";
import { encryptMD5 } from "@/utils/encryption";
import { useUserStore } from "@/store/modules/user";

interface RuleForm {
  email: string;
  password: string;
}

// 用户store
const userStore = useUserStore();
// 表单ref
const emailFormRef = ref<FormInstance>();
// 表单项错误提示
const errMsg = ref<string>("");
// 按钮加载
const loading = ref<boolean>(false);
// 表单数据
const form = reactive<RuleForm>({
  email: "",
  password: "",
});
// 表单规则验证
const rules = reactive<FormRules<RuleForm>>({
  email: [
    { required: true, message: "请输入邮箱账号", trigger: "change" },
    {
      pattern: /^\w{1,64}@[a-z0-9\-]{1,256}(\.[a-z]{2,6}){1,2}$/i,
      message: "邮箱格式不正确",
      trigger: "change",
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "change" }],
});
// 子组件自定义事件
const emits = defineEmits<{
  (e: "handleFinish", visible: boolean): void; // 函数类型 当传递的值的类型不是boolean时会报错
}>();

// 提交表单
const handleSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (!valid) return;
    // 需要对错误tip进行清空，否则只会触发一次
    errMsg.value = "";
    loading.value = true;
    EmailApi.loginEmail({
      email: form.email,
      md5_password: encryptMD5(form.password),
    })
      .then((res) => {
        const { code } = res.data;
        if (code != 200) {
          return Promise.reject(res.data);
        }
        // 是否绑定有网易邮箱账号
        if (hasBind(res.data.bindings)) {
          // 保存toke、cookie、profile、account
          userStore.setData(res.data);
          // 通知
          ElMessage.success("邮箱登录成功");
          // 通知父组件关闭对话框
          emits("handleFinish", false);
          // 重置表单项
          resetForm(formEl);
          console.log("邮箱登录成功==>", res);
        } else {
          nextTick(() => {
            errMsg.value = "当前邮箱还未绑定";
          });
        }
      })
      .catch((err) => {
        console.log("邮箱登录失败==>", err);
        // 邮箱未注册
        if (err.code && err.code == 501) {
          nextTick(() => {
            errMsg.value = "邮箱未注册";
          });
        } else {
          ElMessage.error(err.message || "邮箱登录失败");
        }
      })
      .finally(() => (loading.value = false));
    // 重置表单项
    resetForm(formEl);
  });
};

/**
 * 是否绑定有网易邮箱账号
 * @returns {boolean} true已d绑定有网易邮箱账号，false没有绑定
 */
function hasBind(bindings: any[]): boolean {
  if (bindings.length == 0) {
    return false;
  }
  // type为0表示网易邮箱账号
  const bind = bindings.filter((item) => item.type == 0);
  if (bind.length == 0) {
    return false;
  }
  return true;
}

// 重置表单项
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

defineOptions({
  name: "EmailForm",
});
</script>

<template>
  <div class="email-form">
    <!-- logo图标 -->
    <div class="logo w-full h-[60px] mb-[30px] flex justify-center">
      <img
        class="w-[60px] h-[60px] object-cover"
        src="~@/assets/logo.png"
        alt="logo"
      />
    </div>

    <!-- 表单部分 -->
    <div class="email-form-el">
      <el-form
        class="email-form"
        ref="emailFormRef"
        :model="form"
        :rules="rules"
        size="large"
      >
        <el-form-item prop="email" :error="errMsg">
          <el-input
            v-model="form.email"
            :prefix-icon="Message"
            autocomplete="false"
            placeholder="请输入邮箱账号(163网易邮箱)"
            clearable
          />
        </el-form-item>
        <!-- 密码登录 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            clearable
            show-password
          />
        </el-form-item>
      </el-form>

      <!-- 登录按钮 -->
      <div class="btn-login h-[40px] mt-[40px]">
        <el-button
          :loading="loading"
          class="w-full"
          style="height: 40px"
          color="rgb(255,58,58)"
          type="danger"
          @click="handleSubmit(emailFormRef)"
          >登录</el-button
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.email-form-el {
  padding: 0 30px;
}

// 表单穿透样式
:deep(.email-form-el) {
  .email-form .el-form-item:first-child {
    margin-bottom: 25px;
  }
}
</style>
