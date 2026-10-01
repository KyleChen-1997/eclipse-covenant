# 星铸装备原画

最初 15 张透明 PNG 由会话中的内置 `image_gen.imagegen` 工具逐件生成。
完整最终提示词保存在 [prompts.json](prompts.json)，未使用 CLI 或外部游戏素材。

风格：有立体质感的幻想装备原画，统一三分之四视角与柔和棚灯，清晰的金属雕纹、皮革、织物、宝石折射；稀有度越高，结构、纹饰与魔法效果越华丽。每张图只包含一件装备，没有文字、界面边框、人物或展示台。

| 稀有度 | 武器 | 护甲 | 圣物 |
| --- | --- | --- | --- |
| N | `weapon-n.png` 旅人短剑 | `armor-n.png` 巡星轻甲 | `relic-n.png` 微光吊坠 |
| R | `weapon-r.png` 风语长刃 | `armor-r.png` 银月护甲 | `relic-r.png` 晨露晶石 |
| SR | `weapon-sr.png` 赤烬裁决 | `armor-sr.png` 霜镜战衣 | `relic-sr.png` 潮汐之心 |
| SSR | `weapon-ssr.png` 月陨圣剑 | `armor-ssr.png` 星穹壁垒 | `relic-ssr.png` 时隙沙漏 |
| UR | `weapon-ur.png` 终焉·破晓 | `armor-ur.png` 神谕·永恒 | `relic-ur.png` 创世·星核 |

图片保持生成时的原始尺寸和透明通道，直接复制到项目中，未进行程序化重绘、裁切或背景替换。它们是用于装备展示的二维原画，具有三维渲染质感；没有改变战斗人物的骨骼模型或实际穿戴网格。

使用位置：装备库存、穿戴栏、装备详情、秘境战斗掉落与新增「星铸图录」。图录可查看未收集装备和获得途径，不发放物品或改变进度。空装备栏保留简洁的部位图标。

## SP / SSP 新装备

以下六件由内置 `image_gen.imagegen` 逐件生成，未使用 CLI。红黑金 SP 使用尖锐王权轮廓与红宝石；炫光 SSP 使用铂金、蛋白石与悬浮星环。原始 PNG 原样保存，完整最终提示词、工具来源与路径记录在 [sovereign-generation.json](sovereign-generation.json)，尺寸和 SHA-256 记录在 [manifest.json](manifest.json)。

| 稀有度 | 武器 | 护甲 | 圣物 |
| --- | --- | --- | --- |
| SP | [赤冕·断罪](weapon-sp.png) | [绯誓·王铠](armor-sp.png) | [血月·圣契](relic-sp.png) |
| SSP | [初光·裁星](weapon-ssp.png) | [万象·天衣](armor-ssp.png) | [永恒·零界](relic-ssp.png) |

这些素材是装备界面的二维原画，未更改战斗人物的实际穿戴网格。仅在绯月王庭、零界星殿获得，门槛和概率详见游戏中的获取说明。
