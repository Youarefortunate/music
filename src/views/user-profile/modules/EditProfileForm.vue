<script setup lang="ts">
import { nextTick, toRaw } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { storeToRefs } from "pinia";
import { formatDate } from "@/utils";
import _ from "lodash";
import { province, city, specialCity } from "@/staticData/userProfile/data";
import * as UserInfoApi from "@/api/userInfo";
import { UserInfoParams } from "@/api/userInfo/type";

interface ProfileFormData {
  nickname?: string;
  signature?: string;
  gender?: string | number;
  birthday?: string;
  city?: number | string;
  province?: number | string;
}

const emits = defineEmits(['handleFinish'])
// 用户store
const userStore = useUserStore();
const { profile } = storeToRefs(userStore);
// dialog是否可见
const visible = ref<boolean>(false);
// 用户头像
const avatarUrl = ref<string>("");
// 用户头像错误提示
const avatarErrMsg = ref<string>("");
// 城市数据
const cascaderVal = ref<any>([]);
// 级联选择器数据
let cityOption = [] as Array<any>;
const props = {
  expandTrigger: "click" as const,
  value: "code",
  label: "name",
};
// 表单ref
const profileFormRef = ref<FormInstance>();
// 表单数据
const form = reactive<ProfileFormData>({
  nickname: "",
  signature: "",
  // 用户性别, 1: 男、2：女
  gender: 1,
  birthday: "",
  city: "",
  province: "",
});
// 表单校验规则
const rules = reactive<FormRules<ProfileFormData>>({
  nickname: [{ required: true, message: "请输入你的昵称", trigger: "blur" }],
  birthday: [
    {
      type: "date",
      required: true,
      message: "请选择你的出生日期",
      trigger: "change",
    },
  ],
  province: [
    { required: true, message: "请选择你当前所在城市", trigger: "change" },
  ],
});

const btn = reactive({
  // 按钮加载
  loading: false,
  // 按钮是否禁用,默认禁用
  disabled: false,
});

onMounted(() => {
  Object.freeze(city);
  Object.freeze(province);
  Object.freeze(specialCity);
})

// 监听图片删除
watch(avatarUrl, (newVal) => {
  if (!newVal) {
    avatarErrMsg.value = "请选择头像";
  }
});
// 显示弹窗
async function show(show: boolean) {
  visible.value = show;
  // 设置默认值
  setFieldsValue();
  // 如果已经存在格式化好了的数据，则不需要再去格式化
  if (!cityOption.length) {
    // 格式化级联选择器数据
    const result = await formatCascaderOption();
    // 合并数据
    const option = specialCity.concat(result);
    // 设置级联选择器数据
    cityOption = option;
  }
}

/**
 * 格式化级联选择器数据
 */
function formatCascaderOption() {
  return new Promise<any>((resolve) => {
    province.forEach((p) => {
      p.children = [];
      city.forEach((c) => {
        // 当前循环到的城市属于当前省份
        if (c.province == p.province) {
          p["children"].push(c);
        }
      });
    });
    resolve(province);
  });
}

// 设置表单默认值
function setFieldsValue() {
  nextTick(() => {
    form.gender = profile.value.gender;
    form.birthday = formatDate(profile.value.birthday, "YYYY-MM-DD");
    form.nickname = profile.value.nickname;
    form.signature = profile.value.signature;
    avatarUrl.value = profile.value.avatarUrl;
    // 当前所在城市
    cascaderVal.value = [
      profile.value.province.toString(),
      profile.value.city.toString(),
    ];

    form.province = cascaderVal.value[0];
    form.city = cascaderVal.value[1];
  });
}

// 上传头像成功回调
function uploadAvatarSuccess() {
  console.log("上传头像成功回调");
  // 头像上传成功，解除按钮禁用
  btn.disabled = false;
}

// 级联选择器发生改变
const handleCascaderChange = (value: any) => {
  console.log("级联选择器发生改变==>", toRaw(value));
  const val = toRaw(value);
  if (!val) {
    form.province = "";
    form.city = "";
    return;
  }
  // 特殊城市，直辖市或者特别行政区
  if (val[0] == 0 || val[0] == 1) {
    const isDirectAreaOrSpecial = specialCity.filter((s) => s.code == val[0]);
    const c = isDirectAreaOrSpecial[0].children.filter((c) => c.code == val[1]);
    form.city = c[0].city.toString();
    // form.province = c[0].code.toString();
    form.province = val[1].toString();
  }
};

// 提交表单
const handleSubmit = () => {
  const birthday = _.now(form.birthday);
  const formData = Object.assign(form, { birthday });
  // 表单校验
  profileFormRef.value!.validate((valid: boolean) => {
    if (!valid) return;
    // 所有验证通过
    // 开始网络请求，按钮加载，再次禁用确认按钮，直到请求成功或者请求失败
    btn.disabled = true;
    btn.loading = true;
    console.log("提交表单==>", formData);
    UserInfoApi.updateUserInfo({ ...(formData as UserInfoParams) })
      .then((res) => {
        const { code } = res.data;
        if (code == 200) {
          ElMessage.success("更新用户信息成功");
          // 更新用户信息成功，关闭弹窗
          visible.value = false;
          // 通知父组件更新用户信息完成
          emits("handleFinish");
          console.log("更新用户信息成功==>", res);
        }
      })
      .catch((err) => {
        ElMessage.error(err.message);
        console.log("更新用户信息失败==>", err);
      })
      .finally(() => {
        // 无论是否成功，按钮恢复可用，再次启用确认按钮
        btn.disabled = false;
        btn.loading = false;
      });
  });
};

// 取消
const handleCancel = () => {
  visible.value = false;
  // 重置表单项
  resetForm(profileFormRef.value);
};

// 关闭弹窗
const handleClose = (done: () => void) => {
  visible.value = false;
  // 重置表单项
  resetForm(profileFormRef.value);
  done();
};
// 选择出生日期
function birthdayChange(val: string) {
  console.log(val);
}

// 重置表单项
function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return;
  formEl.resetFields();
  cascaderVal.value = [];
}

// 导出组件内部方法，提供给ref使用
defineExpose({
  show,
});

defineOptions({
  name: "EditProfileForm",
});
</script>

<template>
  <div class="edit-profile">
    <el-dialog
      top="8vh"
      class="custom-dialog"
      v-model="visible"
      title="编辑个人信息"
      width="610"
      destroy-on-close
      :close-on-click-modal="false"
      :before-close="handleClose"
    >
      <!-- 用户表单 -->
      <el-form
        ref="profileFormRef"
        :model="form"
        :rules="rules"
        label-width="120"
        class="profile-form"
      >
        <el-form-item label="性别：" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
          <div class="form-item-help">
            <p>选择你的性别</p>
          </div>
        </el-form-item>

        <el-form-item label="昵称：" prop="nickname">
          <el-input
            v-model="form.nickname"
            autocomplete="off"
            placeholder="请输入昵称"
            clearable
          />
          <div class="form-item-help">
            <p>你在网易云的账号昵称</p>
          </div>
        </el-form-item>

        <el-form-item label="出生日期：" prop="birthday">
          <el-date-picker
            style="width: 100%"
            v-model="form.birthday"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择你的出生日期"
            clearable
            @change="birthdayChange"
          />
          <div class="form-item-help">
            <p>可以选择你的出生日期</p>
          </div>
        </el-form-item>

        <el-form-item label="当前所在省份：" prop="province">
          <el-cascader
            :props="props"
            style="width: 100%"
            clearable
            v-model="cascaderVal"
            :options="cityOption"
            @change="handleCascaderChange"
            placeholder="请选择你当前所在城市"
          />
          <div class="form-item-help">
            <p>选择你现在所在的省份</p>
          </div>
        </el-form-item>

        <el-form-item label="头像：" prop="avatarUrl" :error="avatarErrMsg">
          <SelectImage
            ref="SelectImage"
            v-model="avatarUrl"
            @onSuccess="uploadAvatarSuccess"
          />
          <div class="form-item-help">
            <p>选择新的头像点击确定之后立马更新头像</p>
          </div>
        </el-form-item>

        <el-form-item label="个人介绍：" prop="signature">
          <el-input
            v-model="form.signature"
            :autosize="{ minRows: 3, maxRows: 5 }"
            type="textarea"
            placeholder="请输入个人介绍"
            maxlength="300"
            show-word-limit
          />
          <div class="form-item-help">
            <p>关于自己的个人介绍</p>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="btn.loading"
            :disabled="btn.disabled"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
// 表单穿透
:deep(.profile-form) {
  .el-form-item__content {
    display: block;
  }
}
</style>
