# GitHub 仓库体积治理指南（小白可执行）

这份指南分两部分：

1. 立刻生效：防止仓库继续变胖（已接入 GitHub Action）
2. 一次性处理：把历史里的大文件清掉（可选，需手动执行）

---

## 1. 已接入的防胖机制（自动）

已新增工作流：

- `.github/workflows/large-file-guard.yml`

规则：

- PR 和 push 到 `main` 时自动检查“本次改动里的文件”
- 单文件 `>20MB`：直接失败，禁止合并
- 单文件 `>5MB`：给 warning，提醒优化

这能保证以后不会再悄悄塞进超大文件。

---

## 2. 历史瘦身（可选，但强烈建议）

为什么要做：

- 你就算删掉了仓库里的大文件，Git 历史仍然会保留它们
- 仓库体积不会明显变小

所以要做一次历史重写（`git filter-repo`）。

### 2.1 执行前准备

1. 确认所有协作者都知道要“改历史”
2. 暂停其他人向 `main` 推送
3. 本机安装 `git-filter-repo`

安装命令（Windows）：

```bash
python -m pip install git-filter-repo
```

### 2.2 脚本位置

- `scripts/repo/filter-history-safe.ps1`

这个脚本默认是“演练模式（dry-run）”，不会真正改历史。

### 2.3 先演练（不会改动）

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo/filter-history-safe.ps1
```

### 2.4 正式执行（会改历史）

```powershell
powershell -ExecutionPolicy Bypass -File scripts/repo/filter-history-safe.ps1 -Execute -SizeLimitMB 20
```

脚本会做三件事：

1. 先创建 mirror 备份（可用于回滚）
2. 清理历史中超大 blob 和常见二进制产物（zip/exe/mp4/mov/psd、dist 等）
3. 给出后续 push 命令（不会自动推）

### 2.5 手动推送改写后的历史

```bash
git push origin --force --all
git push origin --force --tags
```

---

## 3. 回滚方案（如果清理有误）

脚本执行时会打印备份路径，类似：

- `../repo-backups/<repo-name>-mirror-时间戳.git`

回滚命令：

```bash
cd "<备份路径>"
git push --mirror <远程仓库URL>
```

这会把远程恢复到清理前状态。

---

## 4. 团队协作注意事项

历史改写后，所有协作者本地仓库会和远程“断代”。

最简单安全做法：

1. 让大家重新 `git clone`

如果必须保留本地仓库，至少执行：

```bash
git fetch --all
git reset --hard origin/main
```

---

## 5. 文件该放哪（避免再次膨胀）

- 安装包（`exe` / `dmg` / `zip`）：放 GitHub Releases
- CI 构建产物：放 GitHub Actions Artifacts（短期保存）
- 大型设计源文件/视频：放对象存储或网盘
- 只有“运行必需资源”才留在仓库

需要版本化大素材时，再单独启用 Git LFS（不建议盲目全量开启）。
