# Fork 发布指南

`codex/release` 分支保存仅供此 fork 使用的发布自动化。提交给 `BiliUniverse/ADBlock` 的功能分支不得包含此分支独有的提交。

## 必需的 Secret

在仓库 Actions Secrets 中添加 `PACKAGE_TOKEN`。它的值必须是具有 `read:packages` 权限的 GitHub Personal Access Token (classic)，构建工作流需要使用它安装 `@nsnanocat/*` 包。

`SUBMODULE_TOKEN` 是可选项。对于公开的 protobuf 子模块，构建会回退使用工作流的 `github.token`。

## 发布

必须从此分支创建 tag。Beta tag 会触发预发布，稳定版 tag 会触发最新正式版本。

```bash
git switch codex/release
git tag -a v0.1.0-beta.1 -m "v0.1.0-beta.1"
git push origin v0.1.0-beta.1

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
