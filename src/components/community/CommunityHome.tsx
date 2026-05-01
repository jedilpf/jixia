import { useEffect, useState, type ReactNode } from 'react';
import type { CommunityDraft } from '../../community/types';
import { CommunityCategoryTabs } from './CommunityCategoryTabs';
import { CommunityComposer } from './CommunityComposer';
import { CommunityDraftsList } from './CommunityDraftsList';
import { CommunityEmptyState } from './CommunityEmptyState';
import { CommunityPostDetail } from './CommunityPostDetail';
import { CommunityPostList } from './CommunityPostList';
import { IconAward, IconBambooSlips, IconBrush } from '@/components/common/JixiaIcons';
import { useCommunityState } from '../../hooks/useCommunityState';

function Surface({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(49, 20, 17, 0.9) 0%, rgba(24, 9, 11, 0.92) 100%)',
        borderColor: 'rgba(214, 151, 73, 0.14)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </div>
  );
}

export function CommunityHome() {
  const { ui, runtime, visiblePosts, selectedPost, actions, getMergedComment, canPost, nextPostTimeRemaining } = useCommunityState();
  const [searchInput, setSearchInput] = useState(ui.searchQuery);

  useEffect(() => {
    setSearchInput(ui.searchQuery);
  }, [ui.searchQuery]);

  const handleSearch = () => {
    actions.setSearchQuery(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCurrentDraft = (): CommunityDraft | null => {
    if (!ui.activeDraftId) return null;
    return runtime.drafts.find((draft) => draft.id === ui.activeDraftId) || null;
  };

  if (ui.view === 'composer') {
    const currentDraft = getCurrentDraft();
    const editingPost =
      ui.composerMode === 'edit_post' && ui.selectedPostId
        ? runtime.userPosts.find((post) => post.id === ui.selectedPostId) || null
        : null;

    return (
      <CommunityComposer
        mode={ui.composerMode}
        initialDraft={ui.composerMode === 'edit_draft' ? currentDraft : null}
        initialPost={editingPost}
        canPost={canPost}
        nextPostTimeRemaining={nextPostTimeRemaining}
        onSubmit={(input) => {
          if (ui.composerMode === 'edit_draft') return;
          const result = actions.createPost(input);
          if (result) actions.openHome();
        }}
        onSaveDraft={(draftInput) => {
          actions.saveCurrentDraft({
            ...draftInput,
            summary: draftInput.content.slice(0, 80),
          });
          return '';
        }}
        onUpdateDraft={(draftId, draftInput) => {
          actions.updateCurrentDraft(draftId, {
            ...draftInput,
            summary: draftInput.content.slice(0, 80),
          });
        }}
        onPublishDraft={(draftId) => {
          const postId = actions.publishDraft(draftId);
          if (postId) actions.openHome();
        }}
        onBack={() => actions.goBack()}
        onDeleteDraft={() => {
          if (ui.activeDraftId) {
            actions.deleteDraft(ui.activeDraftId);
            actions.goBack();
          }
        }}
        onUpdatePost={(input) => {
          if (ui.selectedPostId) {
            actions.updatePost(ui.selectedPostId, input);
            actions.openHome();
          }
        }}
      />
    );
  }

  if (ui.view === 'detail' && selectedPost) {
    const rawComments = runtime.commentsByPostId[selectedPost.id] || [];
    const comments = rawComments.map(getMergedComment);

    return (
      <CommunityPostDetail
        post={selectedPost}
        comments={comments}
        isLiked={runtime.interactions.likedPostIds.includes(selectedPost.id)}
        isFavorited={runtime.interactions.favoritedPostIds.includes(selectedPost.id)}
        likedCommentIds={runtime.interactions.likedCommentIds}
        onBack={() => actions.goBack()}
        onLike={() => actions.togglePostLike(selectedPost.id)}
        onFavorite={() => actions.togglePostFavorite(selectedPost.id)}
        onAddComment={(content, parentId) => {
          actions.addCommentToPost(selectedPost.id, content, parentId);
        }}
        onLikeComment={(commentId) => actions.toggleCommentLike(selectedPost.id, commentId)}
        onAcceptAnswer={(commentId) => {
          actions.acceptAnswerToPost(selectedPost.id, commentId);
        }}
      />
    );
  }

  if (ui.view === 'drafts') {
    return (
      <CommunityDraftsList
        drafts={runtime.drafts}
        onEditDraft={(draftId) => actions.openComposer('edit_draft', draftId)}
        onDeleteDraft={(draftId) => actions.deleteDraft(draftId)}
        onPublishDraft={(draftId) => {
          const postId = actions.publishDraft(draftId);
          if (postId) actions.openHome();
        }}
        onBack={() => actions.goBack()}
      />
    );
  }

  if (ui.view === 'my_posts' || ui.view === 'favorites') {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <Surface className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => actions.goBack()}
                className="rounded-xl px-3 py-2 text-sm"
                style={{
                  background: 'rgba(212, 165, 32, 0.1)',
                  border: '1px solid rgba(212, 165, 32, 0.24)',
                  color: '#d9c3a0',
                }}
              >
                返回
              </button>
              <div className="flex flex-col">
                <span className="font-serif text-[#f5e6b8]">
                  {ui.view === 'my_posts' ? '我的帖子' : '我的收藏'}
                </span>
                <span className="text-xs text-[#b89372]">
                  {ui.view === 'my_posts' ? '查看你发布过的内容' : '集中查看你保存下来的内容'}
                </span>
              </div>
            </div>
          </div>
        </Surface>

        <Surface className="flex-1 min-h-0 overflow-hidden p-4">
          {visiblePosts.length === 0 ? (
            <CommunityEmptyState
              icon={ui.view === 'my_posts' ? <IconBambooSlips size={32} color="#d4a520" /> : <IconAward size={32} color="#d4a520" />}
              title={ui.view === 'my_posts' ? '暂无帖子' : '暂无收藏'}
              message={ui.view === 'my_posts' ? '去发布你的第一篇内容吧。' : '收藏你感兴趣的内容后，它们会出现在这里。'}
            />
          ) : (
            <CommunityPostList
              posts={visiblePosts}
              likedPostIds={runtime.interactions.likedPostIds}
              favoritedPostIds={runtime.interactions.favoritedPostIds}
              onPostClick={(postId) => {
                actions.openPost(postId);
                actions.markViewed(postId);
              }}
              onLike={(postId) => actions.togglePostLike(postId)}
              onFavorite={(postId) => actions.togglePostFavorite(postId)}
              sortMode={ui.sortMode}
              onSortChange={(mode) => actions.setSortMode(mode)}
            />
          )}
        </Surface>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-4">
      {/* 竹简搜索栏 + 签牌按钮 */}
      <div
        className="relative rounded-sm px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, rgba(32, 14, 10, 0.88) 0%, rgba(20, 9, 7, 0.92) 100%)',
          border: '1px solid rgba(139, 90, 43, 0.28)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {/* 竹简纹理线 */}
        <div className="absolute left-4 right-4 top-1/2 h-px opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(139, 90, 43, 0.6), transparent)' }} />

        <div className="flex flex-col gap-3">
          {/* 搜索行 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 竹简搜索框 */}
            <div className="flex min-w-[200px] flex-1 items-center gap-2">
              <div
                className="relative flex flex-1 items-center"
                style={{
                  background: 'rgba(24, 10, 8, 0.7)',
                  border: '1px solid rgba(139, 90, 43, 0.25)',
                  borderRadius: '2px',
                }}
              >
                {/* 搜索图标（放大镜改为古风） */}
                <span className="px-3 text-[#8b5a2b] font-serif">寻</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="章句关键词..."
                  className="flex-1 py-2 pr-3 text-sm outline-none"
                  style={{
                    background: 'transparent',
                    color: '#f5e6b8',
                  }}
                />
              </div>

              <button
                onClick={handleSearch}
                className="px-4 py-2 text-sm font-serif"
                style={{
                  background: 'linear-gradient(180deg, rgba(139, 90, 43, 0.25), rgba(100, 60, 30, 0.2))',
                  border: '1px solid rgba(139, 90, 43, 0.35)',
                  color: '#d4a520',
                  borderRadius: '2px',
                }}
              >
                查阅
              </button>
            </div>

            {/* 统计显示 */}
            <div className="flex items-center gap-3 text-xs font-serif">
              <span className="text-[#b89372]">帖 <span className="text-[#d4a520]">{visiblePosts.length}</span></span>
              <span className="text-[#8b5a2b]/50">|</span>
              <span className="text-[#b89372]">稿 <span className="text-[#d4a520]">{runtime.drafts.length}</span></span>
            </div>

            {/* 签牌按钮组 */}
            <div className="flex flex-wrap items-center gap-2">
              {runtime.drafts.length > 0 ? (
                <button
                  onClick={() => actions.openDrafts()}
                  className="relative px-3 py-2 text-xs font-serif"
                  style={{
                    background: 'rgba(212, 165, 32, 0.08)',
                    border: '1px solid rgba(212, 165, 32, 0.22)',
                    color: '#e7c484',
                    borderRadius: '2px',
                    boxShadow: '0 2px 0 rgba(139, 90, 43, 0.3)',
                  }}
                >
                  草稿
                  <span
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-serif"
                    style={{ background: '#d69849', color: '#2a130d', borderRadius: '2px' }}
                  >
                    {runtime.drafts.length}
                  </span>
                </button>
              ) : null}

              <button
                onClick={() => actions.openMyPosts()}
                className="px-3 py-2 text-xs font-serif"
                style={{
                  background: 'rgba(70, 21, 18, 0.2)',
                  border: '1px solid rgba(139, 90, 43, 0.2)',
                  color: '#d9c3a0',
                  borderRadius: '2px',
                  boxShadow: '0 2px 0 rgba(139, 90, 43, 0.25)',
                }}
              >
                我的
              </button>

              <button
                onClick={() => actions.openFavorites()}
                className="px-3 py-2 text-xs font-serif"
                style={{
                  background: 'rgba(70, 21, 18, 0.2)',
                  border: '1px solid rgba(139, 90, 43, 0.2)',
                  color: '#d9c3a0',
                  borderRadius: '2px',
                  boxShadow: '0 2px 0 rgba(139, 90, 43, 0.25)',
                }}
              >
                收藏
              </button>

              {/* 发帖签牌 - 主操作 */}
              <button
                onClick={() => actions.openComposer('create')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-serif"
                style={{
                  background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.35), rgba(139, 90, 43, 0.2))',
                  border: '2px solid rgba(212, 165, 32, 0.45)',
                  color: '#f5e6b8',
                  borderRadius: '2px',
                  boxShadow: '0 3px 0 rgba(139, 90, 43, 0.4), 0 6px 12px rgba(122,42,28,0.25)',
                }}
              >
                <IconBrush size={20} color="#d4a520" />
                <span>提笔</span>
              </button>
            </div>
          </div>

          {/* 分类标签行 */}
          <CommunityCategoryTabs selected={ui.selectedCategory} onSelect={(cat) => actions.setCategory(cat)} />
        </div>
      </div>

      {/* 帖子列表区 */}
      <Surface className="flex-1 min-h-0 overflow-hidden p-4">
        <CommunityPostList
          posts={visiblePosts}
          likedPostIds={runtime.interactions.likedPostIds}
          favoritedPostIds={runtime.interactions.favoritedPostIds}
          onPostClick={(postId) => {
            actions.openPost(postId);
            actions.markViewed(postId);
          }}
          onLike={(postId) => actions.togglePostLike(postId)}
          onFavorite={(postId) => actions.togglePostFavorite(postId)}
          sortMode={ui.sortMode}
          onSortChange={(mode) => actions.setSortMode(mode)}
        />
      </Surface>
    </div>
  );
}
