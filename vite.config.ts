import { ConfigEnv, UserConfig, loadEnv, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// 定义组件名称
import DefineOptions from "unplugin-vue-define-options/vite";
import path from "path";

// Element Plus按需导入
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

// 自动导入规则配置
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from 'unplugin-element-plus/vite'


// 使用本地svg
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

import UnoCSS from "unocss/vite";

// 获取当前文件的绝对路径
const pathSrc = path.resolve(__dirname, "src");

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // 获取环境变量env
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd());

  return {
    // 配置路径别名
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      // css预处理器配置
      preprocessorOptions: {
        // 定义全局scss变量
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
    server: {
      // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址
      host: "0.0.0.0",
      port: Number(env.VITE_APP_PORT),
      // 是否自动打开浏览器
      open: true,
      proxy: {
        // 反向代理解决跨域
        // env.VITE_APP_BASE_API：本地地址
        [env.VITE_APP_BASE_API]: {
          // env.VITE_APP_TARGET_URL：请求地址，到时候会将本地地址替换成请求地址
          target: env.VITE_APP_TARGET_URL,
          // 为true时会将请求头地址改为target地址
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(
              new RegExp("^" + env.VITE_APP_BASE_API),
              env.VITE_APP_TARGET_BASE_URL
            ), // 替换 /dev-api 为 target 接口地址
        },
      },
    },
    plugins: [
      // 需要加载该插件来解析.vue单文件组件
      vue(),
      UnoCSS({
        // 手动指定unocss.config.ts配置文件位置
        configFile: './unocss.config.ts'
      }),
      DefineOptions(),
      // 使用unplugin-element-plus对使用到的组件样式进行按需导入
      ElementPlus({}),
      AutoImport({
        resolvers: [
          // 自动导入Element Plus相关函数，例如：ElMesage，ElMessageBox...(带样式)
          ElementPlusResolver(),
          // 自动导入 Element Plus 图标组件
          IconsResolver({}),
        ],
        vueTemplate: true, // 是否在vue模板中自动导入
        // 自动导入vue的组合式api函数，如：ref、reactive、toRefs等
        imports: ["vue", "@vueuse/core"],
        // eslint配置
        eslintrc: {
          // 是否自动生成eslint规则，建议生成之后设置为false
          enabled: false,
          // 指定自动导入函数eslint规则的文件
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },

        /**
         * 添加和引用新的组件再放开注释，生辰之后再设置为false关闭自动生成，避免重复生成引起冲突
         */
        // 配置文件位置(false:关闭自动生成)
        // dts: false,
        // 指定自动导入 函数 Ts类型声明文件路径，默认根目录
        dts: path.resolve(pathSrc, "types", "auto-imports.d.ts"),
      }),
      Components({
        resolvers: [
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
          // 自动注册 Element Plus 图标组件
          IconsResolver({
            enabledCollections: ["ep"], // element-plus图标库
          }),
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/**/components"],
        // 配置文件位置(false:关闭自动生成)
        // dts: false,
        // dts: "src/types/components.d.ts",
        // 指定自动导入 组件 TS类型声明文件路径
        dts: path.resolve(pathSrc, "types", "components.d.ts"),
      }),
      Icons({
        // 自动安装图标库
        autoInstall: true,
      }),
      // 配置svg使用规则(本地svg)
      createSvgIconsPlugin({
        // 指定本地svg图标的文件夹路径
        iconDirs: [path.resolve(pathSrc, "assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
    ],
    // 预加载项目必需的组件
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "axios",
        "element-plus/es/components/form/style/css",
        "element-plus/es/components/form-item/style/css",
        "element-plus/es/components/button/style/css",
        "element-plus/es/components/input/style/css",
        "element-plus/es/components/input-number/style/css",
        "element-plus/es/components/switch/style/css",
        "element-plus/es/components/upload/style/css",
        "element-plus/es/components/menu/style/css",
        "element-plus/es/components/col/style/css",
        "element-plus/es/components/icon/style/css",
        "element-plus/es/components/row/style/css",
        "element-plus/es/components/tag/style/css",
        "element-plus/es/components/dialog/style/css",
        "element-plus/es/components/loading/style/css",
        "element-plus/es/components/radio/style/css",
        "element-plus/es/components/radio-group/style/css",
        "element-plus/es/components/popover/style/css",
        "element-plus/es/components/scrollbar/style/css",
        "element-plus/es/components/tooltip/style/css",
        "element-plus/es/components/dropdown/style/css",
        "element-plus/es/components/dropdown-menu/style/css",
        "element-plus/es/components/dropdown-item/style/css",
        "element-plus/es/components/sub-menu/style/css",
        "element-plus/es/components/menu-item/style/css",
        "element-plus/es/components/divider/style/css",
        "element-plus/es/components/card/style/css",
        "element-plus/es/components/link/style/css",
        "element-plus/es/components/breadcrumb/style/css",
        "element-plus/es/components/breadcrumb-item/style/css",
        "element-plus/es/components/table/style/css",
        "element-plus/es/components/tree-select/style/css",
        "element-plus/es/components/table-column/style/css",
        "element-plus/es/components/select/style/css",
        "element-plus/es/components/option/style/css",
        "element-plus/es/components/pagination/style/css",
        "element-plus/es/components/tree/style/css",
        "element-plus/es/components/alert/style/css",
        "element-plus/es/components/radio-button/style/css",
        "element-plus/es/components/checkbox-group/style/css",
        "element-plus/es/components/checkbox/style/css",
        "element-plus/es/components/tabs/style/css",
        "element-plus/es/components/tab-pane/style/css",
        "element-plus/es/components/rate/style/css",
        "element-plus/es/components/date-picker/style/css",
        "element-plus/es/components/notification/style/css",
        "@vueuse/core",
        "path-to-regexp",
      ],
    },
    // 构建
    build: {
      // 每次运行时，Vite 都会检查 vite.config.ts 文件的修改时间，并将该时间戳添加到文件名中。
      // 这有助于在文件名中记录 Vite 的构建时间，以便在构建失败时进行调试。如果你希望在构建过程中禁用此功能，timestap: false,即可
      // timestap: false,
      chunkSizeWarningLimit: 2000, // 消除打包大小超过500kb警告
      minify: "terser", // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      terserOptions: {
        compress: {
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          drop_console: true, // 生产环境去除 console
          drop_debugger: true, // 生产环境去除 debugger
        },
        format: {
          comments: false, // 删除注释
        },
      },
      rollupOptions: {
        // 增加后既正常
        treeshake: false,
      }
    },
  };
});
