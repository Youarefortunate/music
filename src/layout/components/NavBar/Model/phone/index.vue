<script lang="ts" setup>
import { toRefs, nextTick } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { Iphone, Lock, Key } from "@element-plus/icons-vue";
import * as phoneApi from "@/api/login/phone";
import { phoneLoginInfo } from "@/api/login/phone/type";
import { encryptMD5 } from "@/utils/encryption";
import { useUserStore } from "@/store/modules/user";

interface RuleForm {
  phone: string;
  password: string;
  captcha: string;
}
// 用户store
const userStore = useUserStore();
// 子组件自定义事件
const emits = defineEmits<{
  (e: "handleFinish", visible: boolean): void; // 函数类型 当传递的值的类型不是boolean时会报错
  (e: "handleEmailLogin", type: string): void;
}>();
// 表单ref
const phoneFormRef = ref<FormInstance>();
// 按钮加载
const loading = ref<boolean>(false);
// 表单数据
const form = reactive<RuleForm>({
  phone: "",
  password: "",
  captcha: "",
});
// 验证码倒计时
const captchaInfo = reactive({
  time: 60,
  isSend: false,
});
// 响应式解构
const { time, isSend } = toRefs(captchaInfo);
// 国家码，用于国外手机号登录，例如中国传入：0
const countrycode = ref("+86");
// 同意条款
const clause = ref(true);
type CurLoginType = "phone" | "captcha";
// 当前登录方式（1、手机号登录，2、验证码登录）
const curLoginType = ref<CurLoginType>("captcha");
// 当前是否为密码登录
const curIsPassword = computed(() => curLoginType.value === "phone");
// 错误tip
let captchaErrMsg = ref("");
/**
 * 检验验证码
 */
const checkCaptcha = (_: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入验证码"));
  } else if (value.length == "4") {
    callback();
  } else {
    callback(new Error("请输入正确的验证码"));
  }
};
// 重置表单项
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
// 切换登录方式（1、手机号登录，2、验证码登录）
const handleSwitchLoginType = (type: string) => {
  curLoginType.value = type as CurLoginType;
};
// 提交表单
const handleSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (!valid) return;
    if (!clause.value) {
      return ElMessage.warning(
        "请先勾选《服务条款》《隐私条款》《儿童隐私条款》"
      );
    }
    // 判断当前表单提交类型，手机号密码登录表单，手机号验证码登录表单
    if (curIsPassword.value) {
      passwordLogin(formEl);
    } else {
      captchaLogin(formEl);
    }
  });
};

// 验证码登录
async function captchaLogin(formEl: FormInstance | undefined) {
  // 验证验证码是否正确
  const captchaCorrect = await captchaCheck();
  if (!captchaCorrect) return;
  let data: phoneLoginInfo = {
    phone: form.phone,
    captcha: form.captcha, // 验证码登录，传入此参数password参数无效
  };
  loading.value = true;
  // 校验成功, 开始登录请求
  login(data)
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      console.log("验证码登录成功==>", res);
      // 保存toke、cookie、profile、account
      userStore.setData(res.data);
      // 通知
      ElMessage.success("验证码登录成功");
      // 通知父组件关闭对话框
      emits("handleFinish", false);
      // 重置表单项
      resetForm(formEl);
      console.log("验证码登录成功==>", res);
    })
    .catch((err) => {
      console.log("验证码登录失败==>", err);
      ElMessage.error(err.message || "验证码登录失败");
    })
    .finally(() => (loading.value = false));
}

// 密码登录
function passwordLogin(formEl: FormInstance | undefined) {
  let data: phoneLoginInfo = {
    phone: form.phone,
    md5_password: encryptMD5(form.password), // md5加密密码，传入此参数password参数无效
  };
  loading.value = true;
  login(data)
    .then((res) => {
      const { code } = res.data;
      if (code != 200) {
        return Promise.reject(res.data);
      }
      // 保存toke、cookie、profile、account
      userStore.setData(res.data);
      // 通知
      ElMessage.success("密码登录成功");
      // 通知父组件关闭对话框
      emits("handleFinish", false);
      // 重置表单项
      resetForm(formEl);
      console.log("密码登录成功==>", res);
    })
    .catch((err) => {
      console.log("密码登录失败==>", err);
      ElMessage.error(err.message || "手机号密码登录失败");
    })
    .finally(() => (loading.value = false));
}

function login(data: phoneLoginInfo) {
  return new Promise<any>((resolve, reject) => {
    phoneApi
      .phoneLogin({ ...data })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 校验验证码是否正确
function captchaCheck() {
  return new Promise<boolean>((resolve, reject) => {
    phoneApi
      .captchaCheck({
        phone: form.phone,
        captcha: form.captcha,
      })
      .then((res) => {
        console.log("校验验证码是否正确then返回数据==>", res);
        const { data, message } = res.data;
        if (data) {
          console.log("验证码校验通过!");
          resolve(data);
        } else {
          // 设置表单项错误提示
          formItemErrorTip(message);
          reject(data);
        }
      })
      .catch((err) => {
        console.log("校验验证码是否正确失败catch==>", err);
        reject(err.data);
        formItemErrorTip(err.message);
      });
  });
}
// 获取验证码
const getCaptcha = async () => {
  // 没有写电话号码就直接点击发送验证码
  if (!form.phone) {
    return phoneFormRef.value?.validateField("phone", () => null);
  }
  const result = await phoneApi.sendCaptcha(form.phone);
  // console.log("验证码发送==>", result);
  const { data, message } = result.data;
  if (data) {
    ElMessage.success("验证码发送成功");
    isSend.value = true;
    // 开始倒计时
    captchaCountdown();
  } else {
    // data为false说明获取验证码失败，失败原因可能如下：超过每天请求的次数
    formItemErrorTip(message);
    isSend.value = false;
  }
};
/**
 * 验证码倒计时
 */
function captchaCountdown() {
  if (time.value <= 0) {
    // 小于等于0说明还没有发送验证码，将状态设置为false
    isSend.value = false;
    // 重置倒计时时间60s
    time.value = 60;
  } else {
    setTimeout(() => {
      // 开始倒计时
      time.value--;
      captchaCountdown();
    }, 1000);
  }
}

/**
 * 表单项错误提示
 */
function formItemErrorTip(msg: string) {
  captchaErrMsg.value = "";
  nextTick(() => {
    captchaErrMsg.value = msg || "";
  });
}

// 表单规则验证
const rules = reactive<FormRules<RuleForm>>({
  phone: [
    { required: true, message: "请输入电话号码", trigger: "change" },
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "手机号码格式不正确",
      trigger: "change",
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "change" }],
  captcha: [{ validator: checkCaptcha, trigger: "change" }],
});

// 切换至邮箱登录
const handleEmailLogin = () => {
  emits("handleEmailLogin", "email");
};

defineOptions({
  name: "PhoneForm",
});
</script>

<template>
  <div class="phone-form">
    <!-- logo图标 -->
    <div class="logo w-full h-[60px] mb-[30px] flex justify-center">
      <img
        class="w-[60px] h-[60px] object-cover"
        src="~@/assets/logo.png"
        alt="logo"
      />
    </div>

    <!-- 表单部分 -->
    <div class="phone-form-el">
      <el-form ref="phoneFormRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            :prefix-icon="Iphone"
            placeholder="请输入手机号"
            clearable
          >
            <template #prepend>
              <el-select
                v-model="countrycode"
                placeholder="选择手机国家"
                style="width: 100px"
              >
                <el-option label="+86 中国" value="+86" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <!-- 密码登录 -->
        <el-form-item prop="password" v-if="curIsPassword">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            clearable
            show-password
          />
        </el-form-item>

        <!-- 验证码登录 -->
        <el-form-item prop="captcha" :error="captchaErrMsg" v-else>
          <!-- 验证码登录 -->
          <el-input
            v-model="form.captcha"
            placeholder="请输入验证码"
            :prefix-icon="Key"
            clearable
          >
            <template #append>
              <el-link
                @click="getCaptcha"
                :disabled="isSend"
                style="font-size: 12px; width: 50px"
                :underline="false"
                >{{ isSend ? `${time}s` : "获取验证码" }}</el-link
              >
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 切换为验证码登录 -->
      <div class="switch-login-type text-right mb-[30px]">
        <el-link
          v-if="curLoginType === 'phone'"
          @click="handleSwitchLoginType('captcha')"
          style="font-size: 13.5px; color: rgb(59, 115, 194)"
          type="primary"
          :underline="false"
          >切换至验证码登录</el-link
        >
        <el-link
          v-else
          @click="handleSwitchLoginType('phone')"
          style="font-size: 13.5px; color: rgb(59, 115, 194)"
          type="primary"
          :underline="false"
          >切换至密码登录</el-link
        >
      </div>

      <!-- 登录按钮 -->
      <div class="btn-login h-[40px] mb-[30px]">
        <el-button
          :loading="loading"
          class="w-full"
          style="height: 40px"
          color="rgb(255,58,58)"
          type="danger"
          @click="handleSubmit(phoneFormRef)"
          >登录</el-button
        >
      </div>

      <!-- 邮箱登录 -->
      <div class="email-login w-full flex justify-center mb-[15px]">
        <div
          @click="handleEmailLogin"
          class="w-[35px] h-[35px] flex text-[13px] color-white justify-center items-center cursor-pointer"
        >
          <el-tooltip
            class="tooltip"
            content="邮箱登录"
            placement="top"
            effect="dark"
          >
            <span>易</span>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 同意条款 -->
    <div class="clause flex items-center justify-center text-[5px]">
      <el-checkbox v-model="clause" />
      <div class="flex justify-center ml-[5px]">
        <span class="text-12px">同意</span>
        <a
          class="text-[12px] text-[rgb(64,158,255)]"
          target="_blank"
          href="https://st.music.163.com/official-terms/service"
          :underline="false"
          >《服务条款》</a
        >
        <a
          class="text-[12px] text-[rgb(64,158,255)]"
          target="_blank"
          href="https://st.music.163.com/official-terms/privacy"
          :underline="false"
          >《隐私条款》</a
        >
        <a
          class="text-[12px] text-[rgb(64,158,255)]"
          target="_blank"
          href="https://st.music.163.com/official-terms/children"
          :underline="false"
          >《儿童隐私条款》</a
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.phone-form {
  transform: translateY(-35px);
}
.phone-form-el {
  padding: 0 20px;
}

// 输入框前缀文本大小
:deep(.phone-form-el) {
  .el-input-group--prepend
    .el-input-group__prepend
    .el-select
    .el-input
    .el-input__inner {
    font-size: 10px;
  }
}

// 邮箱登录
.email-login {
  & > div {
    border-radius: 50%;
    background-color: rgb(237, 70, 47);
  }
}

// 条款下面的所有a标签
.clause {
  a:hover {
    color: rgb(64, 158, 255);
  }
}
</style>
