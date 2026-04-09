# Git 本地快照与恢复

## 目标

这套流程是给当前仓库准备的本地安全网：

- 随手存一份当前现场
- 不打乱你正在写的工作区
- 出问题时能先备份当前状态，再恢复到之前的本地快照

它不改远端历史，也不替代正常提交。它的作用是让你在大改、试错、让多个 AI 同时动仓库时，随时有一个可回来的落点。

## 一键命令

创建本地快照：

```powershell
npm run git:snapshot -- -Label story-fix
```

查看最近快照：

```powershell
npm run git:snapshots
```

恢复到某个快照：

```powershell
npm run git:restore -- -BaseRef backup/snapshot-YYYYMMDD-HHMMSS-story-fix -StashRef <stash-hash>
```

## 这套快照实际做了什么

### `git:snapshot`

1. 先给当前 `HEAD` 建一个本地备份分支：

```text
backup/snapshot-时间戳-标签
```

2. 如果工作区有改动，再额外存一份带 `untracked` 的 stash：

```text
snapshot/时间戳/标签
```

3. stash 存完后会立刻重新 apply 回来，所以你的当前工作区不会被清空。

换句话说，它是“留一份备份，但你眼前不跳变”。

### `git:restore`

恢复前，它会先自动做一层新的安全备份：

- 分支：`backup/pre-restore-时间戳`
- stash：`pre-restore-时间戳+时区`

然后才会：

1. 可选重置到指定 `BaseRef`
2. 应用你指定的 `StashRef`

这样就算恢复错了，你也还能退回恢复前的状态。

## 推荐习惯

### 大改前先打一份快照

适合这些情况：

- 准备让 AI 批量改多个文件
- 要尝试 `reset`、`stash`、`restore`
- 要改剧情、卡牌、图鉴这类大范围链路

建议命令：

```powershell
npm run git:snapshot -- -Label before-story-refactor
```

### 每天至少保一个“可叫得出名字”的快照

不要只写 `test`、`temp`，建议写能看懂的标签：

- `story-ch6-polish`
- `card-art-fallback`
- `community-review-fix`

### 恢复时尽量用 `git:snapshots` 里显示的 stash 哈希

不要依赖 `stash@{0}` 这类相对位置。

因为只要再创建一次新 stash，编号就会变。哈希最稳。

## 常见示例

### 示例 1：给争鸣史改文案前先备份

```powershell
npm run git:snapshot -- -Label story-copy-pass
```

### 示例 2：查看最近有哪些可回退点

```powershell
npm run git:snapshots
```

### 示例 3：恢复到某个之前的本地现场

```powershell
npm run git:restore -- -BaseRef backup/snapshot-20260409-213000-story-copy-pass -StashRef abcdef1234567890
```

## 注意

- 这套流程是本地安全网，不会自动推送远端。
- `git:snapshot` 不是正式提交，重要阶段仍然建议正常 commit。
- 如果你已经确定要发布一个稳定节点，最好再补一个语义明确的 commit。
- 恢复脚本会做安全备份，但仍然建议先看一眼 `git:snapshots`，确认目标 ref 没选错。
