export type CommunityCategory = 'discussion' | 'battle_report' | 'qa' | 'culture';

export type CommunityQaState = 'open' | 'answered' | 'resolved';

export type CommunityPostStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'hidden'
  | 'deleted';

export type CommunitySortMode = 'latest' | 'hot' | 'featured' | 'most_favorited';

export type CommunityView =
  | 'home'
  | 'detail'
  | 'composer'
  | 'drafts'
  | 'my_posts'
  | 'favorites'
  | 'search';

export type CommunityComposerMode = 'create' | 'edit_draft' | 'edit_post';

export interface CommunityPost {
  id: string;
  category: CommunityCategory;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  authorId: string;
  authorName: string;
  authorFaction?: string;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
  status: CommunityPostStatus;
  isPinned: boolean;
  isFeatured: boolean;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  qaState?: CommunityQaState;
  acceptedCommentId?: string | null;
}

export interface CommunityComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: 'normal' | 'hidden' | 'deleted';
  likeCount: number;
}

export interface CommunityUserInteraction {
  likedPostIds: string[];
  favoritedPostIds: string[];
  likedCommentIds: string[];
  viewedPostIds: string[];
}

export interface CommunityDraft {
  id: string;
  category: CommunityCategory;
  title: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  summary: string;
  updatedAt: number;
  sourcePostId?: string | null;
}

export interface SeedPostCounts {
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  viewCount: number;
}

export interface SeedCommentCounts {
  likeCount: number;
}

export interface CommunityPersistedState {
  version: 1;
  userPosts: CommunityPost[];
  commentsByPostId: Record<string, CommunityComment[]>;
  drafts: CommunityDraft[];
  interactions: CommunityUserInteraction;
  seedPostCounts: Record<string, SeedPostCounts>;
  seedCommentCounts: Record<string, SeedCommentCounts>;
  meta: {
    lastEnteredAt: number | null;
    unreadRecommendedCount: number;
    hasDraft: boolean;
  };
  uiSnapshot?: {
    category: CommunityCategory | 'all';
    sortMode: CommunitySortMode;
    searchQuery: string;
    selectedTags: string[];
  };
}

export interface CommunityRuntimeState {
  seedPosts: CommunityPost[];
  userPosts: CommunityPost[];
  drafts: CommunityDraft[];
  commentsByPostId: Record<string, CommunityComment[]>;
  interactions: CommunityUserInteraction;
  meta: CommunityPersistedState['meta'];
}

export interface CommunityUiState {
  view: CommunityView;
  selectedCategory: CommunityCategory | 'all';
  sortMode: CommunitySortMode;
  selectedPostId: string | null;
  activeDraftId: string | null;
  composerMode: CommunityComposerMode;
  searchQuery: string;
  selectedTags: string[];
}

export interface CommunityCategoryInfo {
  id: CommunityCategory | 'all';
  label: string;
  icon: string;
  tags: string[];
}

export const COMMUNITY_CATEGORIES: CommunityCategoryInfo[] = [
  {
    id: 'all',
    label: '全部',
    icon: '📜',
    tags: [],
  },
  {
    id: 'discussion',
    label: '百家论道',
    icon: '💬',
    tags: ['论辩技巧', '卡组构筑', '门派攻略', '杂谈'],
  },
  {
    id: 'battle_report',
    label: '战报分享',
    icon: '⚔️',
    tags: ['战场趣闻', '史诗翻盘', '卡牌故事', '精彩对决'],
  },
  {
    id: 'qa',
    label: '疑惑解答',
    icon: '❓',
    tags: ['新手求助', '规则咨询', '门派选择', '已解决'],
  },
  {
    id: 'culture',
    label: '文苑',
    icon: '📚',
    tags: ['诸子百家', '历史典故', '成语故事', '传统节日'],
  },
];

export const CATEGORY_TAG_MAP: Record<CommunityCategory, string[]> = {
  discussion: ['论辩技巧', '卡组构筑', '门派攻略', '杂谈'],
  battle_report: ['战场趣闻', '史诗翻盘', '卡牌故事', '精彩对决'],
  qa: ['新手求助', '规则咨询', '门派选择', '已解决'],
  culture: ['诸子百家', '历史典故', '成语故事', '传统节日'],
};
