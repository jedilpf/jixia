import { useEffect, useState, type ReactNode } from 'react';
import type { CommunityDraft, CommunitySortMode } from '../../community/types';
import { CommunityCategoryTabs } from './CommunityCategoryTabs';
import { CommunityComposer } from './CommunityComposer';
import { CommunityDraftsList } from './CommunityDraftsList';
import { CommunityEmptyState } from './CommunityEmptyState';
import { CommunityPostDetail } from './CommunityPostDetail';
import { CommunityPostList } from './CommunityPostList';
import { 
  IconAward, 
  IconBambooSlips, 
  IconBrush, 
  IconSeek, 
  IconTalk, 
  IconCrossSwords, 
  IconChronicle,
  IconCheck
} from '@/components/common/JixiaIcons';
import { useCommunityState } from '../../hooks/useCommunityState';

/**
 * 侧边导航项 - 增加悬浮动效
 */
function NavItem({ icon, label, active, onClick, count }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void; count?: number; }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-[#D4AF65]/15 text-[#D4AF65] shadow-[0_4px_12px_rgba(212,175,101,0.1)]' 
          : 'text-[#f6e4c3]/30 hover:text-[#f6e4c3]/80 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_#D4AF65]' : 'group-hover:scale-105'}`}>
          {icon}
        </div>
        <span className="text-[13px] font-serif tracking-[0.1em]">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#831843] text-white font-black">{count}</span>
      )}
    </button>
  );
}

export function CommunityHome() {
  const { ui, runtime, visiblePosts, selectedPost, actions, getMergedComment, canPost, nextPostTimeRemaining } = useCommunityState();
  const [searchInput, setSearchInput] = useState(ui.searchQuery);

  useEffect(() => {
    setSearchInput(ui.searchQuery);
  }, [ui.searchQuery]);

  const handleSearch = () => actions.setSearchQuery(searchInput);
  const handleSearchKeyDown = (e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch();

  const getCurrentDraft = (): CommunityDraft | null => {
    if (!ui.activeDraftId) return null;
    return runtime.drafts.find((draft) => draft.id === ui.activeDraftId) || null;
  };

  // --- 视图分发 ---
  if (ui.view === 'composer') {
    const currentDraft = getCurrentDraft();
    return (
      <CommunityComposer
        mode={ui.composerMode}
        initialDraft={ui.composerMode === 'edit_draft' ? currentDraft : null}
        initialPost={ui.composerMode === 'edit_post' ? runtime.userPosts.find(p => p.id === ui.selectedPostId) || null : null}
        canPost={canPost}
        nextPostTimeRemaining={nextPostTimeRemaining}
        onSubmit={input => { if (ui.composerMode !== 'edit_draft') actions.createPost(input) && actions.openHome(); }}
        onSaveDraft={input => { actions.saveCurrentDraft({ ...input, summary: input.content.slice(0, 80) }); return ''; }}
        onUpdateDraft={(id, input) => actions.updateCurrentDraft(id, { ...input, summary: input.content.slice(0, 80) })}
        onPublishDraft={id => actions.publishDraft(id) && actions.openHome()}
        onBack={() => actions.goBack()}
        onDeleteDraft={() => { if(ui.activeDraftId) { actions.deleteDraft(ui.activeDraftId); actions.goBack(); } }}
        onUpdatePost={input => { if(ui.selectedPostId) { actions.updatePost(ui.selectedPostId, input); actions.openHome(); } }}
      />
    );
  }

  if (ui.view === 'detail' && selectedPost) {
    return (
      <CommunityPostDetail
        post={selectedPost}
        comments={(runtime.commentsByPostId[selectedPost.id] || []).map(getMergedComment)}
        isLiked={runtime.interactions.likedPostIds.includes(selectedPost.id)}
        isFavorited={runtime.interactions.favoritedPostIds.includes(selectedPost.id)}
        likedCommentIds={runtime.interactions.likedCommentIds}
        onBack={() => actions.goBack()}
        onLike={() => actions.togglePostLike(selectedPost.id)}
        onFavorite={() => actions.togglePostFavorite(selectedPost.id)}
        onAddComment={(content, parentId) => actions.addCommentToPost(selectedPost.id, content, parentId)}
        onLikeComment={id => actions.toggleCommentLike(selectedPost.id, id)}
        onAcceptAnswer={id => actions.acceptAnswerToPost(selectedPost.id, id)}
      />
    );
  }

  if (ui.view === 'drafts') {
    return (
      <CommunityDraftsList
        drafts={runtime.drafts}
        onEditDraft={id => actions.openComposer('edit_draft', id)}
        onDeleteDraft={id => actions.deleteDraft(id)}
        onPublishDraft={id => actions.publishDraft(id) && actions.openHome()}
        onBack={() => actions.goBack()}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-transparent overflow-hidden">
      {/* 左侧：窄化侧边栏 (Narrower Sidebar) */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/5 bg-[#0a0503]/20 backdrop-blur-sm p-5">
        <div className="mb-10 px-2">
          <h1 className="font-serif text-xl text-[#f6e4c3] tracking-[0.2em]">百家文库</h1>
          <div className="h-px w-8 bg-[#D4AF65] mt-2 opacity-30" />
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          <NavItem icon={<IconBambooSlips size={16} />} label="综合卷轴" active={ui.selectedCategory === 'all'} onClick={() => actions.setCategory('all')} />
          <NavItem icon={<IconTalk size={16} />} label="百家论道" active={ui.selectedCategory === 'discussion'} onClick={() => actions.setCategory('discussion')} />
          <NavItem icon={<IconCrossSwords size={16} />} label="复盘研究" active={ui.selectedCategory === 'battle_report'} onClick={() => actions.setCategory('battle_report')} />
          <NavItem icon={<IconSeek size={16} />} label="寻章问难" active={ui.selectedCategory === 'qa'} onClick={() => actions.setCategory('qa')} />
          <NavItem icon={<IconChronicle size={16} />} label="典籍文化" active={ui.selectedCategory === 'culture'} onClick={() => actions.setCategory('culture')} />

          <div className="h-px bg-white/5 my-6 mx-2" />
          
          <NavItem icon={<IconCheck size={16} />} label="我的发布" active={ui.view === 'my_posts'} onClick={() => actions.openMyPosts()} />
          <NavItem icon={<IconBrush size={16} />} label="草稿箱" active={ui.view === 'drafts'} onClick={() => actions.openDrafts()} count={runtime.drafts.length} />
          <NavItem icon={<IconAward size={16} />} label="我的收藏" active={ui.view === 'favorites'} onClick={() => actions.openFavorites()} />
        </div>

        <button
          onClick={() => actions.openComposer('create')}
          className="mt-6 w-full flex items-center justify-center gap-3 py-3.5 bg-[#D4AF65] text-[#0a0503] rounded-xl shadow-[0_0_20px_rgba(212,175,101,0.15)] hover:bg-[#E5C380] transition-all"
        >
          <IconBrush size={18} />
          <span className="font-serif font-bold text-sm tracking-widest">提笔论道</span>
        </button>
      </aside>

      {/* 右侧：视野中心化内容区 (Centered Content Area) */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* 固定顶部工具栏 - 更紧凑 */}
        <header className="h-16 shrink-0 flex items-center justify-center px-10 border-b border-white/5 bg-[#0a0503]/10">
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="relative group w-64">
              <IconSeek size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f6e4c3]/20 group-focus-within:text-[#D4AF65] transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="查阅文库..."
                className="w-full h-9 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 text-xs text-[#f6e4c3] outline-none focus:border-[#D4AF65]/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black tracking-widest text-[#f6e4c3]/20 uppercase">Sort By</span>
              <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
                <button onClick={() => actions.setSortMode('latest')} className={`px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-md transition-all ${ui.sortMode === 'latest' ? 'bg-[#D4AF65] text-[#0a0503]' : 'text-[#f6e4c3]/40'}`}>最新</button>
                <button onClick={() => actions.setSortMode('hot')} className={`px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-md transition-all ${ui.sortMode === 'hot' ? 'bg-[#D4AF65] text-[#0a0503]' : 'text-[#f6e4c3]/40'}`}>热议</button>
              </div>
            </div>
          </div>
        </header>

        {/* 内容主体 - 视野中心对齐 */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="max-w-4xl mx-auto px-10 py-10">
             {visiblePosts.length === 0 ? (
               <CommunityEmptyState icon={<IconBambooSlips size={48} color="rgba(212,175,101,0.05)" />} title="Archive Silent" message="No wisdom recorded in this sector yet." />
             ) : (
               <CommunityPostList
                 posts={visiblePosts}
                 likedPostIds={runtime.interactions.likedPostIds}
                 favoritedPostIds={runtime.interactions.favoritedPostIds}
                 onPostClick={id => { actions.openPost(id); actions.markViewed(id); }}
                 onLike={id => actions.togglePostLike(id)}
                 onFavorite={id => actions.togglePostFavorite(id)}
               />
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
