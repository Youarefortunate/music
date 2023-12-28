<script setup lang="ts">
import { data } from "./data";
import { Close } from "@element-plus/icons-vue";

// 表情包icon dom
// const emojiDom = ref<Element | null>(null);

// emoji是否可见
const visible = ref(false);
const emojis = data.split(",");
const emits = defineEmits(["chooseEmojiDefault"]);

function chooseEmojiDefault(emoji: string) {
  emits("chooseEmojiDefault", emoji);
}

// 禁用页面滚动
watch(visible, (newVal) => {
  if(newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
})


// 设置位置
function setPosition(dom: Element | null) {
  // 获取视口大小
  // const viewportWidth =
  //   window.innerWidth || document.documentElement.clientWidth;
  // const viewportHeight =
  //   window.innerHeight || document.documentElement.clientHeight;
  const location = dom?.getBoundingClientRect();
  // 计算相对于视口的坐标
  const top = location!.top + 25;  // 20为icon的高度
  const left = location!.left;
  const emojiContainer = document.getElementById("emoji-continer");
  emojiContainer!.style.position = 'fixed'
  emojiContainer!.style.top = `${top}` + "px";
  emojiContainer!.style.left = `${left}` + "px";
}

// 显示emoji
function show(show: boolean) {
  visible.value = show;
}
// 关闭emoji
function handleCloseEmoji() {
  visible.value = false;
}

// 点击emoji遮罩
function handleClickMaskEmoji() {
  visible.value = false;
}

defineExpose({
  show,
  setPosition,
  handleCloseEmoji,
});

defineOptions({
  name: "Emoji",
});
</script>

<template>
  <div id="emoji-continer" :class="{ hidden: !visible }">
    <ul class="emoji-default">
      <li
        v-for="(item, index) in emojis"
        :key="index"
        @click.stop="chooseEmojiDefault(item)"
      >
        {{ item }}
      </li>
    </ul>
    <div class="close-icon cursor-pointer" @click="handleCloseEmoji">
      <el-icon><Close /></el-icon>
    </div>
  </div>

  <div
    class="mask"
    style="{ overflow: !visible ? 'scroll' : 'hidden' }"
    v-if="visible"
    @click.stop="handleClickMaskEmoji"
  ></div>
</template>

<style lang="scss" scoped>
.mask {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  z-index: 2003;
  overflow: hidden;
  // background-color: rgba(209, 207, 207, 0.4);
}
// 纵向滚动条
@mixin scroll-bar($width: 10px) {
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: #ffffff;
  }
  &::-webkit-scrollbar {
    width: $width;
    height: 10px;
    background-color: #ffffff;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

#emoji-continer {
  position: relative;
  z-index: 2004;
  text-align: left;
  width: 40%;
  // height: 100%;
  background: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);

  .emoji-default {
    height: 202px;
    -ms-overflow-style: none;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: scroll;
    @include scroll-bar(10px);
    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }

    li {
      display: inline-block;
      font-size: 20px;
      width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 30px;
      overflow: hidden;
      cursor: pointer;
      text-align: center;
    }

    li:hover {
      background-color: #d5d5d5;
    }
  }

  // 关闭icon
  .close-icon {
    position: absolute;
    right: 11px;
    top: 4px;
    font-size: 25px;
    color: #727171;
    &:hover {
      color: #000;
    }
  }
}
</style>
