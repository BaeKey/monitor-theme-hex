# 来源与许可

HEX 是为 monitor-probe 编写的独立适配主题，不是 Komari Next 官方发行版。

- 接口、WebSocket 重连/轮询、历史图表、格式化工具及基础组件源自 monitor-probe/monitor-theme-default（MIT），参考提交 `c71d8260d841c97e909649383b5be0eb156c527b`。版权与许可见 LICENSE。
- 安装包结构根据 monitor-probe/monitor 的 `src/frontend.rs` 核对，参考提交 `338149324149fcb2fdfae31cb64b3eaaf9d1feda`（2026-09-19 获取）。


- 本地拉丁字母和数字字体使用 Inter（Rasmus Andersson，SIL Open Font License 1.1），变量 WOFF2 拉丁子集来自 Google Fonts。字体与许可位于 `public/fonts/`，随前端分发；页面运行时不请求外部字体服务。

第三方依赖的各自许可证保留在 npm 安装的依赖包中。

- v1.3 的国旗和系统图标资源来自上述 Komari Next 提交的 public/assets/flags 与 public/assets/logo，保留上游 LICENSE.komari-next；相关名称与标志归各自权利人所有。内置山峦背景为本主题原创 SVG。

LuminaPlus visual reference: https://github.com/guboysky/LuminaPlus/tree/8284ebf95f0c9163dcce72e933bad9ebc28b4f39 (Shanyang242 / volcano-1025). The v1.6 visual design was reimplemented in this project; no compiled LuminaPlus code, fonts or third-party artwork were imported.
