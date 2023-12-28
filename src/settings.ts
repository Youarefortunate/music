export type TransitionType = 'fade' | 'fade-slide' | 'fade-scale' | 'fade-rotate';

/**
 * 系统设置
 */
interface DefaultSettings {
  /**
   * 系统标题
   */
  title: string;
  /**
   * 是否显示设置
   */
  showSettings: boolean;
  /**
   * 是否显示多标签页导航
   */
  tagsView: boolean;
  /**
   * 是否固定头部navbar
   */
  fixedHeader: boolean;
  /**
   * 是否显示侧边栏logo
   */
  sidebarLogo: boolean;
  /**
   * 导航栏布局(let | top | mix: 混合)
   */
  layout: string;
  /**
   * 主题模式
   */
  theme: string;
  /**
   * 布局大小
   */
  size: string;
  /**
   * 语言( zh-cn| en)
   */
  language: string;
  /**
   * 主题颜色
  */
  themeColor: string;
  /**
   * 字体加粗
  */
  fontBold: boolean,
  /**
   * 页面切换动画
  */
  transitionType: TransitionType;
}

const defaultSettings: DefaultSettings = {
  title: "Netease Clound Music",
  showSettings: true,
  tagsView: true,
  fixedHeader: true,
  sidebarLogo: true,
  layout: "left",
  theme: "light",
  size: "default",
  language: "zh-cn",
  themeColor: "#f5222d",
  fontBold: true,
  transitionType: "fade-slide"
};

export default defaultSettings;
