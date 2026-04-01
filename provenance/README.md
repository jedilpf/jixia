# Provenance

## 目的
记录每批AI产出的来源和上下文，保证可复现。

## 文件命名
- `batch-YYYYMMDD-XX.json`

## 必填字段
- batch_id
- created_at
- models_used
- prompt_template_version
- canon_version
- scope_version
- seed
- input_files
- output_files

## 约束
- 缺任何必填字段时，该批次不可合并。
