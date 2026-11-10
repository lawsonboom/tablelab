# 牌桌实验室 v2

在线游玩：https://lawsonboom.github.io/tablelab/

移动端优先的21点与百家乐互动教学网页。无需账户，各人独立游玩，只有虚拟筹码；不提供充值、提现、真钱下注、联网对战或盈利保证。

## 文件
- `index.html`、`style.css`、`engine.js`、`app.js`：公开网站的完整源文件，无第三方运行依赖。
- `test-engine.cjs`：可运行的规则、结算、策略与随机牌局检查。使用 Node.js 执行 `node test-engine.cjs`。
- `单文件版.html`：内联全部样式和逻辑，现代桌面浏览器可直接打开；手机请优先使用公开HTTPS地址，文件预览可能不执行脚本。

本地预览：在项目文件夹运行 `python3 -m http.server 8765`，浏览器打开 `http://localhost:8765`。发布时托管根目录的HTML、CSS和JS文件即可。

## 桌规与记录
21点：6副牌、S17、3:2、荷官查天然、DAS、晚投降、最多四手、分A限一张且不再分A、分牌21点按普通赢局。策略为总点数基础策略，不使用剩余牌组成修正。
百家乐：8副牌、完整第三张牌表、传统庄佣金5%或庄6点赢半赔、和净赔8:1、和局庄闲注退回。
概率实验：8副牌庄闲和近似概率独立抽样；始终押传统庄，每场5,000、最多100局、2,000场。具体模型见页面。
余额、完整进行中牌局、题库进度、最近20局、策略错误类型与偏好存在当前浏览器 `localStorage`，不上传、不跨设备同步。建议只开一个游戏标签页，清除浏览器数据会清除记录。

## 复用范围
从原ChatGPT对话读取到了修复版HTML的前20,000字符，原完整附件不可获取。保留原五模块、虚拟资金设定、核心点数与百家乐补牌逻辑，在此基础上重构引擎与界面；修正S17软19建议、分牌/加倍后的策略回退、派彩显示精度，并补充持久化、引导、动效与无障碍。

## 资料
- https://wizardofodds.com/games/blackjack/strategy/4-decks/
- https://www.gra.gov.sg/docs/default-source/game-rules/rws/baccarat-games/rws-game-rules---rws-baccarat-v3.pdf
- https://wizardofodds.com/games/baccarat/basics/
校核：2026-11-10。本工具自定义教学桌规不等于所有赌场规则。
