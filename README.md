# 星蚀契约：群星回响

**Eclipse Covenant** — 在群星黯淡之际，与你的契约者并肩而行。

一款免费浏览器幻想卡牌游戏：23 位契约者、N 至 SSP 七档稀有度、48 个主线关卡、8 座装备秘境、3D 自动战斗，以及角色和装备养成。无需登录，无需后端。

建议仓库名：`eclipse-covenant`。

## 本地游玩

安装 Node.js 24，在项目目录运行：

```sh
npm start
```

打开 <http://127.0.0.1:4180/>。无需 `npm install`；项目没有外部 npm 依赖。

```sh
npm test       # 验证游戏规则
npm run build # 生成 dist/ 静态网站
```

详细玩法和素材记录见 [游戏说明](eclipse/README.md)。

发布前验收：121 项游戏测试通过；在 `/eclipse-covenant/` 子路径下实际验证了 3D 自动战斗、1,000 轮 Worker 扫荡、装备奖励与 11/11 音效素材加载。此为本地发布包验收，线上部署状态以 GitHub Actions 为准。

## 使用 GitHub Pages 发布

1. 在 GitHub 创建公开仓库 `eclipse-covenant`，使用 `main` 分支。
2. 把本项目提交并推送到仓库，包含 `.github/workflows/pages.yml`、`scripts/`、`package.json` 和完整 `eclipse/` 目录。保留素材目录结构；不要只上传 HTML，也不需要提交 `dist/`。
3. 进入仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
4. 进入 **Actions → Deploy Eclipse Covenant to Pages → Run workflow**，选择 `main` 执行。首次推送如果早于启用 Pages 而部署失败，配置完成后重新运行即可。
5. 工作流先测试，再打包和部署。成功后，从 Pages 设置或工作流的 `github-pages` 环境打开实际游玩链接。

仓库名为 `eclipse-covenant` 时，默认网址形式为 `https://你的GitHub用户名.github.io/eclipse-covenant/`。日后每次推送 `main` 都会自动更新。改用其他主分支时，同时修改工作流中的 `branches` 和部署 `if` 条件。

发布包首页直接进入卡牌游戏，资源使用相对路径，支持仓库子路径和自定义域名。早期射击游戏、开发测试页、验收截图和生图脚本不会进入发布包。Three.js 的许可证与模型来源记录会保留。

部署方案参考 [GitHub 官方 Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 玩家存档

这是每个人独立游玩的单机网页游戏，没有在线对战或云存档。进度保存在当前浏览器的 localStorage；更换设备、浏览器、域名或清除网站数据会使用另一份存档。GitHub Pages 上的游戏不会自动读取 localhost 上的进度。

首次点击页面后启动音效，可在顶栏「声音设置」调整。三维战斗需要支持 WebGL 的现代浏览器。
