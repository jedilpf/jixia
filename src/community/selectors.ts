import type {
  CommunityPost,
  CommunityCategory,
  CommunitySortMode,
  CommunityComment,
} from './types';

/**
 * 计算热度分数（带时间衰减）
 *
 * 算法优化：
 * 1. 点赞、评论、收藏权重调整
 * 2. 浏览量权重降低（防止刷热度）
 * 3. 添加时间衰减因子（旧帖热度逐渐降低）
 * 4. 精选帖额外加分
 */
export function computeHotScore(post: CommunityPost): number {
  const now = Date.now();
  const postTime = post.publishedAt ?? post.createdAt;

  // 时间衰减：每7天衰减50%
  const daysSincePost = (now - postTime) / (24 * 60 * 60 * 1000);
  const timeDecayFactor = Math.pow(0.5, daysSincePost / 7);

  // 基础互动分数
  const interactionScore = (
    post.likeCount * 1.5 +        // 点赞权重
    post.commentCount * 3 +       // 评论权重最高（代表讨论活跃度）
    post.favoriteCount * 2.5 +    // 收藏权重（代表质量认可）
    Math.min(post.viewCount, 1000) * 0.02  // 浏览量封顶1000，防止刷量
  );

  // 精选帖额外加分
  const featuredBonus = post.isFeatured ? 50 : 0;

  // QA已解决帖加分（鼓励解答）
  const qaBonus = post.qaState === 'resolved' ? 20 : 0;

  return (interactionScore + featuredBonus + qaBonus) * timeDecayFactor;
}

/**
 * 计算推荐分数
 *
 * 考虑因素：
 * 1. 热度分数
 * 2. 用户偏好门派
 * 3. 内容新鲜度
 * 4. 帖子质量特征
 */
export function computeRecommendScore(
  post: CommunityPost,
  userFaction?: string,
  viewedPostIds?: string[]
): number {
  // 基础热度分数
  const hotScore = computeHotScore(post);

  // 用户偏好门派加分
  const factionMatch = userFaction && post.authorFaction === userFaction;
  const factionBonus = factionMatch ? 30 : 0;

  // 已浏览帖降分（避免重复推荐）
  const viewed = viewedPostIds?.includes(post.id);
  const viewedPenalty = viewed ? -50 : 0;

  // 新帖加分（24小时内）
  const now = Date.now();
  const hoursSincePost = (now - (post.publishedAt ?? post.createdAt)) / (60 * 60 * 1000);
  const freshnessBonus = hoursSincePost < 24 ? 40 : 0;

  return hotScore + factionBonus + viewedPenalty + freshnessBonus;
}

export function filterPosts(
  posts: CommunityPost[],
  category: CommunityCategory | 'all',
  searchQuery: string,
  selectedTags: string[]
): CommunityPost[] {
  let result = posts.filter(p => p.status === 'approved' || p.status === 'pending');

  if (category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.authorName.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (selectedTags.length > 0) {
    result = result.filter(p => selectedTags.some(tag => p.tags.includes(tag)));
  }

  return result;
}

export function sortPosts(
  posts: CommunityPost[],
  sortMode: CommunitySortMode,
  options?: {
    userFaction?: string;
    viewedPostIds?: string[];
  }
): CommunityPost[] {
  const pinned = posts.filter(p => p.isPinned);
  const unpinned = posts.filter(p => !p.isPinned);

  const sortFn = (a: CommunityPost, b: CommunityPost) => {
    switch (sortMode) {
      case 'latest': {
        const aTime = a.publishedAt ?? a.createdAt;
        const bTime = b.publishedAt ?? b.createdAt;
        return bTime - aTime;
      }
      case 'hot':
        return computeHotScore(b) - computeHotScore(a);
      case 'featured': {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        const aTimeF = a.publishedAt ?? a.createdAt;
        const bTimeF = b.publishedAt ?? b.createdAt;
        return bTimeF - aTimeF;
      }
      case 'most_favorited':
        return b.favoriteCount - a.favoriteCount;
      case 'recommended': {
        const aScore = computeRecommendScore(a, options?.userFaction, options?.viewedPostIds);
        const bScore = computeRecommendScore(b, options?.userFaction, options?.viewedPostIds);
        return bScore - aScore;
      }
      default:
        return 0;
    }
  };

  const sortedUnpinned = [...unpinned].sort(sortFn);
  const sortedPinned = [...pinned].sort(sortFn);

  return [...sortedPinned, ...sortedUnpinned];
}

/**
 * 获取推荐帖子列表
 *
 * @param posts 所有帖子
 * @param options 推荐选项
 * @param limit 返回数量限制
 */
export function getRecommendedPosts(
  posts: CommunityPost[],
  options: {
    userFaction?: string;
    viewedPostIds?: string[];
    excludePostIds?: string[];
  },
  limit: number = 10
): CommunityPost[] {
  // 过滤已排除的帖子
  let candidatePosts = posts.filter(
    p => p.status === 'approved' && !options.excludePostIds?.includes(p.id)
  );

  // 计算推荐分数并排序
  const scoredPosts = candidatePosts.map(post => ({
    post,
    score: computeRecommendScore(post, options.userFaction, options.viewedPostIds),
  }));

  scoredPosts.sort((a, b) => b.score - a.score);

  return scoredPosts.slice(0, limit).map(sp => sp.post);
}

export function mergePosts(
  seedPosts: CommunityPost[],
  userPosts: CommunityPost[]
): CommunityPost[] {
  const merged = new Map<string, CommunityPost>();

  seedPosts.forEach(post => merged.set(post.id, post));

  userPosts.forEach(post => {
    const existing = merged.get(post.id);
    if (existing) {
      merged.set(post.id, { ...existing, ...post });
    } else {
      merged.set(post.id, post);
    }
  });

  return Array.from(merged.values());
}

export function isSeedPost(postId: string): boolean {
  return postId.startsWith('seed-');
}

export function getPostById(
  postId: string,
  seedPosts: CommunityPost[],
  userPosts: CommunityPost[]
): CommunityPost | null {
  const seed = seedPosts.find(p => p.id === postId);
  if (seed) return seed;

  const user = userPosts.find(p => p.id === postId);
  if (user) return user;

  return null;
}

export function getCommentsByPostId(
  postId: string,
  seedComments: Record<string, CommunityComment[]>,
  userComments: Record<string, CommunityComment[]>
): CommunityComment[] {
  const seedList = seedComments[postId] || [];
  const userList = userComments[postId] || [];

  const merged = new Map<string, CommunityComment>();

  seedList.forEach(c => merged.set(c.id, c));
  userList.forEach(c => merged.set(c.id, c));

  return Array.from(merged.values()).sort((a, b) => a.createdAt - b.createdAt);
}

export function getUserPostsByAuthor(
  userPosts: CommunityPost[],
  authorId: string
): CommunityPost[] {
  return userPosts
    .filter(p => p.authorId === authorId && (p.status === 'approved' || p.status === 'pending'))
    .sort((a, b) => {
      const aTime = a.publishedAt ?? a.createdAt;
      const bTime = b.publishedAt ?? b.createdAt;
      return bTime - aTime;
    });
}

export function getFavoritedPosts(
  seedPosts: CommunityPost[],
  userPosts: CommunityPost[],
  favoritedIds: string[]
): CommunityPost[] {
  const posts: CommunityPost[] = [];

  favoritedIds.forEach(id => {
    const seed = seedPosts.find(p => p.id === id);
    if (seed) {
      posts.push(seed);
      return;
    }
    const user = userPosts.find(p => p.id === id);
    if (user) {
      posts.push(user);
    }
  });

  return posts;
}

export function getAllTags(posts: CommunityPost[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach(post => post.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export function getTagCounts(posts: CommunityPost[]): Record<string, number> {
  const counts: Record<string, number> = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}

export function generateSummary(content: string, maxLength = 80): string {
  const cleaned = content.replace(/\n+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength) + '...';
}
