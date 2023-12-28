import i18n from "@/lang/index";

export function translateRouteTitleI18n(title: any) {
  // 国际化全局函数te()：判断是否存在国际化配置，没有则直接返回
  const hasKey = i18n.global.te("route." + title);
  
  if (hasKey) {
    return i18n.global.t("route." + title);
  }
  return title;
}
