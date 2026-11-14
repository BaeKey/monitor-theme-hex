# HEX

为 **monitor-probe** 制作的监控主题，支持桌面卡片与表格、手机端布局、深浅色和中英文。首页汇总节点状态与网络情况，详情页提供资源历史、线路延迟、流量和设备资料。

[下载稳定版](https://github.com/BaeKey/monitor-theme-hex/releases/latest) · [使用指南](maintenance/USER-GUIDE.md) · [开发说明](maintenance/DEVELOPMENT.md) · [更新记录](CHANGELOG.md)

![HEX 主题预览](preview.png)

## 安装与升级

1. 准备好正在运行的 monitor-probe，从 [GitHub Releases](https://github.com/BaeKey/monitor-theme-hex/releases/latest) 下载 `theme.tar.gz`。
2. 在后台的主题管理中上传安装包。
3. 选择 **HEX** 启用；升级时上传新版安装包覆盖即可。

主题短名为 `hex`。GitHub 自动生成的源码 ZIP 不能用于后台安装。发布页提供 `theme.tar.gz.sha256`，可用于核对下载文件。

当前稳定版为 **v1.2.8**。`main` 维护稳定版，开发在临时功能分支进行，通过 PR 和 CI 合并后删除分支；开发分支中的版本字段不代表正式发布。

v1.2.8 统一发布子路径部署、信息显示开关修复，以及检测更新清理。手机设置不再请求版本接口或显示升级入口；主题当前版本仍可查看，HEX 宣传封面保持不变。

## 主要功能

- **节点浏览**：桌面工具栏将标题与显示设置、搜索与筛选分为两行，显示匹配数并支持一键重置；保留分组、排序及卡片/表格视图。
- **平面世界地图**：Three.js 蜂窝陆地、节点 / 流量 / 探测图层、地区详情和异常定位；支持画布平移缩放，手机使用全屏地图与可拖动节点面板。
- **资源与网络**：CPU、内存、硬盘、实时网速，以及资源历史、线路延迟和丢包记录。
- **手机端**：节点、概览和设置入口，详情使用总览、资源、网络、资料四个分区。
- **配置与偏好**：后台统一配置站点外观，访客可在浏览器保存明暗、语言和显示偏好。
- **状态提醒**：提供高负载、离线、临近到期和流量额度筛选，手机首页隐藏警示文字；不进行 Hub 或 Agent 版本查询。

数据含义、配置作用域、手机桌面快捷方式和具体操作见 [使用指南](maintenance/USER-GUIDE.md)。

## 页面预览

截图使用本地演示数据；首页、表格和详情展示图随当前界面更新，顶部宣传封面单独维护。

![桌面节点工具栏](screenshots/readme/node-toolbar.png)

![桌面首页](screenshots/readme/home-desktop.png)

<details>
<summary>详细卡片密度与深色首页</summary>

![桌面详细卡片](screenshots/readme/home-desktop-detailed.png)

![深色详细首页](screenshots/readme/home-desktop-dark.png)

</details>

<details>
<summary>平面地图：浅色探测图层与手机地区面板</summary>

![桌面浅色地图与地区详情](screenshots/readme/map-desktop-light.png)

<img src="screenshots/readme/map-mobile-dark.png" width="300" alt="手机深色探测地图" /> <img src="screenshots/readme/map-mobile-light.png" width="300" alt="手机浅色探测地图" />

</details>

<details>
<summary>桌面表格与服务器详情</summary>

![桌面表格](screenshots/readme/table-desktop.png)

![服务器详情](screenshots/readme/detail-desktop.png)

</details>

<img src="screenshots/readme/home-mobile.png" width="300" alt="手机节点页" /> <img src="screenshots/readme/detail-mobile.png" width="300" alt="手机详情资料" />

<details>
<summary>手机资源、概览与设置</summary>

<img src="screenshots/readme/resources-mobile.png" width="300" alt="手机资源独立卡片" />

<img src="screenshots/readme/overview-mobile.png" width="300" alt="手机概览页" /> <img src="screenshots/readme/settings-mobile.png" width="300" alt="手机设置" />

</details>

## 本地开发

使用 Node.js 24 与 npm：

```sh
npm ci
npm run dev
```

开发服务器默认把 `/api` 代理到 `http://127.0.0.1:9911`。演示服务、测试、打包和多浏览器验证见 [开发说明](maintenance/DEVELOPMENT.md)，提交与合并规则见 [CONTRIBUTING](CONTRIBUTING.md)。

## 文档与归档

| 入口 | 内容 |
|---|---|
| [使用指南](maintenance/USER-GUIDE.md) | 首页、详情、设置和数据说明 |
| [维护资料](maintenance/README.md) | 验收记录、地图性能与历史发布说明 |
| [脚本说明](scripts/README.md) | 构建、打包、截图和验证工具 |
| [历史归档](archive/README.md) | 设计稿、验证截图和性能基准 |

## 来源与许可

HEX 采用 MIT 许可。基础接口与部分组件源自 monitor-theme-default，部分视觉和地图资源参考 Komari Next。来源与第三方声明见 [NOTICE](NOTICE.md)、[LICENSE](LICENSE) 和 [LICENSE.komari-next](LICENSE.komari-next)。

Three.js 的许可见 [LICENSE.three](LICENSE.three)。可复用地图组件、数据单位、交互与性能边界见 [Three.js 地图接入说明](maintenance/THREE-WORLD-MAP.md)。

## 子路径部署

同一份主题构建同时支持 `/`、`/monitor/`、`/a/b/` 等路径，无需重新设置 Vite base。
使用支持注入 `<base href="/实际前缀/">` 的 hub（如 BaeKey/monitor 的子路径版本）：

```sh
monitor-hub --site https://example.com/monitor
```

反向代理必须去掉 `/monitor` 前缀后再转发，且将 `/monitor` 重定向至 `/monitor/`。
API、WebSocket、详情导航、后台链接和内置静态资源均跟随注入的前缀。
旧版根路径 hub 与 Vite 开发环境无需注入 `<base>`，仍按根路径运行。
不能仅靠当前浏览器路径推断部署前缀，因为 `/node/1` 是详情路由；
其他静态宿主也必须在 HTML head 最前面注入带末尾斜杠的 `<base>`。
自定义背景的 `/images/...` 仍表示域名根路径，外部 HTTP(S) 地址保持原样，仅内置山峦背景跟随主题前缀。

验证命令：`npm run build && TEST_BROWSER=chromium npm run test:subpath`，覆盖根路径、多层和 URL 编码前缀。

## 信息显示开关

主题后台的通用卡片信息设置同时控制列表、表格、节点详情与相关到期/流量提醒。
手机选择「跟随通用设置」时使用通用开关，选择「单独设置」时使用手机开关。
关闭价格也会隐藏费用与付费周期；关闭全部流量、费用、到期信息会移除整个详情账期区。
配置保存后刷新前台页面生效。这些开关仅控制前端展示，不是后端字段访问权限。
