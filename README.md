# MIKU NOTE · 初音未来主题交互博客

一个以初音未来为主题的创意交互博客网页。**零构建**，无本地框架依赖（3D 部分经 CDN 引入 three.js + @pixiv/three-vrm），所有特效（音乐、粒子、弹幕）均由浏览器实时生成。

---

## ⚠️ 先说清楚：本仓库不包含 3D 模型文件

hero 区那个可交互的 3D 初音依赖 `assets/model/miku.vrm`，**这个文件不在仓库里**，原因有两个：

1. **体积**：单个文件约 43 MB，不适合放进 Git 历史；
2. **授权**：它是粉丝同人转换作品（Tda 式初音ミク V4X），**再分发授权需由使用者自行核验**，因此不随本仓库分发。

**所以你克隆下来直接打开会是什么样？**
hero 区**自动回退成手绘 SVG 初音插画**（这是项目内置的降级行为，不是坏掉了）。除 3D 模型外，音乐合成、粒子星空、弹幕墙、双主题、留言板等**全部功能照常工作**。

**想看到 3D 效果**，把模型文件放到 `assets/model/miku.vrm` 即可，无需改任何代码：

```
assets/model/miku.vrm     ← 自行获取后放到这里，刷新页面生效
assets/model/README.md    ← 模型的出处、许可与核验提示
```

---

## 快速开始

**方式一：直接打开**
双击 `index.html` 即可（建议用 Chrome / Edge）。

**方式二：本地服务器（推荐，体验完整）**
```bash
node server.js          # 默认端口 3939
# 然后访问 http://127.0.0.1:3939/
```
Windows 下也可以直接双击 `start.bat`：它会检查 Node、启动服务器，并在 2 秒后自动打开浏览器（`start.bat 4000` 可指定端口）。

## 创意交互一览

| 交互 | 说明 |
| --- | --- |
| 🎹 合成音乐引擎 | Web Audio API 实时合成 3 首原创电子曲（治愈系 / 电子舞曲 / 八位机），带频谱可视化，无任何音频文件 |
| 💬 弹幕墙 | hero 区自动飘弹幕，可发送自己的弹幕，localStorage 持久化 |
| ✨ 粒子星空 | 青色星尘 + 星座连线，鼠标可拨动；Snow 主题下变为雪花 |
| 🖱 3D 卡片 | 博客卡片随光标倾斜 + 光斑跟随 |
| 🎀 3D 模型 | hero 区初音由 SVG 插画升级为可交互 VRM 3D 模型：闲置呼吸动画 + 光标视线跟随；**模型需自备（见上）**，无 WebGL / 断网 / 模型缺失时自动回退到 SVG |
| ❄ 双主题 | 「Miku 经典暗色」↔「Snow Miku 冰雪白昼」一键切换 |
| 🥬 Konami 彩蛋 | 输入 ↑↑↓↓←→←→BA：全屏彩虹 + 满屏葱 + 弹幕风暴 |
| ✍️ 留言板 | 本地持久化留言，头像由名字+颜色实时绘制 |
| ⌨️ 快捷键 | `M` 播放/暂停 · `T` 切换主题 · `Esc` 关闭弹窗 |
| 📊 更多 | 打字机字幕、数字滚动、滚动进度条、阅读进度、图库灯箱、时间线 |

## 文件结构

```
index.html            页面结构（含手绘 SVG 初音插画，3D 不可用时的回退视图）
start.bat             Windows 一键启动（校验 Node → 起服务 → 开浏览器）
server.js             零依赖静态预览服务器（仅用 node 内置 http/fs/path）
css/style.css         全部样式（双主题 CSS 变量）
js/data.js            文章 / 时间线 / 图库 / 署名数据
js/audio-engine.js    Web Audio 合成音乐引擎 + 频谱可视化
js/effects.js         粒子 / 雪花 / 光标 / 进度条
js/danmaku.js         弹幕引擎（localStorage 持久化）
js/main.js            渲染与交互总装
js/vrm-miku.js        VRM 3D 初音（three.js + @pixiv/three-vrm，CDN ESM）
assets/img/           10 张 CC 授权图片（本地缓存）
assets/model/         VRM 模型目录 —— README.md 在仓库里，miku.vrm 需自备
docs/architecture.html      本项目运行架构图（可交互 HTML，明暗主题 / 缩放 / 导出）
docs/archify/…json          该图的生成规格（改它可重新出图）
```

## 架构图

`docs/architecture.html` 是用 [archify](https://github.com/tt-a1i/archify) 生成的**单文件可交互架构图**：本地预览服务 → 浏览器 → 页面骨架 → 交互总装的主链路，以及音乐 / 特效 / 弹幕 / VRM 四个模块、静态资源、localStorage、外部 CDN 的关系。双击即可打开，支持明暗主题、缩放平移、搜索、关系追踪与 PNG/SVG 导出。

生成规格在 `docs/archify/spec-architecture.json`（想改文案或布局就改它后重新出图）。

## 版权与许可

- **代码**：个人同人学习作品，**未附加开源许可证**（默认保留所有权利）。欢迎阅读与学习；如需转载、二次分发或商用，请先联系作者。
- **图片**：来自 Flickr 的 CC 授权摄影作品（经 Openverse 检索），作者与许可详见页面「关于」板块 —— CC BY / CC BY-SA / CC BY-NC / CC0（pasukaru76、animaster、Danny Choo、danzE26、Corsica_JP、SemiOtaku Studio 等）。**使用时请一并保留署名。**
- **VRM 模型**：粉丝同人转换作品，**不在本仓库中**；如需使用请自行获取并核验原作者授权条款，出处见 `assets/model/README.md`。
- **角色与商标**：「初音未来 HATSUNE MIKU」为 Crypton Future Media 的注册商标与角色形象，本项目为粉丝同人学习作品，**与官方无关**。

## 3D 模型的渲染与回退（技术说明）

hero 区的 3D 初音由 `three.js 0.160.1` + `@pixiv/three-vrm 3.5.5` 渲染，经 **esm.sh CDN** 的 ESM import map 引入（版本固定，无需构建，单一 three 实例）：

- **动画**：自然待机姿势（双臂下垂）+ 呼吸 / 轻摆 + 光标视线与头部跟随；Snow 主题自动切换光色；
- **回退**：无 WebGL、断网、或 `assets/model/miku.vrm` 缺失/加载失败时，自动隐藏 3D 并显示 `index.html` 中的手绘 SVG 初音 —— 页面其余部分不受影响。
