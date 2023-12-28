<p align="center">
    <img src="https://img.shields.io/badge/Vue-3.3.4-brightgreen.svg"/>
    <img src="https://img.shields.io/badge/Vite-4.5.1-green.svg"/>
    <img src="https://img.shields.io/badge/Element Plus-2.3.12-blue.svg"/>
    <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
    <a href="https://gitee.com/youarefortunate" target="_blank">
        <img src="https://img.shields.io/badge/Author-Youarefortunate-orange.svg"/>
    </a>
</p>


## 项目介绍

本项目包含 Vue3 + Vite4+ TypeScript5 + Element-Plus + Pinia 等最新主流技术栈构建的网易云音乐项目，除此之外，项目使用的接口是网易云NodeApi来进行请求并获取到数据

项目实现功能：

- 四种登录方式：
  - 扫码登录
  - 账号密码登录
  - 手机验证码登录
  - 网易邮箱登录
- 个人信息主页：用户个人信息、用户创建的歌单、用户收藏的歌单、编辑用户个人信息
- 歌单详情页：歌单信息、歌单音乐列表、歌单评论列表、歌单收藏者
- 视频：包含视频、MV两大模块
- 私人FM、最近播放列表、我喜欢的音乐列表（登录之后才会显示）
- 搜索：搜索歌曲、歌手、专辑、歌单
- 歌曲详情页：歌词滚动、歌曲评论列表、为歌曲评论点赞、发送评论、回复评论、删除评论（只能删除自己的评论）
- 音乐功能：歌曲上下切换、歌曲播放模式（随机、列表、单曲循环）、音量调节、显示当前播放列表、双击播放歌曲、鼠标右键歌曲列表播放音乐、查看评论、添加该歌曲为下一首播放等等
- 项目设置：暗夜模式、主题颜色切换等

## 项目预览

- **在线预览**：[预览地址](http://43.139.205.178:9527/)

- **首页**

  ![首页](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/home.png)

- **MV**

  ![MV](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/mv.png)

- **个人信息主页**

  ![个人主页](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/user-profile.png)

- **歌单详情页**

  ![歌单详情页](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/songlist-detail.png)

- **歌曲详情页**

  ![歌曲详情页](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/music-detail.png)

- **暗夜模式**

  |![个人信息主页-暗夜模式](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/user-profile-dark.png) | ![歌曲详情页-暗夜模式](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/music-detail-dark.png) |
  | ------------------------------------------------------ | ------------------------------------------------------ |
  | ![搜索音乐-暗夜模式](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/search-music-dark.png) | ![排行榜-暗夜模式](https://gitee.com/youarefortunate/music_readme_preview_img/raw/master/ranking-dark.png)

## 项目地址

| 项目 | Gitee                                                        | Github                                                       |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | 
| 前端 | [music-gitee](https://gitee.com/youarefortunate/music) | [music-github](https://github.com/Youarefortunate/music) |  |
| 后端 | [网易云NodeApi-Gitee](https://gitee.com/long-wenwu-bala/netease-cloud-music-api.git)       | [网易云NodeApi-GitHub](https://github.com/w4ctech/NeteaseCloudMusicApi.git) |

## 环境准备

| 环境                 | 名称版本                                                     | 备注                                                         |
| -------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| **开发工具**         | VSCode                                                       | [下载地址](https://code.visualstudio.com/Download)           |
| **运行环境**         | Node 18+                                                     | [下载地址](http://nodejs.cn/download)                        |
| **VSCode插件(必装)** | 1. `Vue Language Features (Volar) ` <br/> 2. `TypeScript Vue Plugin (Volar) `  <br/>3. 禁用 Vetur | ![vscode-plugin](https://foruda.gitee.com/images/1687755823108948048/d0198b2d_716974.png) |

## 项目启动

```bash
# 克隆项目
git clone https://gitee.com/youarefortunate/music.git

# 进入项目目录
cd music

# 安装依赖
npm install

# 启动项目
npm run dev

# 项目打包
npm run build
```

## 网易云NodeApi接口文档

- [网易云NodeApi接口文档](https://binaryify.github.io/NeteaseCloudMusicApi/#/)

## 环境要求

需要 NodeJS 14+ 环境

## 安装

```shell
$ git clone git@github.com:Binaryify/NeteaseCloudMusicApi.git
$ cd NeteaseCloudMusicApi
$ npm install
```

或者

```shell
$ git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git
$ cd NeteaseCloudMusicApi
$ npm install
```

## 运行

```shell
$ node app.js
```
