export interface ModerationResult {
  passed: boolean;
  errors: string[];
}

const SENSITIVE_WORDS = [
  'xxx',
  'admin',
  'test',
];

const TITLE_MIN = 6;
const TITLE_MAX = 50;
const CONTENT_MIN = 10;
const CONTENT_MAX = 5000;
const TAGS_MAX = 5;
const IMAGES_MAX = 6;
const POST_INTERVAL_MS = 5 * 60 * 1000;

export function validatePostInput(input: {
  title: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  category: string;
}): ModerationResult {
  const errors: string[] = [];

  const trimmedTitle = input.title.trim();
  if (trimmedTitle.length < TITLE_MIN) {
    errors.push(`标题至少${TITLE_MIN}个字`);
  }
  if (trimmedTitle.length > TITLE_MAX) {
    errors.push(`标题最多${TITLE_MAX}个字`);
  }

  const trimmedContent = input.content.trim();
  if (trimmedContent.length < CONTENT_MIN) {
    errors.push(`正文至少${CONTENT_MIN}个字`);
  }
  if (trimmedContent.length > CONTENT_MAX) {
    errors.push(`正文最多${CONTENT_MAX}个字`);
  }

  if (input.tags.length > TAGS_MAX) {
    errors.push(`最多选择${TAGS_MAX}个标签`);
  }

  if (input.imageUrls.length > IMAGES_MAX) {
    errors.push(`最多上传${IMAGES_MAX}张图片`);
  }

  for (const tag of input.tags) {
    if (tag.length > 20) {
      errors.push('单个标签最多20个字');
      break;
    }
  }

  for (const word of SENSITIVE_WORDS) {
    if (trimmedTitle.toLowerCase().includes(word) || trimmedContent.toLowerCase().includes(word)) {
      errors.push('内容包含敏感词，请修改后重试');
      break;
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

export function checkPostFrequency(lastPostTime: number | null): boolean {
  if (lastPostTime === null) return true;
  return Date.now() - lastPostTime >= POST_INTERVAL_MS;
}

export function getTimeUntilNextPost(lastPostTime: number | null): number {
  if (lastPostTime === null) return 0;
  const elapsed = Date.now() - lastPostTime;
  const remaining = POST_INTERVAL_MS - elapsed;
  return remaining > 0 ? remaining : 0;
}

export function formatContentPreview(content: string, maxLength = 100): string {
  const lines = content.split('\n').filter(l => l.trim());
  const firstLine = lines[0] || content;
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength) + '...';
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/[<>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
