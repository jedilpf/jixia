import { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type {
  CommunityUiState,
  CommunityRuntimeState,
  CommunityPost,
  CommunityComment,
  CommunityCategory,
  CommunitySortMode,
  CommunityComposerMode,
  CommunityDraft,
  CommunityPersistedState,
  CommunityView,
} from '../community/types';
import { SEED_POSTS, SEED_COMMENTS } from '../community/mockData';
import {
  loadCommunityState,
  saveCommunityState,
  addUserPost,
  updateUserPost,
  addComment,
  togglePostLike as togglePostLikeStorage,
  togglePostFavorite as togglePostFavoriteStorage,
  markPostViewed,
  acceptAnswer,
  saveDraft,
  updateDraft,
  deleteDraft as deleteDraftStorage,
  updateMeta,
  saveUiSnapshot,
  generateId,
  updateSeedPostLikeCount,
  updateSeedPostFavoriteCount,
  updateSeedPostCommentCount,
  updateSeedPostViewCount,
  updateSeedCommentLikeCount,
} from '../community/storage';
import {
  filterPosts,
  sortPosts,
  mergePosts,
  getPostById,
  isSeedPost,
  generateSummary,
} from '../community/selectors';
import { validatePostInput, sanitizeContent } from '../community/moderation';

const LOCAL_USER_ID = 'local-user-001';
const LOCAL_USER_NAME = '机枢学徒';

const DEFAULT_UI_STATE: CommunityUiState = {
  view: 'home',
  selectedCategory: 'all',
  sortMode: 'latest',
  selectedPostId: null,
  activeDraftId: null,
  composerMode: 'create',
  searchQuery: '',
  selectedTags: [],
};

function mergeCommentsDeep(
  seed: Record<string, CommunityComment[]>,
  user: Record<string, CommunityComment[]>
): Record<string, CommunityComment[]> {
  const allKeys = new Set([...Object.keys(seed), ...Object.keys(user)]);
  const result: Record<string, CommunityComment[]> = {};

  for (const key of allKeys) {
    const seedList = seed[key] || [];
    const userList = user[key] || [];
    const merged = new Map<string, CommunityComment>();
    seedList.forEach(c => merged.set(c.id, c));
    userList.forEach(c => merged.set(c.id, c));
    result[key] = Array.from(merged.values()).sort((a, b) => a.createdAt - b.createdAt);
  }

  return result;
}

interface CommunityContextValue {
  ui: CommunityUiState;
  runtime: CommunityRuntimeState;
  visiblePosts: CommunityPost[];
  selectedPost: CommunityPost | null;
  hasNewContent: boolean;
  hasDraft: boolean;
  actions: {
    openHome(): void;
    openPost(postId: string): void;
    openComposer(mode?: CommunityComposerMode, draftId?: string | null, postId?: string | null): void;
    openDrafts(): void;
    openMyPosts(): void;
    openFavorites(): void;
    goBack(): void;
    closeCommunity(): void;
    setCategory(category: CommunityCategory | 'all'): void;
    setSortMode(mode: CommunitySortMode): void;
    setSearchQuery(query: string): void;
    setSelectedTags(tags: string[]): void;
    saveCurrentDraft(draft: Omit<CommunityDraft, 'id' | 'updatedAt'>): string;
    updateCurrentDraft(draftId: string, draft: Omit<CommunityDraft, 'id' | 'updatedAt'>): void;
    publishDraft(draftId: string): string | null;
    createPost(input: { title: string; content: string; category: CommunityCategory; tags: string[]; imageUrls: string[] }): string | null;
    updatePost(postId: string, input: { title?: string; content?: string; tags?: string[] }): boolean;
    deletePost(postId: string): boolean;
    togglePostLike(postId: string): void;
    togglePostFavorite(postId: string): void;
    addCommentToPost(postId: string, content: string, parentId?: string | null): string | null;
    toggleCommentLike(postId: string, commentId: string): void;
    acceptAnswerToPost(postId: string, commentId: string): void;
    markViewed(postId: string): void;
    deleteDraft(draftId: string): void;
    clearDraft(draftId: string): void;
    getMyPosts(): CommunityPost[];
    getFavoritePosts(): CommunityPost[];
  };
  getMergedComment: (comment: CommunityComment) => CommunityComment;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);
export { CommunityContext };

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [persistedState, setPersistedState] = useState<CommunityPersistedState>(() => {
    const saved = loadCommunityState();
    return {
      ...saved,
      seedPostCounts: saved.seedPostCounts ?? {},
      uiSnapshot: saved.uiSnapshot ?? {
        category: 'all',
        sortMode: 'latest',
        searchQuery: '',
        selectedTags: [],
      },
    };
  });

  const [ui, setUi] = useState<CommunityUiState>(() => {
    const saved = loadCommunityState();
    return {
      ...DEFAULT_UI_STATE,
      selectedCategory: saved.uiSnapshot?.category ?? 'all',
      sortMode: saved.uiSnapshot?.sortMode ?? 'latest',
      searchQuery: saved.uiSnapshot?.searchQuery ?? '',
      selectedTags: saved.uiSnapshot?.selectedTags ?? [],
    };
  });

  const previousViewRef = useRef<CommunityView>('home');

  useEffect(() => {
    if (ui.view === 'home') {
      previousViewRef.current = 'home';
    }
  }, [ui.view]);

  useEffect(() => {
    saveCommunityState(persistedState);
  }, [persistedState]);

  const goBack = useCallback(() => {
    const prevView = previousViewRef.current;
    setUi(prev => {
      switch (prevView) {
        case 'detail':
          return { ...prev, view: 'detail', selectedPostId: null };
        case 'composer':
          return { ...prev, view: 'composer', composerMode: 'create', activeDraftId: null, selectedPostId: null };
        case 'drafts':
          return { ...prev, view: 'drafts' };
        case 'my_posts':
          return { ...prev, view: 'my_posts' };
        case 'favorites':
          return { ...prev, view: 'favorites' };
        case 'home':
        default:
          return {
            ...DEFAULT_UI_STATE,
            selectedCategory: prev.selectedCategory,
            sortMode: prev.sortMode,
          };
      }
    });
  }, []);

  const runtime: CommunityRuntimeState = useMemo(
    () => ({
      seedPosts: SEED_POSTS,
      userPosts: persistedState.userPosts,
      drafts: persistedState.drafts,
      commentsByPostId: mergeCommentsDeep(SEED_COMMENTS, persistedState.commentsByPostId),
      interactions: persistedState.interactions,
      meta: persistedState.meta,
    }),
    [persistedState]
  );

  const getMergedPost = useCallback((post: CommunityPost): CommunityPost => {
    if (isSeedPost(post.id)) {
      const counts = persistedState.seedPostCounts[post.id];
      if (!counts) return post;
      return {
        ...post,
        likeCount: post.likeCount + counts.likeCount,
        favoriteCount: post.favoriteCount + counts.favoriteCount,
        commentCount: post.commentCount + counts.commentCount,
        viewCount: post.viewCount + counts.viewCount,
      };
    }
    return post;
  }, [persistedState.seedPostCounts]);

  const getMergedComment = useCallback((comment: CommunityComment): CommunityComment => {
    const seedCommentIds = SEED_COMMENTS ? Object.values(SEED_COMMENTS).flat().map(c => c.id) : [];
    if (seedCommentIds.includes(comment.id)) {
      const counts = persistedState.seedCommentCounts[comment.id];
      if (!counts) return comment;
      return {
        ...comment,
        likeCount: comment.likeCount + counts.likeCount,
      };
    }
    return comment;
  }, [persistedState.seedCommentCounts]);

  const visiblePosts = useMemo(() => {
    let posts: CommunityPost[];

    if (ui.view === 'my_posts') {
      posts = persistedState.userPosts.filter(
        p => p.authorId === LOCAL_USER_ID && (p.status === 'approved' || p.status === 'pending')
      );
    } else if (ui.view === 'favorites') {
      const favIds = persistedState.interactions.favoritedPostIds;
      posts = [
        ...SEED_POSTS.filter(p => favIds.includes(p.id)),
        ...persistedState.userPosts.filter(p => favIds.includes(p.id)),
      ].map(getMergedPost);
    } else {
      const merged = mergePosts(runtime.seedPosts, runtime.userPosts).map(getMergedPost);
      posts = filterPosts(merged, ui.selectedCategory, ui.searchQuery, ui.selectedTags);
    }

    return sortPosts(posts, ui.sortMode);
  }, [runtime, persistedState, ui.view, ui.selectedCategory, ui.searchQuery, ui.selectedTags, ui.sortMode, getMergedPost]);

  const selectedPost = useMemo(() => {
    if (!ui.selectedPostId) return null;
    const post = getPostById(ui.selectedPostId, runtime.seedPosts, runtime.userPosts);
    return post ? getMergedPost(post) : null;
  }, [ui.selectedPostId, runtime.seedPosts, runtime.userPosts, getMergedPost]);

  const hasNewContent = useMemo(() => {
    const viewedIds = new Set(persistedState.interactions.viewedPostIds);
    const totalRecommended = SEED_POSTS.filter(p => p.isFeatured).length;
    const viewedRecommended = SEED_POSTS.filter(p => p.isFeatured && viewedIds.has(p.id)).length;
    return viewedRecommended < totalRecommended;
  }, [persistedState.interactions.viewedPostIds]);

  const hasDraft = persistedState.drafts.length > 0;

  const openHome = useCallback(() => {
    setUi(prev => ({
      ...DEFAULT_UI_STATE,
      selectedCategory: prev.selectedCategory,
      sortMode: prev.sortMode,
    }));
    previousViewRef.current = 'home';
    setPersistedState(prev => updateMeta(prev, { lastEnteredAt: Date.now() }));
  }, []);

  const openPost = useCallback((postId: string) => {
    setUi(prev => {
      previousViewRef.current = (prev.view === 'home' || prev.view === 'my_posts' || prev.view === 'favorites' || prev.view === 'drafts') ? prev.view : 'home';
      return {
        ...prev,
        view: 'detail',
        selectedPostId: postId,
      };
    });
  }, []);

  const openComposer = useCallback((mode: CommunityComposerMode = 'create', draftId: string | null = null, postId: string | null = null) => {
    setUi(prev => {
      previousViewRef.current = (prev.view === 'home' || prev.view === 'my_posts' || prev.view === 'favorites' || prev.view === 'drafts') ? prev.view : 'home';
      return {
        ...prev,
        view: 'composer',
        composerMode: mode,
        activeDraftId: draftId,
        selectedPostId: postId,
      };
    });
  }, []);

  const openDrafts = useCallback(() => {
    previousViewRef.current = 'home';
    setUi(prev => ({ ...prev, view: 'drafts' }));
  }, []);

  const openMyPosts = useCallback(() => {
    setUi(prev => {
      previousViewRef.current = prev.view === 'home' || prev.view === 'my_posts' || prev.view === 'favorites' || prev.view === 'drafts' ? prev.view : 'home';
      return { ...prev, view: 'my_posts' };
    });
  }, []);

  const openFavorites = useCallback(() => {
    setUi(prev => {
      previousViewRef.current = prev.view === 'home' || prev.view === 'my_posts' || prev.view === 'favorites' || prev.view === 'drafts' ? prev.view : 'home';
      return { ...prev, view: 'favorites' };
    });
  }, []);

  const closeCommunity = useCallback(() => {
    setUi(prev => {
      setPersistedState(s => saveUiSnapshot(s, {
        category: prev.selectedCategory,
        sortMode: prev.sortMode,
        searchQuery: prev.searchQuery,
        selectedTags: prev.selectedTags,
      }));
      previousViewRef.current = 'home';
      return {
        ...DEFAULT_UI_STATE,
        selectedCategory: prev.selectedCategory,
        sortMode: prev.sortMode,
      };
    });
  }, []);

  const setCategory = useCallback((category: CommunityCategory | 'all') => {
    setUi(prev => ({ ...prev, selectedCategory: category, searchQuery: '', selectedTags: [], view: 'home' }));
  }, []);

  const setSortMode = useCallback((mode: CommunitySortMode) => {
    setUi(prev => ({ ...prev, sortMode: mode }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setUi(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedTags = useCallback((tags: string[]) => {
    setUi(prev => ({ ...prev, selectedTags: tags }));
  }, []);

  const saveCurrentDraft = useCallback((draft: Omit<CommunityDraft, 'id' | 'updatedAt'>): string => {
    let draftId = '';
    setPersistedState(prev => {
      const newState = saveDraft(prev, {
        ...draft,
        summary: generateSummary(draft.content),
      });
      const saved = newState.drafts.find(d =>
        d.category === draft.category &&
        d.title === draft.title &&
        d.content === draft.content
      );
      draftId = saved?.id ?? generateId();
      return newState;
    });
    return draftId;
  }, []);

  const updateCurrentDraft = useCallback((draftId: string, draft: Omit<CommunityDraft, 'id' | 'updatedAt'>) => {
    setPersistedState(prev => updateDraft(prev, draftId, {
      category: draft.category,
      title: draft.title,
      content: draft.content,
      tags: draft.tags,
      imageUrls: draft.imageUrls,
      summary: generateSummary(draft.content),
      sourcePostId: draft.sourcePostId,
    }));
  }, []);

  const publishDraft = useCallback((draftId: string): string | null => {
    let newPostId: string | null = null;
    setPersistedState(prev => {
      const draft = prev.drafts.find(d => d.id === draftId);
      if (!draft) return prev;

      const moderation = validatePostInput({
        title: draft.title,
        content: draft.content,
        tags: draft.tags,
        imageUrls: draft.imageUrls,
        category: draft.category,
      });

      if (!moderation.passed) {
        console.warn('[community] Draft validation failed:', moderation.errors);
        return prev;
      }

      const afterAdd = addUserPost(prev, {
        category: draft.category,
        title: sanitizeContent(draft.title),
        summary: generateSummary(draft.content),
        content: sanitizeContent(draft.content),
        tags: draft.tags,
        imageUrls: draft.imageUrls,
        authorId: LOCAL_USER_ID,
        authorName: LOCAL_USER_NAME,
        publishedAt: Date.now(),
        status: 'approved',
        isPinned: false,
        isFeatured: false,
      });

      newPostId = afterAdd.userPosts.at(-1)?.id ?? null;
      return deleteDraftStorage(afterAdd, draftId);
    });
    return newPostId;
  }, []);

  const createPost = useCallback((input: { title: string; content: string; category: CommunityCategory; tags: string[]; imageUrls: string[] }): string | null => {
    let newPostId: string | null = null;
    setPersistedState(prev => {
      const moderation = validatePostInput({
        title: input.title,
        content: input.content,
        tags: input.tags,
        imageUrls: input.imageUrls,
        category: input.category,
      });

      if (!moderation.passed) {
        console.warn('[community] Post validation failed:', moderation.errors);
        return prev;
      }

      const newState = addUserPost(prev, {
        category: input.category,
        title: sanitizeContent(input.title),
        summary: generateSummary(input.content),
        content: sanitizeContent(input.content),
        tags: input.tags,
        imageUrls: input.imageUrls,
        authorId: LOCAL_USER_ID,
        authorName: LOCAL_USER_NAME,
        publishedAt: Date.now(),
        status: 'approved',
        isPinned: false,
        isFeatured: false,
      });

      newPostId = newState.userPosts.at(-1)?.id ?? null;
      return newState;
    });
    return newPostId;
  }, []);

  const updatePost = useCallback((postId: string, input: { title?: string; content?: string; tags?: string[] }): boolean => {
    if (isSeedPost(postId)) return false;

    let found = false;
    setPersistedState(prev => {
      const post = prev.userPosts.find(p => p.id === postId);
      if (!post || post.authorId !== LOCAL_USER_ID) return prev;
      found = true;
      return updateUserPost(prev, postId, {
        ...(input.title !== undefined && { title: sanitizeContent(input.title), summary: generateSummary(input.content ?? post.content) }),
        ...(input.content !== undefined && { content: sanitizeContent(input.content) }),
        ...(input.tags !== undefined && { tags: input.tags }),
      });
    });
    return found;
  }, []);

  const deletePost = useCallback((postId: string): boolean => {
    if (isSeedPost(postId)) return false;
    setPersistedState(prev => ({
      ...prev,
      userPosts: prev.userPosts.filter(p => p.id !== postId),
    }));
    return true;
  }, []);

  const togglePostLike = useCallback((postId: string) => {
    setPersistedState(prev => {
      const seed = isSeedPost(postId);
      const state1 = togglePostLikeStorage(prev, postId, seed);
      if (seed) {
        const wasLiked = prev.interactions.likedPostIds.includes(postId);
        const isNowLiked = state1.interactions.likedPostIds.includes(postId);
        if (wasLiked === isNowLiked) return state1;
        return updateSeedPostLikeCount(state1, postId, isNowLiked);
      }
      return state1;
    });
  }, []);

  const togglePostFavorite = useCallback((postId: string) => {
    setPersistedState(prev => {
      const seed = isSeedPost(postId);
      const state1 = togglePostFavoriteStorage(prev, postId, seed);
      if (seed) {
        const wasFavorited = prev.interactions.favoritedPostIds.includes(postId);
        const isNowFavorited = state1.interactions.favoritedPostIds.includes(postId);
        if (wasFavorited === isNowFavorited) return state1;
        return updateSeedPostFavoriteCount(state1, postId, isNowFavorited);
      }
      return state1;
    });
  }, []);

  const addCommentToPost = useCallback((postId: string, content: string, parentId: string | null = null): string | null => {
    if (!content.trim()) return null;

    let commentId: string | null = null;
    setPersistedState(prev => {
      const seed = isSeedPost(postId);
      let newState = addComment(prev, postId, {
        postId,
        parentId,
        authorId: LOCAL_USER_ID,
        authorName: LOCAL_USER_NAME,
        content: sanitizeContent(content),
      });

      const added = newState.commentsByPostId[postId]?.find(c =>
        c.content === sanitizeContent(content) && c.authorId === LOCAL_USER_ID
      );
      commentId = added?.id ?? null;

      if (seed) {
        newState = updateSeedPostCommentCount(newState, postId, 1);
      }

      return newState;
    });
    return commentId;
  }, []);

  const toggleCommentLike = useCallback((postId: string, commentId: string) => {
    setPersistedState(prev => {
      const seed = isSeedPost(postId);
      const wasLiked = prev.interactions.likedCommentIds.includes(commentId);
      const isNowLiked = !wasLiked;

      let updatedCommentsByPostId = { ...prev.commentsByPostId };
      if (!seed) {
        const postComments = prev.commentsByPostId[postId] || [];
        const commentIndex = postComments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          const updatedComments = [...postComments];
          updatedComments[commentIndex] = {
            ...updatedComments[commentIndex],
            likeCount: Math.max(0, updatedComments[commentIndex].likeCount + (isNowLiked ? 1 : -1)),
          };
          updatedCommentsByPostId = {
            ...updatedCommentsByPostId,
            [postId]: updatedComments,
          };
        }
      }

      const updatedInteractions = {
        ...prev.interactions,
        likedCommentIds: isNowLiked
          ? [...prev.interactions.likedCommentIds, commentId]
          : prev.interactions.likedCommentIds.filter(id => id !== commentId),
      };

      let newState: CommunityPersistedState = {
        ...prev,
        interactions: updatedInteractions,
        commentsByPostId: updatedCommentsByPostId,
      };

      if (seed) {
        newState = updateSeedCommentLikeCount(newState, postId, commentId, isNowLiked);
      }

      return newState;
    });
  }, []);

  const acceptAnswerToPost = useCallback((postId: string, commentId: string) => {
    setPersistedState(prev => acceptAnswer(prev, postId, commentId));
  }, []);

  const markViewed = useCallback((postId: string) => {
    setPersistedState(prev => {
      const seed = isSeedPost(postId);
      const state1 = markPostViewed(prev, postId, seed);
      if (seed) {
        const alreadyViewed = prev.interactions.viewedPostIds.includes(postId);
        if (alreadyViewed) return state1;
        return updateSeedPostViewCount(state1, postId);
      }
      return state1;
    });
  }, []);

  const deleteDraftAction = useCallback((draftId: string) => {
    setPersistedState(prev => deleteDraftStorage(prev, draftId));
  }, []);

  const clearDraft = useCallback((draftId: string) => {
    setPersistedState(prev => deleteDraftStorage(prev, draftId));
  }, []);

  const getMyPosts = useCallback((): CommunityPost[] => {
    return persistedState.userPosts.filter(
      p => p.authorId === LOCAL_USER_ID && (p.status === 'approved' || p.status === 'pending')
    );
  }, [persistedState.userPosts]);

  const getFavoritePosts = useCallback((): CommunityPost[] => {
    const favIds = persistedState.interactions.favoritedPostIds;
    return [
      ...SEED_POSTS.filter(p => favIds.includes(p.id)),
      ...persistedState.userPosts.filter(p => favIds.includes(p.id)),
    ];
  }, [persistedState.interactions.favoritedPostIds, persistedState.userPosts]);

  const actions = useMemo(() => ({
    openHome,
    openPost,
    openComposer,
    openDrafts,
    openMyPosts,
    openFavorites,
    goBack,
    closeCommunity,
    setCategory,
    setSortMode,
    setSearchQuery,
    setSelectedTags,
    saveCurrentDraft,
    updateCurrentDraft,
    publishDraft,
    createPost,
    updatePost,
    deletePost,
    togglePostLike,
    togglePostFavorite,
    addCommentToPost,
    toggleCommentLike,
    acceptAnswerToPost,
    markViewed,
    deleteDraft: deleteDraftAction,
    clearDraft,
    getMyPosts,
    getFavoritePosts,
  }), [
    openHome, openPost, openComposer, openDrafts, openMyPosts, openFavorites,
    goBack, closeCommunity, setCategory, setSortMode, setSearchQuery, setSelectedTags,
    saveCurrentDraft, updateCurrentDraft, publishDraft, createPost, updatePost, deletePost,
    togglePostLike, togglePostFavorite, addCommentToPost, toggleCommentLike,
    acceptAnswerToPost, markViewed, deleteDraftAction, clearDraft, getMyPosts, getFavoritePosts,
  ]);

  return (
    <CommunityContext.Provider value={{
      ui,
      runtime,
      visiblePosts,
      selectedPost,
      hasNewContent,
      hasDraft,
      actions,
      getMergedComment,
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunityState() {
  const ctx = useContext(CommunityContext);
  if (!ctx) {
    throw new Error('useCommunityState must be used within CommunityProvider');
  }
  return ctx;
}

export { LOCAL_USER_ID, LOCAL_USER_NAME };
