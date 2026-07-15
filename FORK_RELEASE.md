# Fork 发布指南

`codex/release` 分支保存仅供此 fork 使用的发布自动化。提交给 `BiliUniverse/ADBlock` 的功能分支不得包含此分支独有的提交。

## 必需的 Secret

发布工作流使用 GitHub Actions 自动生成的短期 `GITHUB_TOKEN` 安装公开的 `@nsnanocat/*` 包，并只授予 `packages: read` 权限。无需创建或保存个人 `PACKAGE_TOKEN`。

个人发布构建不检出上游的私有 protobuf 子模块。首页推荐由 fork 独立构建的 `feed-response.bundle.js` 处理，其余响应继续使用经过 SHA-256 校验的上游稳定版 `response.bundle.js`。

## 发布

必须从此分支创建 tag。Beta tag 会触发预发布，稳定版 tag 会触发最新正式版本。

```bash
git switch codex/release
git tag -a v0.1.0-beta.2 -m "v0.1.0-beta.2"
git push origin v0.1.0-beta.2

git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

## 订阅地址

- Loon: `https://github.com/ne0-wu/BiliADBlock/releases/latest/download/BiliBili.ADBlock.plugin`
- Surge: `https://github.com/ne0-wu/BiliADBlock/releases/latest/download/BiliBili.ADBlock.sgmodule`
- Stash: `https://github.com/ne0-wu/BiliADBlock/releases/latest/download/BiliBili.ADBlock.stoverride`
- Egern: `https://github.com/ne0-wu/BiliADBlock/releases/latest/download/BiliBili.ADBlock.yaml`
- Quantumult X: `https://github.com/ne0-wu/BiliADBlock/releases/latest/download/BiliBili.ADBlock.snippet`

`[推荐] 去除直播` 默认关闭，导入生成的配置后需要手动开启。
