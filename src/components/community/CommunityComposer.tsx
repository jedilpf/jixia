import { 
  IconTalk, 
  IconCrossSwords, 
  IconSeek, 
  IconChronicle, 
  IconWait 
} from '@/components/common/JixiaIcons';
import { useMemo, useState } from 'react';
import type { CommunityCategory, CommunityComposerMode, CommunityDraft, CommunityPost } from '../../community/types';
import { CATEGORY_TAG_MAP, COMMUNITY_CATEGORIES } from '../../community/types';
import { validatePostInput } from '../../community/moderation';

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

// 格式化剩余时间（毫秒 → 分:秒）
function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#+/, '').trim();
}

function CategoryIcon({ id, color }: { id: string; color: string }) {
    switch(id) {
        case 'discussion': return <IconTalk size={14} color={color} />;
        case 'battle_report': return <IconCrossSwords size={14} color={color} />;
        case 'qa': return <IconSeek size={14} color={color} />;
        case 'culture': return <IconChronicle size={14} color={color} />;
        default: return null;
    }
}

interface CommunityComposerProps {
  mode: CommunityComposerMode;
  initialDraft?: CommunityDraft | null;
  initialPost?: CommunityPost | null;
  canPost?: boolean; // 是否可以发布新帖
  nextPostTimeRemaining?: number; // 距离下次可发布的剩余时间（毫秒）
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
  canPost = true,
  nextPostTimeRemaining = 0,
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
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      {/* 顶部标题栏 */}
      <div
        className="rounded-3xl border p-6"
        style={{
          background: 'rgba(10, 5, 3, 0.6)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(212, 175, 101, 0.15)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={onBack}
              className="px-4 py-1.5 text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/60 rounded-lg hover:bg-white/10 transition-all"
            >
              Back
            </button>
            <div className="flex flex-col">
              <span className="font-serif text-xl text-[#f6e4c3] tracking-wider">{titleText}</span>
              <span className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/20 mt-1">Adjust Sector · Ink the Content · Mark the Scroll</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ overscrollBehavior: 'contain' }}>
        <div className="space-y-5">
          {/* 选择板块 */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: 'rgba(10, 5, 3, 0.4)',
              borderColor: 'rgba(212, 175, 101, 0.1)',
            }}
          >
            <label className="mb-4 block text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/40">Select Sector</label>
            <div className="flex flex-wrap gap-3">
              {COMMUNITY_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id as CommunityCategory)}
                    className="flex items-center gap-3 rounded-xl px-5 py-2.5 text-sm transition-all"
                    style={{
                      background: isActive ? 'rgba(212, 175, 101, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isActive ? 'rgba(212, 175, 101, 0.4)' : 'rgba(212, 175, 101, 0.1)'}`,
                      color: isActive ? '#D4AF65' : '#f6e4c3/40',
                    }}
                  >
                    <CategoryIcon id={cat.id} color={isActive ? '#D4AF65' : 'currentColor'} />
                    <span className="font-serif">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 标题输入 */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: 'rgba(10, 5, 3, 0.4)',
              borderColor: 'rgba(212, 175, 101, 0.1)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
               <label className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/40">Title *</label>
               <span className={`text-[10px] font-mono ${title.length > 50 ? 'text-[#831843]' : 'text-[#f6e4c3]/20'}`}>{title.length}/50</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题..."
              className="w-full bg-transparent border-b border-white/5 py-2 text-xl font-serif text-[#f6e4c3] outline-none placeholder:text-[#f6e4c3]/10"
            />
          </div>

          {/* 正文输入 */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: 'rgba(10, 5, 3, 0.4)',
              borderColor: 'rgba(212, 175, 101, 0.1)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
               <label className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/40">Chronicle Content *</label>
               <span className={`text-[10px] font-mono ${content.length > 5000 ? 'text-[#831843]' : 'text-[#f6e4c3]/20'}`}>{content.length}/5000</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入正文内容..."
              rows={12}
              className="w-full bg-transparent text-base font-serif text-[#f6e4c3]/80 leading-relaxed outline-none placeholder:text-[#f6e4c3]/10 resize-none"
            />
          </div>

          {/* 标签选择 */}
          <div
            className="rounded-3xl border p-6"
            style={{
              background: 'rgba(10, 5, 3, 0.4)',
              borderColor: 'rgba(212, 175, 101, 0.1)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
               <label className="text-[10px] font-black tracking-widest uppercase text-[#f6e4c3]/40">Archive Tags (Max 5)</label>
               <span className="text-[10px] font-mono text-[#D4AF65]">{selectedTags.length}/{MAX_TAGS}</span>
            </div>
            
            <div className="mb-6 flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full transition-all"
                    style={{
                      background: isSelected ? 'rgba(212, 175, 101, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(212, 175, 101, 0.4)' : 'rgba(212, 175, 101, 0.1)'}`,
                      color: isSelected ? '#D4AF65' : '#f6e4c3/40',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => {
                  setCustomTagInput(e.target.value);
                  if (tagInputError) setTagInputError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Custom Tag..."
                className="flex-1 bg-transparent text-sm text-[#f6e4c3] outline-none placeholder:text-[#f6e4c3]/10"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-4 py-1.5 text-[10px] font-black tracking-widest uppercase bg-[#D4AF65]/10 border border-[#D4AF65]/30 text-[#D4AF65] rounded-lg hover:bg-[#D4AF65] hover:text-[#0a0503] transition-all"
              >
                Add
              </button>
            </div>
            
            {tagInputError && <p className="mt-3 text-[10px] text-[#831843] uppercase tracking-widest">{tagInputError}</p>}

            <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-white/5">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-[#831843]/10 border border-[#831843]/30 text-[#831843] rounded-full hover:bg-[#831843] hover:text-white transition-all"
                >
                  #{tag} ×
                </button>
              ))}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="rounded-2xl border border-[#831843]/30 bg-[#831843]/5 p-6">
              <p className="mb-3 text-[10px] font-black tracking-widest uppercase text-[#831843]">Validation Errors</p>
              <ul className="space-y-2">
                {validationErrors.map((err, index) => (
                  <li key={index} className="text-[12px] text-[#f6e4c3]/60 font-serif">• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div
        className="flex items-center justify-between gap-4 rounded-3xl border p-6"
        style={{
          background: 'rgba(10, 5, 3, 0.6)',
          borderColor: 'rgba(212, 175, 101, 0.15)',
        }}
      >
        <div className="flex items-center gap-4">
          {mode === 'create' && (
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2.5 text-[11px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/60 rounded-xl hover:bg-white/10 transition-all"
            >
              Draft
            </button>
          )}

          {mode === 'edit_draft' && (
            <>
              <button
                onClick={handleUpdateDraft}
                className="px-6 py-2.5 text-[11px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-[#f6e4c3]/60 rounded-xl hover:bg-white/10 transition-all"
              >
                Save Changes
              </button>
              {onDeleteDraft && (
                <button
                  onClick={onDeleteDraft}
                  className="px-6 py-2.5 text-[11px] font-black tracking-widest uppercase bg-[#831843]/10 border border-[#831843]/30 text-[#831843] rounded-xl hover:bg-[#831843] hover:text-white transition-all"
                >
                  Dissolve
                </button>
              )}
            </>
          )}
        </div>

        <button
          onClick={mode === 'create' ? handleSubmit : mode === 'edit_draft' ? handlePublishDraft : handleUpdatePost}
          disabled={mode === 'create' && !canPost}
          className="px-10 py-3 text-[11px] font-black tracking-widest uppercase bg-[#D4AF65] text-[#0a0503] rounded-xl shadow-[0_0_30px_rgba(212,175,101,0.2)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
        >
          {mode === 'create' ? (canPost ? 'Publish' : `Wait ${formatRemainingTime(nextPostTimeRemaining)}`) : 'Apply'}
        </button>
      </div>
    </div>
  );
}
