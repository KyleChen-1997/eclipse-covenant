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
