# 原画资源

资源由本会话的内置 imagegen 工具生成并复制到此目录。角色均为原创成年幻想角色；新增图以 `card-concepts.png` 作为画风参考，不使用外部游戏素材。原始生成文件保留在用户的 Codex generated_images 目录。

| 文件 | 内容与切片 |
| --- | --- |
| `card-concepts.png` | 初版五角色 N→UR 概念图：米洛、岚雀、绯织、塞勒涅、阿斯忒拉。 |
| `heroes-dawn.png` | 五个等宽竖向面板：布兰、芙萝拉、凛鸦、维斯珀、奥蕾莉娅。 |
| `heroes-dusk.png` | 五个等宽竖向面板：菲妮、奎尔、莉拉、奥里昂、诺克提斯。 |
| `enemies.png` | 三个等宽面板：暗影骑士、幽灵先知、星蚀化身。 |
| `battlefield.png` | 无人物的悬空教堂废墟与日蚀战场。 |

## 本次生成提示词概要

共同要求：premium original painterly anime-realism fantasy RPG art; consistent world and lighting; fully clothed adult characters; increasing silhouette complexity, equipment ornamentation and magical spectacle from N to UR; no lettering, UI, watermark or decorative card frames.

- Dawn：five equal edge-to-edge portrait panels. Harbor sentry Bran with a worn shield; herbal apothecary Flora and glowing green medicine; frost archer Nix with a raven; crimson rose duke Vesper; solar dragon empress Aurelia with golden armor, halo and luminous dragon.
- Dusk：five equal edge-to-edge portrait panels. Watchmaker apprentice Finch and mechanical bird; desert scout Quill; ocean bard Lyra with harp and luminous water; storm paladin Orion; night chronomancer Noctis with shattered celestial clocks and violet constellations.
- Enemies：three equal portrait panels, dark armored knight, spectral oracle, massive eclipse avatar; readable individual silhouettes and dark fantasy materials.
- Battlefield：empty side-view fantasy combat arena, ruined floating cathedral courtyard, marble platform, black sun eclipse, atmospheric blue moonlight, open middle and foreground for combatants; no characters or UI.

页面通过 CSS 背景定位读取面板，没有对生成原图重新绘画或进行程序化图像编辑。

## 星铸装备

新增 15 件装备的独立透明原画，采用内置图片生成工具逐件绘制。文件和最终提示词见 [equipment/README.md](equipment/README.md) 与 [equipment/prompts.json](equipment/prompts.json)。

## 曙光与天穹扩展（v5）

`heroes/` 下新增泰莎、卢恩、伊格妮丝、伊蕾涅、苍曜五张独立角色立绘；`equipment/` 下新增十件独立透明装备原画，各稀有度两件。均由内置 imagegen 逐件生成，无外部游戏素材，无额外图片编辑。完整提示词、原始生成路径、目标文件和 SHA-256 见 `expansion-v5-prompts.json`。角色使用 2:3 竖版原画，装备使用透明背景，前端按容器等比展示。`region-dawn.svg` 与 `region-tempest.svg` 为延续原有 SVG 系统的手工场景插图。


## 第六乐章视觉资源（2026-10-01）

通过内置 OpenAI imagegen 生成六幅独立角色立绘及一幅战场背景，无文本、商标或卡框，界面装饰由网页实时绘制。

- `heroes/astra-v6.png`、`heroes/aurelia-v6.png`、`heroes/noctis-v6.png`：UR 高清原画。
- `heroes/selene-v6.png`、`heroes/vesper-v6.png`、`heroes/orion-v6.png`：SSR 高清原画。
- `visual/celestial-sanctum-v6.png`：三维战场远景。
- [完整提示词、最终路径与 SHA-256](visual/manifest-v6.json)。

以新文件名接入，保留旧资源，未进行二次图像编辑。卡牌原画用于首页、图鉴、档案、召唤和战斗立绘演出，不作为三维人物模型。

## 百人扩展预留卡位（V10）

新增 77 位角色使用 16 张系列条图，文件名与面板顺序约定如下。文件就位前，卡面、图鉴与编队头像显示按角色主色生成的纹章占位（`app.js` 的 `--ph` 背景层）；条图放入约定文件名后自动覆盖占位层，无需修改代码。

- 规格：每张图为等宽竖向面板，`binary` 为 2 联、其余为 5 联；面板自左向右按下表顺序对应角色索引 0…4（`binary` 为 0…1）。画风以 `card-concepts.png` 为参考，无文本、水印或卡框。
- 尺寸：建议与现有条图一致，5 联保存为 1983×793、2 联保存为 794×793；前端按面板等宽裁切，纵向展示区约为图高 22% 起的卡面带，人物头部请留在面板上三分之一。
- 放置位置：本目录（`eclipse/assets/`），文件名严格使用下表左列。

| 文件 | 面板顺序（左 → 右） |
| --- | --- |
| `heroes-comet.png` | 佩罗 N · 蕾恩 R · 克蕾丝 SR · 维里奥 SSR · 西里乌斯 UR |
| `heroes-nebula.png` | 莫斯 N · 米斯特拉 R · 辛德 SR · 妮克丝 SSR · 维加 UR |
| `heroes-pulsar.png` | 塔姆 N · 瑟拉 R · 布朗特 SR · 芙拉 SSR · 阿斯特鲁 UR |
| `heroes-quasar.png` | 露米特 N · 盖尔 R · 萨布尔 SR · 厄俄斯 SSR · 索拉拉 UR |
| `heroes-zenith.png` | 布拉姆 N · 伊丽丝 R · 费罗 SR · 米拉 SSR · 苏祖 N |
| `heroes-horizon.png` | 杜恩 N · 科拉尔 R · 佩特拉 SR · 马里斯 SSR · 芬 N |
| `heroes-solstice.png` | 哈娜 N · 玻瑞尔 R · 索利斯 SR · 赫莉亚 SSR · 基普 N |
| `heroes-equinox.png` | 维拉 N · 林克斯 R · 埃俄洛斯 SR · 忒弥斯 SSR · 奥多 N |
| `heroes-meridian.png` | 卡西亚 N · 罗妲 R · 西勒斯 SR · 维斯娜 SSR · 塔恩 R |
| `heroes-zodiac.png` | 阿里奥 N · 利布尔 R · 斯科 SR · 皮西亚 SSR · 卡普里 R |
| `heroes-umbra.png` | 维莱 N · 科沃斯 R · 莫罗 SR · 塞尔基斯 SSR · 威斯普 R |
| `heroes-lumina.png` | 弗林特 N · 奥拉 R · 卢切 SR · 奥萝拉 SSR · 卢门 R |
| `heroes-aegis.png` | 加德 N · 维莉 R · 埃吉德 SR · 瓦卢姆 SSR · 里卡 SR |
| `heroes-cascade.png` | 布鲁克 N · 法拉 R · 温蒂妮 SR · 德卢格 SSR · 瓦珀 SR |
| `heroes-reverie.png` | 尤梅 N · 拉尔 R · 奥涅拉 SR · 索姆努斯 SSR · 索姆妮亚 SR |
| `heroes-binary.png` | 卡斯托 SSR · 波吕克斯 SSR |
