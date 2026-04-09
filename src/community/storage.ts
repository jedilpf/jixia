import type {
  CommunityPersistedState,
  CommunityPost,
  CommunityComment,
  CommunityDraft,
  CommunityUserInteraction,
} from './types';

const STATE_KEY = 'jixia.community.v1.state';
const MAX_USER_POSTS = 200;
const MAX_DRAFTS = 20;

const DEFAULT_INTERACTIONS: CommunityUserInteraction = {
  likedPostIds: [],
  favoritedPostIds: [],
  likedCommentIds: [],
  viewedPostIds: [],
};

const DEFAULT_META: CommunityPersistedState['meta'] = {
  lastEnteredAt: null,
  unreadRecommendedCount: 0,
  hasDraft: false,
};

function createDefaultState(): CommunityPersistedState {
  return {
    version: 1,
    userPosts: [],
    commentsByPostId: {},
    drafts: [],
    interactions: { ...DEFAULT_INTERACTIONS },
    seedPostCounts: {},
    seedCommentCounts: {},
    meta: { ...DEFAULT_META },
  };
}

export function loadCommunityState(): CommunityPersistedState {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<CommunityPersistedState>;

    if (!parsed || parsed.version !== 1) {
      console.warn('[community] Invalid or missing version, resetting state');
      return createDefaultState();
    }

    return {
      version: 1,
      userPosts: Array.isArray(parsed.userPosts) ? parsed.userPosts : [],
      commentsByPostId: parsed.commentsByPostId || {},
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      interactions: {
        likedPostIds: Array.isArray(parsed.interactions?.likedPostIds)
          ? parsed.interactions.likedPostIds
          : [],
        favoritedPostIds: Array.isArray(parsed.interactions?.favoritedPostIds)
          ? parsed.interactions.favoritedPostIds
          : [],
        likedCommentIds: Array.isArray(parsed.interactions?.likedCommentIds)
          ? parsed.interactions.likedCommentIds
          : [],
        viewedPostIds: Array.isArray(parsed.interactions?.viewedPostIds)
          ? parsed.interactions.viewedPostIds
          : [],
      },
      seedPostCounts: parsed.seedPostCounts || {},
      seedCommentCounts: parsed.seedCommentCounts || {},
      meta: {
        lastEnteredAt: parsed.meta?.lastEnteredAt ?? null,
        unreadRecommendedCount: parsed.meta?.unreadRecommendedCount ?? 0,
        hasDraft: parsed.meta?.hasDraft ?? false,
      },
      uiSnapshot: parsed.uiSnapshot,
    };
  } catch (err) {
    console.error('[community] Failed to load state, using defaults:', err);
    return createDefaultState();
  }
}

export function saveCommunityState(state: CommunityPersistedState): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = JSON.stringify(state);
    window.localStorage.setItem(STATE_KEY, raw);
  } catch (err) {
    console.error('[community] Failed to save state:', err);
  }
}

export function pruneUserPosts(posts: CommunityPost[]): CommunityPost[] {
  if (posts.length <= MAX_USER_POSTS) {
    return posts;
  }

  const sorted = [...posts].sort((a, b) => {
    const aTime = a.publishedAt ?? a.createdAt;
    const bTime = b.publishedAt ?? b.createdAt;
    return bTime - aTime;
  });

  return sorted.slice(0, MAX_USER_POSTS);
}

export function pruneDrafts(drafts: CommunityDraft[]): CommunityDraft[] {
  if (drafts.length <= MAX_DRAFTS) {
    return drafts;
  }

  const sorted = [...drafts].sort((a, b) => b.updatedAt - a.updatedAt);
  return sorted.slice(0, MAX_DRAFTS);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function now(): number {
  return Date.now();
}

export function addUserPost(
  state: CommunityPersistedState,
  post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'favoriteCount'>
): CommunityPersistedState {
  const newPost: CommunityPost = {
    ...post,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    favoriteCount: 0,
  };

  const updatedUserPosts = pruneUserPosts([...state.userPosts, newPost]);

  return {
    ...state,
    userPosts: updatedUserPosts,
  };
}

export function updateUserPost(
  state: CommunityPersistedState,
  postId: string,
  patch: Partial<CommunityPost>
): CommunityPersistedState {
  const postIndex = state.userPosts.findIndex(p => p.id === postId);
  if (postIndex === -1) return state;

  const updatedPost = {
    ...state.userPosts[postIndex],
    ...patch,
    updatedAt: now(),
  };

  const updatedUserPosts = [...state.userPosts];
  updatedUserPosts[postIndex] = updatedPost;

  return {
    ...state,
    userPosts: updatedUserPosts,
  };
}

export function addComment(
  state: CommunityPersistedState,
  postId: string,
  comment: Omit<CommunityComment, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'status'>
): CommunityPersistedState {
  const newComment: CommunityComment = {
    ...comment,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
    likeCount: 0,
    status: 'normal',
  };

  const existingComments = state.commentsByPostId[postId] || [];
  const updatedComments = {
    ...state.commentsByPostId,
    [postId]: [...existingComments, newComment],
  };

  const postIndex = state.userPosts.findIndex(p => p.id === postId);
  let updatedUserPosts = state.userPosts;
  if (postIndex !== -1) {
    updatedUserPosts = [...state.userPosts];
    updatedUserPosts[postIndex] = {
      ...state.userPosts[postIndex],
      commentCount: (state.userPosts[postIndex].commentCount || 0) + 1,
    };
  }

  return {
    ...state,
    commentsByPostId: updatedComments,
    userPosts: updatedUserPosts,
  };
}

export function togglePostLike(
  state: CommunityPersistedState,
  postId: string,
  isSeed: boolean
): CommunityPersistedState {
  const likedIds = [...state.interactions.likedPostIds];
  const idx = likedIds.indexOf(postId);
  const isLiked = idx !== -1;

  if (isLiked) {
    likedIds.splice(idx, 1);
  } else {
    likedIds.push(postId);
  }

  let updatedUserPosts = state.userPosts;
  if (!isSeed) {
    const postIndex = state.userPosts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      updatedUserPosts = [...state.userPosts];
      updatedUserPosts[postIndex] = {
        ...state.userPosts[postIndex],
        likeCount: Math.max(0, state.userPosts[postIndex].likeCount + (isLiked ? -1 : 1)),
      };
    }
  }

  return {
    ...state,
    interactions: {
      ...state.interactions,
      likedPostIds: likedIds,
    },
    userPosts: updatedUserPosts,
  };
}

export function togglePostFavorite(
  state: CommunityPersistedState,
  postId: string,
  isSeed: boolean
): CommunityPersistedState {
  const favoritedIds = [...state.interactions.favoritedPostIds];
  const idx = favoritedIds.indexOf(postId);
  const isFavorited = idx !== -1;

  if (isFavorited) {
    favoritedIds.splice(idx, 1);
  } else {
    favoritedIds.push(postId);
  }

  let updatedUserPosts = state.userPosts;
  if (!isSeed) {
    const postIndex = state.userPosts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      updatedUserPosts = [...state.userPosts];
      updatedUserPosts[postIndex] = {
        ...state.userPosts[postIndex],
        favoriteCount: Math.max(0, state.userPosts[postIndex].favoriteCount + (isFavorited ? -1 : 1)),
      };
    }
  }

  return {
    ...state,
    interactions: {
      ...state.interactions,
      favoritedPostIds: favoritedIds,
    },
    userPosts: updatedUserPosts,
  };
}

export function toggleCommentLike(
  state: CommunityPersistedState,
  commentId: string
): CommunityPersistedState {
  const likedIds = [...state.interactions.likedCommentIds];
  const idx = likedIds.indexOf(commentId);
  const isLiked = idx !== -1;

  if (isLiked) {
    likedIds.splice(idx, 1);
  } else {
    likedIds.push(commentId);
  }

  return {
    ...state,
    interactions: {
      ...state.interactions,
      likedCommentIds: likedIds,
    },
  };
}

export function markPostViewed(
  state: CommunityPersistedState,
  postId: string,
  isSeed: boolean
): CommunityPersistedState {
  const viewedIds = state.interactions.viewedPostIds;
  if (viewedIds.includes(postId)) {
    return state;
  }

  let updatedUserPosts = state.userPosts;
  if (!isSeed) {
    const postIndex = state.userPosts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      updatedUserPosts = [...state.userPosts];
      updatedUserPosts[postIndex] = {
        ...state.userPosts[postIndex],
        viewCount: state.userPosts[postIndex].viewCount + 1,
      };
    }
  }

  return {
    ...state,
    interactions: {
      ...state.interactions,
      viewedPostIds: [...viewedIds, postId],
    },
    userPosts: updatedUserPosts,
  };
}

export function acceptAnswer(
  state: CommunityPersistedState,
  postId: string,
  commentId: string
): CommunityPersistedState {
  const postIndex = state.userPosts.findIndex(p => p.id === postId);
  if (postIndex === -1) return state;

  const post = state.userPosts[postIndex];
  if (post.category !== 'qa') return state;

  const updatedUserPosts = [...state.userPosts];
  updatedUserPosts[postIndex] = {
    ...post,
    qaState: 'resolved',
    acceptedCommentId: commentId,
    updatedAt: now(),
  };

  return {
    ...state,
    userPosts: updatedUserPosts,
  };
}

export function saveDraft(
  state: CommunityPersistedState,
  draft: Omit<CommunityDraft, 'id' | 'updatedAt'>
): CommunityPersistedState {
  const newDraft: CommunityDraft = {
    ...draft,
    id: generateId(),
    updatedAt: now(),
  };

  const updatedDrafts = pruneDrafts([...state.drafts, newDraft]);

  return {
    ...state,
    drafts: updatedDrafts,
    meta: {
      ...state.meta,
      hasDraft: true,
    },
  };
}

export function updateDraft(
  state: CommunityPersistedState,
  draftId: string,
  patch: Partial<CommunityDraft>
): CommunityPersistedState {
  const draftIndex = state.drafts.findIndex(d => d.id === draftId);
  if (draftIndex === -1) return state;

  const updatedDrafts = [...state.drafts];
  updatedDrafts[draftIndex] = {
    ...state.drafts[draftIndex],
    ...patch,
    updatedAt: now(),
  };

  return {
    ...state,
    drafts: updatedDrafts,
  };
}

export function deleteDraft(state: CommunityPersistedState, draftId: string): CommunityPersistedState {
  const updatedDrafts = state.drafts.filter(d => d.id !== draftId);

  return {
    ...state,
    drafts: updatedDrafts,
    meta: {
      ...state.meta,
      hasDraft: updatedDrafts.length > 0,
    },
  };
}

export function updateMeta(
  state: CommunityPersistedState,
  meta: Partial<CommunityPersistedState['meta']>
): CommunityPersistedState {
  return {
    ...state,
    meta: {
      ...state.meta,
      ...meta,
    },
  };
}

export function saveUiSnapshot(
  state: CommunityPersistedState,
  snapshot: CommunityPersistedState['uiSnapshot']
): CommunityPersistedState {
  return {
    ...state,
    uiSnapshot: snapshot,
  };
}

export function updateSeedPostLikeCount(
  state: CommunityPersistedState,
  postId: string,
  isLike: boolean
): CommunityPersistedState {
  const current = state.seedPostCounts[postId] ?? { likeCount: 0, favoriteCount: 0, commentCount: 0, viewCount: 0 };
  return {
    ...state,
    seedPostCounts: {
      ...state.seedPostCounts,
      [postId]: {
        ...current,
        likeCount: Math.max(0, current.likeCount + (isLike ? 1 : -1)),
      },
    },
  };
}

export function updateSeedPostFavoriteCount(
  state: CommunityPersistedState,
  postId: string,
  isFavorite: boolean
): CommunityPersistedState {
  const current = state.seedPostCounts[postId] ?? { likeCount: 0, favoriteCount: 0, commentCount: 0, viewCount: 0 };
  return {
    ...state,
    seedPostCounts: {
      ...state.seedPostCounts,
      [postId]: {
        ...current,
        favoriteCount: Math.max(0, current.favoriteCount + (isFavorite ? 1 : -1)),
      },
    },
  };
}

export function updateSeedPostCommentCount(
  state: CommunityPersistedState,
  postId: string,
  delta: number
): CommunityPersistedState {
  const current = state.seedPostCounts[postId] ?? { likeCount: 0, favoriteCount: 0, commentCount: 0, viewCount: 0 };
  return {
    ...state,
    seedPostCounts: {
      ...state.seedPostCounts,
      [postId]: {
        ...current,
        commentCount: Math.max(0, current.commentCount + delta),
      },
    },
  };
}

export function updateSeedPostViewCount(
  state: CommunityPersistedState,
  postId: string
): CommunityPersistedState {
  const current = state.seedPostCounts[postId] ?? { likeCount: 0, favoriteCount: 0, commentCount: 0, viewCount: 0 };
  return {
    ...state,
    seedPostCounts: {
      ...state.seedPostCounts,
      [postId]: {
        ...current,
        viewCount: current.viewCount + 1,
      },
    },
  };
}

export function updateSeedCommentLikeCount(
  state: CommunityPersistedState,
  _postId: string,
  commentId: string,
  isLike: boolean
): CommunityPersistedState {
  const current = state.seedCommentCounts[commentId] ?? { likeCount: 0 };
  return {
    ...state,
    seedCommentCounts: {
      ...state.seedCommentCounts,
      [commentId]: {
        likeCount: Math.max(0, current.likeCount + (isLike ? 1 : -1)),
      },
    },
  };
}
