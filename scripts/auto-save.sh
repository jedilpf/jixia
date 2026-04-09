#!/bin/bash
# 自动保存脚本 - 每30分钟自动提交当前修改
cd "f:/zz/jixia2.0【完整链路版本】"
git add -A
if git diff --cached --quiet; then
    echo "无修改，跳过提交"
else
    git commit -m "auto-save: $(date '+%Y-%m-%d %H:%M') 工作进度自动保存"
    echo "已自动保存: $(date)"
fi
