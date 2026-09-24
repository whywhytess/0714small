# 0001. 控制面与用户站点使用不同注册域

- 状态：提议
- 日期：2026-09-24

## 背景

用户上传的 HTML/JS 会在访问者浏览器里执行。如果用户站点和控制面在同一个注册域（例如 `alice.example.com` 与 `app.example.com`），用户脚本就处在同一个 site 下：可以设置作用于父域的 Cookie（Cookie tossing）、绕过 SameSite 保护，在配置出错时还可能读到控制面的 Cookie 或存储。

## 决定

1. 控制面使用 `app.<控制面域>`（文档中写作 `app.example.com`）。
2. 用户站点使用**另一个注册域**的一层子域：`<slug>.<站点域>`（文档中写作 `*.sites-example.net`）。
3. 控制面 Cookie：`HttpOnly; Secure; SameSite=Lax`，**host-only（不设置 `Domain`）**，名字加 `__Host-` 前缀。
4. 控制面所有写请求都校验 `Origin`（缺失时回退为 CSRF token）；站点域不在允许列表里。
5. 控制面不渲染用户 HTML：不直接插入，不用同源 iframe，站点卡片不抓取用户页面。预览一律在新窗口打开已发布站点。
6. Gateway 只接受 `^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.<站点域>$` 格式的 Host（最终规则在 W3 与测试向量一起确定）；其他 Host 返回 404。
7. 站点域的 wildcard DNS/TLS 在 W3 Day 4 用真实测试域验证。申请加入 PSL（Public Suffix List）不作为 W3 的前置条件。

## 后果

- 需要购买并管理两个域名；staging 也需要一对独立的测试域名。
- 用户站点之间仍然同属一个 site（`*.sites-example.net`）。站点之间的 Cookie 互相可见，这对静态站点是可以接受的风险；加入 PSL 后可以缓解，列入 V2 评估。
- 以后做草稿预览必须用第三个不可信域加临时授权（计划第 10 节）。

## 被否决的方案

- **同一注册域的子域**：隔离依赖每一处 Cookie 和 CORS 配置都不出错，容错空间太小。
- **路径式托管（`example.com/~alice`）**：所有站点和控制面同源，完全没有隔离。
