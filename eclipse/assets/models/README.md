# 3D 模型来源

人物基础模型（Warrior / Ranger / Wizard / Cleric / Monk）：**Quaternius · RPG Character Pack**

官方页面：https://quaternius.com/packs/rpgcharacters.html

怪物基础模型（Orc / Demon / Blue Demon）：**Quaternius · Ultimate Monsters**

官方页面：https://quaternius.com/packs/ultimatemonsters.html

两个官方资源页面均标注 CC0 1.0 Universal。许可文本：https://creativecommons.org/publicdomain/zero/1.0/

下载来源为公开镜像 https://github.com/Hakhyun-Kim/constellation-defense ，镜像仅将原 glTF 打包为 GLB，保留网格、骨骼、纹理与动画。下载后逐个校验镜像素材清单记录的 SHA-256；文件名、原作者、来源、下载日期和哈希保存在 `manifest.json`。

此游戏没有修改 GLB 文件本身。V8 的 23 位友方角色保留上述五套职业模型的骨骼动画，隐藏原职业外观，改由 `hero-models.js` 的曲面头部、身体、发束、服装、武器与配件跟随关节。各角色按卡面配置颜色与轮廓，面部使用内置 image_gen 生成的纹理；它们仍为风格化实时模型，未达到原画的写实精度。敌方保留上述怪物网格，搭配运行时翼饰和特效。纹理来源和完整提示词见 `../characters/README.md`。三维环境与技能特效由本项目代码绘制。

依赖：本地 Three.js 0.160.1，MIT 许可见 `../../vendor/three/LICENSE.txt`。
