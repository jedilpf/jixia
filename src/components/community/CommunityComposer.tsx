import { useMemo, useState } from 'react';
import type { CommunityCategory, CommunityComposerMode, CommunityDraft, CommunityPost } from '../../community/types';
import { CATEGORY_TAG_MAP, COMMUNITY_CATEGORIES } from '../../community/types';
import { validatePostInput } from '../../community/moderation';

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#+/, '').trim();
}

interface CommunityComposerProps {
  mode: CommunityComposerMode;
  initialDraft?: CommunityDraft | null;
  initialPost?: CommunityPost | null;
  onSubmit: (input: {
    title: string;
    content: string;
    category: CommunityCategory;
    tags: string[];
    imageUrls: string[];
  }) => void;
  onSaveDraft: (input: {
    category: CommunityCategory;
    title: string;
    content: string;
    tags: string[];
    imageUrls: string[];
    sourcePostId?: string | null;
  }) => string;
  onUpdateDraft?: (draftId: string, draft: {
    category: CommunityCategory;
    title: string;
    content: string;
    tags: string[];
    imageUrls: string[];
    sourcePostId?: string | null;
  }) => void;
  onPublishDraft?: (draftId: string) => void;
  onBack: () => void;
  onDeleteDraft?: () => void;
  onUpdatePost?: (input: { title?: string; content?: string; tags?: string[] }) => void;
}

export function CommunityComposer({
  mode,
  initialDraft,
  initialPost,
  onSubmit,
  onSaveDraft,
  onUpdateDraft,
  onPublishDraft,
  onBack,
  onDeleteDraft,
  onUpdatePost,
}: CommunityComposerProps) {
  const [category, setCategory] = useState<CommunityCategory>(() => {
    if (initialDraft) return initialDraft.category;
    if (initialPost) return initialPost.category;
    return 'discussion';
  });

  const [title, setTitle] = useState(() => {
    if (initialDraft) return initialDraft.title;
    if (initialPost) return initialPost.title;
    return '';
  });

  const [content, setContent] = useState(() => {
    if (initialDraft) return initialDraft.content;
    if (initialPost) return initialPost.content;
    return '';
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    if (initialDraft) return [...initialDraft.tags];
    if (initialPost) return [...initialPost.tags];
    return [];
  });

  const [customTagInput, setCustomTagInput] = useState('');
  const [tagInputError, setTagInputError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const availableTags = CATEGORY_TAG_MAP[category] || [];
  const customTags = useMemo(
    () => selectedTags.filter((tag) => !availableTags.includes(tag)),
    [availableTags, selectedTags]
  );
  const isEdit = mode === 'edit_draft' || mode === 'edit_post';

  const titleText =
    mode === 'create' ? '发布新帖' : mode === 'edit_draft' ? '编辑草稿' : '编辑帖子';

  const handleCategoryChange = (newCategory: CommunityCategory) => {
    if (!isEdit) {
      setSelectedTags([]);
    }
    setCustomTagInput('');
    setTagInputError('');
    setCategory(newCategory);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      setTagInputError('');
    } else if (selectedTags.length < MAX_TAGS) {
      setSelectedTags([...selectedTags, tag]);
      setTagInputError('');
    }
  };

  const handleAddCustomTag = () => {
    const normalizedTag = normalizeTag(customTagInput);

    if (!normalizedTag) {
      setTagInputError('请输入标签内容');
      return;
    }

    if (normalizedTag.length > MAX_TAG_LENGTH) {
      setTagInputError(`单个标签最多${MAX_TAG_LENGTH}个字`);
      return;
    }

    if (selectedTags.includes(normalizedTag)) {
      setTagInputError('该标签已添加');
      return;
    }

    if (selectedTags.length >= MAX_TAGS) {
      setTagInputError(`最多选择${MAX_TAGS}个标签`);
      return;
    }

    setSelectedTags([...selectedTags, normalizedTag]);
    setCustomTagInput('');
    setTagInputError('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((item) => item !== tag));
    setTagInputError('');
  };

  const runValidation = () => {
    const result = validatePostInput({
      title,
      content,
      tags: selectedTags,
      imageUrls: [],
      category,
    });

    if (!result.passed) {
      setValidationErrors(result.errors);
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  const handleSubmit = () => {
    if (!runValidation()) return;
    onSubmit({
      title,
      content,
      category,
      tags: selectedTags,
      imageUrls: [],
    });
  };

  const handleSaveDraft = () => {
    onSaveDraft({
      category,
      title,
      content,
      tags: selectedTags,
      imageUrls: [],
      sourcePostId: isEdit ? initialPost?.id || null : null,
    });
    onBack();
  };

  const handleUpdateDraft = () => {
    if (mode !== 'edit_draft' || !onUpdateDraft || !initialDraft) return;
    onUpdateDraft(initialDraft.id, {
      category,
      title,
      content,
      tags: selectedTags,
      imageUrls: [],
      sourcePostId: initialDraft.sourcePostId,
    });
    onBack();
  };

  const handlePublishDraft = () => {
    if (mode !== 'edit_draft' || !onPublishDraft || !initialDraft) return;
    onPublishDraft(initialDraft.id);
  };

  const handleUpdatePost = () => {
    if (mode !== 'edit_post' || !onUpdatePost) return;
    if (!runValidation()) return;
    onUpdatePost({ title, content, tags: selectedTags });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <div
        className="rounded-[22px] border p-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(47, 18, 15, 0.94) 0%, rgba(22, 8, 10, 0.94) 100%)',
          borderColor: 'rgba(214, 151, 73, 0.16)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-xl px-3 py-2 text-sm transition-colors"
              style={{
                background: 'rgba(212, 165, 32, 0.1)',
                border: '1px solid rgba(212, 165, 32, 0.24)',
                color: '#d9c3a0',
              }}
            >
              返回
            </button>
            <div className="flex flex-col">
              <span className="font-serif text-lg text-[#f5e6b8]">{titleText}</span>
              <span className="text-xs text-[#b89372]">调整板块、正文与标签即可完成发布或存档</span>
            </div>
          </div>

          <div className="rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(212,165,32,0.08)', color: '#d8bb72' }}>
            图片资源保持现状
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ overscrollBehavior: 'contain' }}>
        <div className="space-y-4">
          <div
            className="rounded-[22px] border p-5"
            style={{
              background: 'rgba(45, 18, 16, 0.88)',
              borderColor: 'rgba(214, 151, 73, 0.12)',
            }}
          >
            <label className="mb-3 block text-sm text-[#d9c3a0]">选择板块</label>
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id as CommunityCategory)}
                    className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all"
                    style={{
                      background: isActive
                        ? 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))'
                        : 'rgba(34, 12, 13, 0.76)',
                      border: `1px solid ${isActive ? 'rgba(214, 151, 73, 0.38)' : 'rgba(214, 151, 73, 0.12)'}`,
                      color: isActive ? '#f5e6b8' : '#d9c3a0',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-[22px] border p-5"
            style={{
              background: 'rgba(45, 18, 16, 0.88)',
              borderColor: 'rgba(214, 151, 73, 0.12)',
            }}
          >
            <label className="mb-2 block text-sm text-[#d9c3a0]">
              标题 <span style={{ color: '#f97316' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题（6-50字）"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{
                background: 'rgba(34, 12, 13, 0.8)',
                borderColor: 'rgba(214, 151, 73, 0.16)',
                color: '#f5e6b8',
              }}
            />
            <div className="mt-2 text-right text-xs" style={{ color: title.length > 50 ? '#f97316' : '#6f8799' }}>
              {title.length}/50
            </div>
          </div>

          <div
            className="rounded-[22px] border p-5"
            style={{
              background: 'rgba(45, 18, 16, 0.88)',
              borderColor: 'rgba(214, 151, 73, 0.12)',
            }}
          >
            <label className="mb-2 block text-sm text-[#d9c3a0]">
              正文 <span style={{ color: '#f97316' }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入正文内容（10-5000字）"
              rows={12}
              className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{
                background: 'rgba(34, 12, 13, 0.8)',
                borderColor: 'rgba(214, 151, 73, 0.16)',
                color: '#f5e6b8',
              }}
            />
            <div className="mt-2 text-right text-xs" style={{ color: content.length > 5000 ? '#f97316' : '#6f8799' }}>
              {content.length}/5000
            </div>
          </div>

          <div
            className="rounded-[22px] border p-5"
            style={{
              background: 'rgba(45, 18, 16, 0.88)',
              borderColor: 'rgba(214, 151, 73, 0.12)',
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-sm text-[#d9c3a0]">标签（最多 5 个）</label>
              <span className="text-xs text-[#a87a5d]">{selectedTags.length}/{MAX_TAGS}</span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className="rounded-full px-3 py-1.5 text-xs transition-all"
                    style={{
                      background: isSelected ? 'rgba(214, 151, 73, 0.22)' : 'rgba(34, 12, 13, 0.76)',
                      border: `1px solid ${isSelected ? 'rgba(214, 151, 73, 0.34)' : 'rgba(214, 151, 73, 0.12)'}`,
                      color: isSelected ? '#f5e6b8' : '#d9c3a0',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl p-3" style={{ background: 'rgba(34, 12, 13, 0.52)', border: '1px solid rgba(214, 151, 73, 0.1)' }}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm text-[#d9c3a0]">自定义标签</span>
                <span className="text-xs text-[#a87a5d]">按回车或点击添加</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => {
                    setCustomTagInput(e.target.value);
                    if (tagInputError) {
                      setTagInputError('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="输入你的标签"
                  className="min-w-[180px] flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'rgba(24, 8, 10, 0.82)',
                    borderColor: 'rgba(214, 151, 73, 0.16)',
                    color: '#f5e6b8',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="rounded-xl px-3.5 py-2 text-sm transition-colors"
                  style={{
                    background: 'rgba(214, 151, 73, 0.16)',
                    border: '1px solid rgba(214, 151, 73, 0.24)',
                    color: '#f5e6b8',
                  }}
                >
                  添加标签
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                <span style={{ color: customTagInput.length > MAX_TAG_LENGTH ? '#f97316' : '#6f8799' }}>
                  当前输入 {normalizeTag(customTagInput).length}/{MAX_TAG_LENGTH}
                </span>
                <span className="text-[#6f8799]">可与推荐标签混合使用</span>
              </div>

              {tagInputError ? (
                <p className="mt-2 text-xs text-[#fca5a5]">{tagInputError}</p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => {
                  const isPreset = availableTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full px-3 py-1.5 text-xs transition-all"
                      style={{
                        background: isPreset ? 'rgba(214, 151, 73, 0.22)' : 'rgba(176, 83, 39, 0.22)',
                        border: `1px solid ${isPreset ? 'rgba(214, 151, 73, 0.34)' : 'rgba(249, 115, 22, 0.28)'}`,
                        color: '#f5e6b8',
                      }}
                    >
                      #{tag} ×
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-[#6f8799]">还没有选择标签</span>
              )}
            </div>

            {customTags.length > 0 ? (
              <p className="mt-2 text-xs text-[#a87a5d]">已添加自定义标签：{customTags.map((tag) => `#${tag}`).join('、')}</p>
            ) : null}
          </div>

          {validationErrors.length > 0 ? (
            <div
              className="rounded-[22px] border p-4"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
              }}
            >
              <p className="mb-2 text-sm text-[#ef4444]">请先修正以下问题：</p>
              <ul className="space-y-1 text-xs text-[#fca5a5]">
                {validationErrors.map((err, index) => (
                  <li key={index}>- {err}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border p-4"
        style={{
          background: 'rgba(32, 11, 12, 0.82)',
          borderColor: 'rgba(214, 151, 73, 0.12)',
        }}
      >
        <div className="flex flex-wrap gap-2">
          {mode === 'create' ? (
            <button
              onClick={handleSaveDraft}
              className="rounded-xl px-4 py-2 text-sm transition-colors"
              style={{
                background: 'rgba(70, 21, 18, 0.26)',
                border: '1px solid rgba(214, 151, 73, 0.16)',
                color: '#d9c3a0',
              }}
            >
              保存草稿
            </button>
          ) : null}

          {mode === 'edit_draft' ? (
            <>
              <button
                onClick={handleUpdateDraft}
                className="rounded-xl px-4 py-2 text-sm transition-colors"
                style={{
                  background: 'rgba(70, 21, 18, 0.26)',
                  border: '1px solid rgba(214, 151, 73, 0.16)',
                  color: '#d9c3a0',
                }}
              >
                保存修改
              </button>
              {onDeleteDraft ? (
                <button
                  onClick={onDeleteDraft}
                  className="rounded-xl px-4 py-2 text-sm transition-colors"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.22)',
                    color: '#ef4444',
                  }}
                >
                  删除草稿
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        {mode === 'create' ? (
          <button
            onClick={handleSubmit}
            className="rounded-xl px-6 py-2.5 text-sm font-serif transition-colors"
            style={{
              background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))',
              border: '1px solid rgba(214, 151, 73, 0.34)',
              color: '#f5e6b8',
            }}
          >
            发布
          </button>
        ) : null}

        {mode === 'edit_draft' && onPublishDraft ? (
          <button
            onClick={handlePublishDraft}
            className="rounded-xl px-6 py-2.5 text-sm font-serif transition-colors"
            style={{
              background: 'linear-gradient(180deg, rgba(214, 151, 73, 0.28), rgba(176, 83, 39, 0.12))',
              border: '1px solid rgba(214, 151, 73, 0.3)',
              color: '#f2d092',
            }}
          >
            发布草稿
          </button>
        ) : null}

        {mode === 'edit_post' ? (
          <button
            onClick={handleUpdatePost}
            className="rounded-xl px-6 py-2.5 text-sm font-serif transition-colors"
            style={{
              background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))',
              border: '1px solid rgba(214, 151, 73, 0.34)',
              color: '#f5e6b8',
            }}
          >
            保存修改
          </button>
        ) : null}
      </div>
    </div>
  );
}
