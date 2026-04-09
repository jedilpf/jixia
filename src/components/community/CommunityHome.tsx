import { useState, useEffect } from 'react';
import type { CommunityDraft } from '../../community/types';
import { CommunityCategoryTabs } from './CommunityCategoryTabs';
import { CommunityPostList } from './CommunityPostList';
import { CommunityPostDetail } from './CommunityPostDetail';
import { CommunityComposer } from './CommunityComposer';
import { CommunityDraftsList } from './CommunityDraftsList';
import { CommunityEmptyState } from './CommunityEmptyState';
import { useCommunityState } from '../../hooks/useCommunityState';

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
    return runtime.drafts.find(d => d.id === ui.activeDraftId) || null;
  };

  if (ui.view === 'composer') {
    const currentDraft = getCurrentDraft();
    const editingPost = ui.composerMode === 'edit_post' && ui.selectedPostId
      ? runtime.userPosts.find(p => p.id === ui.selectedPostId) || null
      : null;

    return (
      <CommunityComposer
        mode={ui.composerMode}
        initialDraft={ui.composerMode === 'edit_draft' ? currentDraft : null}
        initialPost={editingPost}
        onSubmit={(input) => {
          if (ui.composerMode === 'edit_draft') {
            return;
          }
          const result = actions.createPost(input);
          if (result) {
            actions.openHome();
          }
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
          if (postId) {
            actions.openHome();
          }
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
          if (postId) {
            actions.openHome();
          }
        }}
        onBack={() => actions.goBack()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="搜索帖子..."
            className="px-3 py-1.5 rounded-lg text-sm flex-1 max-w-[200px] outline-none"
            style={{
              background: 'rgba(16, 25, 46, 0.8)',
              border: '1px solid rgba(212, 165, 32, 0.3)',
              color: '#f5e6b8',
            }}
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(212, 165, 32, 0.1)',
              border: '1px solid rgba(212, 165, 32, 0.3)',
              color: '#a7c5ba',
            }}
          >
            🔍
          </button>
        </div>

        <div className="flex gap-2">
          {runtime.drafts.length > 0 && (
            <button
              onClick={() => actions.openDrafts()}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors relative"
              style={{
                background: 'rgba(212, 165, 32, 0.1)',
                border: '1px solid rgba(212, 165, 32, 0.3)',
                color: '#d4a520',
              }}
            >
              📁 草稿箱
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{ background: '#d4a520', color: '#10192e' }}
              >
                {runtime.drafts.length}
              </span>
            </button>
          )}
          <button
            onClick={() => actions.openMyPosts()}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(212, 165, 32, 0.1)',
              border: '1px solid rgba(212, 165, 32, 0.3)',
              color: '#a7c5ba',
            }}
          >
            📝 我的帖子
          </button>
          <button
            onClick={() => actions.openFavorites()}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              background: 'rgba(212, 165, 32, 0.1)',
              border: '1px solid rgba(212, 165, 32, 0.3)',
              color: '#a7c5ba',
            }}
          >
            ⭐ 收藏
          </button>
        </div>

        <button
          onClick={() => actions.openComposer('create')}
          className="px-4 py-1.5 rounded-lg text-sm font-serif transition-colors"
          style={{
            background: 'rgba(212, 165, 32, 0.2)',
            border: '1px solid rgba(212, 165, 32, 0.4)',
            color: '#f5e6b8',
          }}
        >
          + 发布
        </button>
      </div>

      {ui.view === 'my_posts' || ui.view === 'favorites' ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => actions.openHome()}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{
                background: 'rgba(212, 165, 32, 0.1)',
                border: '1px solid rgba(212, 165, 32, 0.3)',
                color: '#a7c5ba',
              }}
            >
              ← 返回
            </button>
            <span style={{ color: '#f5e6b8' }}>
              {ui.view === 'my_posts' ? '我的帖子' : '我的收藏'}
            </span>
          </div>
          <div className="flex-1">
            {visiblePosts.length === 0 ? (
              <CommunityEmptyState
                icon={ui.view === 'my_posts' ? '📝' : '⭐'}
                title={ui.view === 'my_posts' ? '暂无帖子' : '暂无收藏'}
                message={ui.view === 'my_posts' ? '快去发布你的第一篇帖子吧' : '收藏感兴趣的内容吧'}
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
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <CommunityCategoryTabs
              selected={ui.selectedCategory}
              onSelect={(cat) => actions.setCategory(cat)}
            />
          </div>

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
        </>
      )}
    </div>
  );
}
