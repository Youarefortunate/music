<script setup lang="ts">
import _ from "lodash";
import { ElMessage } from "element-plus";
import type {
  UploadRawFile,
  UploadRequestOptions,
  UploadInstance,
  UploadFile,
} from "element-plus";
import * as UserInfoApi from "@/api/userInfo";

// el-upload实例
const uploadRef = ref<UploadInstance>();
// 加载
const loading = ref<boolean>(false);
// 允许上传的文件类型
const accept = ref<string>("image/jpeg,image/png,image/gif,image/webp");
// 上传文件大小限制
const uploadSizeLimit = ref<number>(3);
// 本地临时上传图片
const temporaryImg = ref("");

const props = defineProps({
  // 限制文件上传个数
  limit: {
    type: Number,
    default: 1,
  },
  // 默认显示的文件
  defaultList: {
    type: Array,
    default: () => [],
  },
  // 元素的尺寸(宽)
  width: {
    type: Number,
    default: 80,
  },
  // 是否为自动上传
  autoUpload: {
    type: Boolean,
    default: true,
  },
  // 上传的文件字段名
  fileName: {
    type: String,
    default: "imgFile",
  },
  modelValue: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:modelValue", 'onSuccess']);
// 上传成功的图片url(组件v-model绑定值)
const imageUrl = useVModel(props, "modelValue", emits);

/**
 * 限制用户上传文件的格式和大小
 */
function beforeUpload(file: UploadRawFile) {
  console.log("图片上传之前触发==>", file);
  // 验证上传的文件大小
  const fileSizeMb = file.size / 1024 / 1024;
  // 上传大小限制2M
  if (fileSizeMb > uploadSizeLimit.value) {
    // 显示错误提示
    ElMessage.error(`上传文件大小不能超出${uploadSizeLimit.value}MB`);
    return false;
  }
  return true;
}

// 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
function onChange(uploadFile: UploadFile) {
  console.log(
    "文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用==>",
    uploadFile
  );
  // 保存临时图片文件
  temporaryImg.value = uploadFile.url as string;
}

// 删除图片
const handleDeleteItem = () => {
  imageUrl.value = "";
  // 清空已上传的文件列表
  clearFiles();
};

// 自定义请求上传
const onUpload = async (options: UploadRequestOptions): Promise<any> => {
  console.log("自定义请求上传==>", options);
  // 构建上传参数
  const formData = new FormData();
  // 设置上传的文件name
  formData.append(props.fileName, options.file);
  
  try {
    // 开始加载
    loading.value = true;
    // 开始上传
    UserInfoApi.updateAvatar(formData)
      .then((res) => {
        console.log("上传成功==>", res.data.data);
        const { data: result } = res.data;
        // 更新图片url
        imageUrl.value = result.url;
        // 通知父组件
        emits('onSuccess')
      })
      .catch((err) => {
        console.error("用户头像上传失败catch==>", err);
        ElMessage.error(err.message);
        // 上传失败，重置状态
        clearFiles();
        loading.value = false;
      })
      .finally(() => (loading.value = false));
  } catch (error: any) {
    console.error("用户头像上传失败==>", error);
    // 上传失败，重置状态
    clearFiles();
    loading.value = false;
  }
};

/**
 * 清空已上传的文件列表（该方法不支持在 before-upload 中调用）
 */
function clearFiles() {
  // 删除临时图片
  temporaryImg.value = "";
  // 清空文件
  uploadRef.value!.clearFiles();
}

defineExpose({
  clearFiles,
});

defineOptions({
  name: "SelectImage",
});
</script>

<template>
  <div class="select-image flex items-center flex-wrap">
    <!-- 显示图片 -->
    <div
      v-if="imageUrl"
      class="file-item"
      :style="{ width: `${width}px`, height: `${width}px` }"
    >
      <a :href="imageUrl" target="_blank" title="点击查看图片">
        <img
          class="img-cover"
          style="width: 100%; height: 100%"
          :src="imageUrl"
          fit="scale-down"
        />
      </a>
      <i-ep-CircleCloseFilled class="el-icon-error" @click="handleDeleteItem" />
    </div>

    <!-- 显示上传 -->
    <div v-show="!imageUrl" class="upload-image">
      <el-upload
        ref="uploadRef"
        :name="fileName"
        list-type="picture-card"
        with-credentials
        action="#"
        :headers="{ 'Content-Type': 'multipart/form-data' }"
        :disabled="loading"
        :limit="limit"
        :auto-upload="autoUpload"
        :show-file-list="true"
        :accept="accept"
        :before-upload="beforeUpload"
        :http-request="onUpload"
        :on-change="onChange"
      >
        <div
          v-loading="loading"
          class="selector"
          :class="{ disabled: loading, selected: !loading }"
          :style="{ width: `${width}px`, height: `${width}px` }"
          title="点击选择图片"
        >
          <!-- 临时本地图片，即将要上传的图片 -->
          <img
            v-if="temporaryImg"
            class="img-cover"
            style="width: 100%; height: 100%"
            :src="temporaryImg"
            fit="scale-down"
          />
          <i-ep-Plus
            class="el-icon-plus"
            :style="{ fontSize: `${width * 0.4}px` }"
          />
        </div>
      </el-upload>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 文件元素
.file-item {
  position: relative;
  width: 80px;
  height: 80px;
  padding: 2px;
  border: 1px solid #ddd;
  background: #fff;
  margin-right: 7px;

  .img-cover {
    display: block;
    background: no-repeat center center / 100%;
  }

  &:hover {
    .el-icon-error {
      display: block;
    }
  }

  .el-icon-error {
    display: none;
    position: absolute;
    top: -6px;
    right: -6px;
    cursor: pointer;
    font-size: 16px;
    color: #c5c5c5;

    &:hover {
      color: #7d7d7d;
    }
  }

  &:hover {
    border: 1px solid #a7c3de;
  }
}

// 选择器
.selector {
  width: 80px;
  height: 80px;
  float: left;
  border: 1px dashed #e2e2e2;
  text-align: center;
  color: #dad9d9;
  display: flex;
  justify-content: center;
  align-items: center;

  .el-icon-plus {
    font-size: 32px;
  }
}

.selected {
  cursor: pointer;

  &:hover {
    border: 1px dashed var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

// 正在上传时禁止继续上传
.disabled {
  cursor: default;

  &:hover {
    border: 1px dashed #e2e2e2;
    color: none;
  }
}

// 上传图片样式穿透
:deep(.upload-image) {
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    background-color: rgba(239, 240, 245);
    border: none;
    line-height: 0;
  }

  // 隐藏picture-card图片列表
  .el-upload-list--picture-card .el-upload-list__item {
    display: none;
  }
}
</style>
