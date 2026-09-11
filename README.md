# MIKU NOTE · 初音未来主题交互博客

一个以初音未来为主题的创意交互博客网页。**零构建**，无本地框架依赖（3D 模型渲染经 CDN 引入 three.js + @pixiv/three-vrm），所有特效（音乐、粒子、弹幕）均由浏览器实时生成。

## 快速开始

**方式一：直接打开**
双击 `index.html` 即可（建议用 Chrome / Edge）。

**方式二：本地服务器（推荐，体验完整）**
```bash
node server.js          # 默认端口 3939
# 然后访问 http://127.0.0.1:3939/
```

## 创意交互一览

| 交互 | 说明 |
| --- | --- |
| 🎹 合成音乐引擎 | Web Audio API 实时合成 3 首原创电子曲（治愈系 / 电子舞曲 / 八位机），带频谱可视化，无任何音频文件 |
| 💬 弹幕墙 | hero 区自动飘弹幕，可发送自己的弹幕，localStorage 持久化 |
| ✨ 粒子星空 | 青色星尘 + 星座连线，鼠标可拨动；Snow 主题下变为雪花 |
| 🖱 3D 卡片 | 博客卡片随光标倾斜 + 光斑跟随 |
| 🎀 3D 模型 | hero 区初音由 SVG 插画升级为可交互 VRM 3D 模型：闲置呼吸动画 + 光标视线跟随；无 JS/无网络时自动回退到 SVG |
| ❄ 双主题 | 「Miku 经典暗色」↔「Snow Miku 冰雪白昼」一键切换 |
| 🥬 Konami 彩蛋 | 输入 ↑↑↓↓←→←→BA：全屏彩虹 + 满屏葱 + 弹幕风暴 |
| ✍️ 留言板 | 本地持久化留言，头像由名字+颜色实时绘制 |
| ⌨️ 快捷键 | `M` 播放/暂停 · `T` 切换主题 · `Esc` 关闭弹窗 |
| 📊 更多 | 打字机字幕、数字滚动、滚动进度条、阅读进度、图库灯箱、时间线 |

## 文件结构

```
index.html          页面结构（含手绘 SVG 初音插画）
css/style.css       全部样式（双主题 CSS 变量）
js/data.js          文章/时间线/图库/署名数据
js/audio-engine.js  Web Audio 合成音乐引擎 + 可视化
js/effects.js       粒子/雪花/光标/进度条
js/danmaku.js       弹幕引擎
js/main.js          渲染与交互总装
js/vrm-miku.js      VRM 3D 初音（three.js + @pixiv/three-vrm，CDN ESM）
assets/model/       VRM 模型文件（miku.vrm）
server.js           零依赖静态预览服务器
assets/img/         10 张 CC 许可图片（本地缓存）
```

## 图片版权

图片来自 Flickr 的 CC 授权摄影作品（经 Openverse 检索），作者与许可详见页面「关于」板块：
CC BY / CC BY-SA / CC BY-NC / CC0（pasukaru76、animaster、Danny Choo、danzE26、Corsica_JP、SemiOtaku Studio 等）。

「初音未来 HATSUNE MIKU」为 Crypton Future Media 的注册商标与角色形象，本项目为粉丝同人学习作品，与官方无关。

## VRM 3D 模型

hero 区的 3D 初音由 `three.js` + `@pixiv/three-vrm`（经 jsDelivr esm.sh CDN 的 ESM import map 引入，固定版本，无需构建）实时渲染。

- 模型文件：`assets/model/miku.vrm`（Tda式初音ミクV4X，粉丝同人转换作品）
- 动画：自然待机姿势（双臂下垂）+ 呼吸/轻摆 + 光标视线/头部跟随；Snow 主题自动切换光色
- 回退：无 WebGL、断网或模型加载失败时自动隐藏 3D，显示原有 SVG 插画
- 版权：模型为粉丝同人作品，许可信息与原始出处见 `assets/model/README.md`（使用前请核验原作者授权条款）
