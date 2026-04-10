import { useEffect, useState, type ReactNode } from 'react';
import type { CommunityDraft } from '../../community/types';
import { CommunityCategoryTabs } from './CommunityCategoryTabs';
import { CommunityComposer } from './CommunityComposer';
import { CommunityDraftsList } from './CommunityDraftsList';
import { CommunityEmptyState } from './CommunityEmptyState';
import { CommunityPostDetail } from './CommunityPostDetail';
import { CommunityPostList } from './CommunityPostList';
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
  const { ui, runtime, visiblePosts, selectedPost, actions, getMergedComment } = useCommunityState();
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
              icon={ui.view === 'my_posts' ? '📄' : '⭐'}
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
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <Surface className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#c89b72]">
              <span>community board</span>
              <span className="h-px w-10 bg-[rgba(212,165,32,0.18)]" />
            </div>
            <h2 className="mb-2 font-serif text-2xl text-[#f5e6b8]">围绕稷下论场的讨论与沉淀</h2>
            <p className="text-sm leading-7 text-[#d9c3a0]">
              这里汇集论道、战报、问答与文苑内容。先浏览已有讨论，或者直接发布你的新帖。
            </p>
          </div>

          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div
              className="rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(39, 14, 14, 0.72)', borderColor: 'rgba(214, 151, 73, 0.12)' }}
            >
              <div className="text-xs uppercase tracking-[0.16em] text-[#a87a5d]">posts</div>
              <div className="mt-1 text-xl font-serif text-[#f5e6b8]">{visiblePosts.length}</div>
            </div>
            <div
              className="rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(39, 14, 14, 0.72)', borderColor: 'rgba(214, 151, 73, 0.12)' }}
            >
              <div className="text-xs uppercase tracking-[0.16em] text-[#a87a5d]">drafts</div>
              <div className="mt-1 text-xl font-serif text-[#f5e6b8]">{runtime.drafts.length}</div>
            </div>
          </div>
        </div>
      </Surface>

      <Surface className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] flex-1 items-center gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索帖子..."
                className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{
                  background: 'rgba(34, 12, 13, 0.8)',
                  borderColor: 'rgba(214, 151, 73, 0.18)',
                  color: '#f5e6b8',
                }}
              />
              <button
                onClick={handleSearch}
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.3), rgba(214, 151, 73, 0.12))',
                  border: '1px solid rgba(214, 151, 73, 0.3)',
                  color: '#f5e6b8',
                }}
              >
                搜索
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {runtime.drafts.length > 0 ? (
                <button
                  onClick={() => actions.openDrafts()}
                  className="relative rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: 'rgba(212, 165, 32, 0.08)',
                    border: '1px solid rgba(212, 165, 32, 0.22)',
                    color: '#e7c484',
                  }}
                >
                  草稿箱
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px]"
                    style={{ background: '#d69849', color: '#2a130d' }}
                  >
                    {runtime.drafts.length}
                  </span>
                </button>
              ) : null}

              <button
                onClick={() => actions.openMyPosts()}
                className="rounded-xl px-3 py-2 text-sm"
                style={{
                  background: 'rgba(70, 21, 18, 0.26)',
                  border: '1px solid rgba(214, 151, 73, 0.16)',
                  color: '#d9c3a0',
                }}
              >
                我的帖子
              </button>

              <button
                onClick={() => actions.openFavorites()}
                className="rounded-xl px-3 py-2 text-sm"
                style={{
                  background: 'rgba(70, 21, 18, 0.26)',
                  border: '1px solid rgba(214, 151, 73, 0.16)',
                  color: '#d9c3a0',
                }}
              >
                我的收藏
              </button>

              <button
                onClick={() => actions.openComposer('create')}
                className="rounded-xl px-4 py-2 text-sm font-serif"
                style={{
                  background: 'linear-gradient(180deg, rgba(176, 83, 39, 0.34), rgba(214, 151, 73, 0.12))',
                  border: '1px solid rgba(214, 151, 73, 0.34)',
                  color: '#f5e6b8',
                }}
              >
                发帖
              </button>
            </div>
          </div>

          <CommunityCategoryTabs selected={ui.selectedCategory} onSelect={(cat) => actions.setCategory(cat)} />
        </div>
      </Surface>

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
