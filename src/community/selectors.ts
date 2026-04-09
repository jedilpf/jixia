import type {
  CommunityPost,
  CommunityCategory,
  CommunitySortMode,
  CommunityComment,
} from './types';

export function computeHotScore(post: CommunityPost): number {
  return (
    post.likeCount * 1 +
    post.commentCount * 2 +
    post.favoriteCount * 3 +
    post.viewCount * 0.05
  );
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
  sortMode: CommunitySortMode
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
      default:
        return 0;
    }
  };

  const sortedUnpinned = [...unpinned].sort(sortFn);
  const sortedPinned = [...pinned].sort(sortFn);

  return [...sortedPinned, ...sortedUnpinned];
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
