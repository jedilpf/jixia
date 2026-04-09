import { useState } from 'react';
import type { CommunityCategory, CommunityDraft, CommunityComposerMode, CommunityPost } from '../../community/types';
import { COMMUNITY_CATEGORIES, CATEGORY_TAG_MAP } from '../../community/types';
import { validatePostInput } from '../../community/moderation';

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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const availableTags = CATEGORY_TAG_MAP[category] || [];
  const isEdit = mode === 'edit_draft' || mode === 'edit_post';

  const handleCategoryChange = (newCategory: CommunityCategory) => {
    if (!isEdit) {
      setSelectedTags([]);
    }
    setCategory(newCategory);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    const result = validatePostInput({
      title,
      content,
      tags: selectedTags,
      imageUrls: [],
      category,
    });

    if (!result.passed) {
      setValidationErrors(result.errors);
      return;
    }

    setValidationErrors([]);
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
      sourcePostId: isEdit ? (initialPost?.id || null) : null,
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

    const result = validatePostInput({
      title,
      content,
      tags: selectedTags,
      imageUrls: [],
      category,
    });

    if (!result.passed) {
      setValidationErrors(result.errors);
      return;
    }

    setValidationErrors([]);
    onUpdatePost({ title, content, tags: selectedTags });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: 'rgba(212, 165, 32, 0.1)',
            border: '1px solid rgba(212, 165, 32, 0.3)',
            color: '#a7c5ba',
          }}
        >
          ← 返回
        </button>
        <span className="text-sm font-serif" style={{ color: '#f5e6b8' }}>
          {mode === 'create' ? '发布新帖' : mode === 'edit_draft' ? '编辑草稿' : '编辑帖子'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div>
          <label className="block text-sm mb-2" style={{ color: '#a7c5ba' }}>选择板块</label>
          <div className="flex flex-wrap gap-2">
            {COMMUNITY_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id as CommunityCategory)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={{
                    background: isActive ? 'rgba(212, 165, 32, 0.2)' : 'rgba(16, 25, 46, 0.6)',
                    border: `1px solid ${isActive ? 'rgba(212, 165, 32, 0.5)' : 'rgba(212, 165, 32, 0.2)'}`,
                    color: isActive ? '#f5e6b8' : '#a7c5ba',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#a7c5ba' }}>
            标题 <span style={{ color: '#f97316' }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入标题（6-50字）"
            className="w-full px-4 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'rgba(16, 25, 46, 0.8)',
              border: '1px solid rgba(212, 165, 32, 0.3)',
              color: '#f5e6b8',
            }}
          />
          <div className="text-xs mt-1 text-right" style={{ color: title.length > 50 ? '#f97316' : '#6b7280' }}>
            {title.length}/50
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#a7c5ba' }}>
            正文 <span style={{ color: '#f97316' }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请输入正文内容（10-5000字）"
            rows={10}
            className="w-full px-4 py-3 rounded-lg text-sm resize-none outline-none"
            style={{
              background: 'rgba(16, 25, 46, 0.8)',
              border: '1px solid rgba(212, 165, 32, 0.3)',
              color: '#f5e6b8',
            }}
          />
          <div className="text-xs mt-1 text-right" style={{ color: content.length > 5000 ? '#f97316' : '#6b7280' }}>
            {content.length}/5000
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#a7c5ba' }}>标签（可选，最多5个）</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{
                    background: isSelected ? 'rgba(212, 165, 32, 0.3)' : 'rgba(16, 25, 46, 0.6)',
                    border: `1px solid ${isSelected ? 'rgba(212, 165, 32, 0.5)' : 'rgba(212, 165, 32, 0.2)'}`,
                    color: isSelected ? '#f5e6b8' : '#a7c5ba',
                  }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <p className="text-sm mb-1" style={{ color: '#ef4444' }}>请修正以下问题：</p>
            <ul className="text-xs space-y-1" style={{ color: '#ef4444' }}>
              {validationErrors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'rgba(212, 165, 32, 0.2)' }}>
        <div className="flex gap-2">
          {mode === 'create' && (
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: 'rgba(16, 25, 46, 0.8)',
                border: '1px solid rgba(212, 165, 32, 0.3)',
                color: '#a7c5ba',
              }}
            >
              保存草稿
            </button>
          )}
          {mode === 'edit_draft' && (
            <>
              <button
                onClick={handleUpdateDraft}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: 'rgba(16, 25, 46, 0.8)',
                  border: '1px solid rgba(212, 165, 32, 0.3)',
                  color: '#a7c5ba',
                }}
              >
                保存修改
              </button>
              {onDeleteDraft && (
                <button
                  onClick={onDeleteDraft}
                  className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }}
                >
                  删除草稿
                </button>
              )}
            </>
          )}
        </div>
        {mode === 'create' && (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg text-sm font-serif transition-colors"
            style={{
              background: 'rgba(212, 165, 32, 0.2)',
              border: '1px solid rgba(212, 165, 32, 0.5)',
              color: '#f5e6b8',
            }}
          >
            发布
          </button>
        )}
        {mode === 'edit_draft' && onPublishDraft && (
          <button
            onClick={handlePublishDraft}
            className="px-6 py-2 rounded-lg text-sm font-serif transition-colors"
            style={{
              background: 'rgba(74, 175, 80, 0.2)',
              border: '1px solid rgba(74, 175, 80, 0.5)',
              color: '#4ade80',
            }}
          >
            发布草稿
          </button>
        )}
        {mode === 'edit_post' && (
          <button
            onClick={handleUpdatePost}
            className="px-6 py-2 rounded-lg text-sm font-serif transition-colors"
            style={{
              background: 'rgba(212, 165, 32, 0.2)',
              border: '1px solid rgba(212, 165, 32, 0.5)',
              color: '#f5e6b8',
            }}
          >
            保存修改
          </button>
        )}
      </div>
    </div>
  );
}
