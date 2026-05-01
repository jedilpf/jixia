export interface ModerationResult {
  passed: boolean;
  errors: string[];
}

/**
 * 敏感词列表
 *
 * 分类：
 * 1. 基础测试词（系统过滤）
 * 2. 不当言论
 * 3. 垃圾信息模式
 * 4. 平台滥用词
 * 5. 广告/推广关键词
 */
const SENSITIVE_WORDS = [
  // ====== 基础测试词 ======
  'xxx',
  'admin',
  'administrator',
  'test',
  '测试',
  'debug',

  // ====== 不当言论 ======
  '傻逼',
  '煞笔',
  'SB',
  'sb',
  '脑残',
  '白痴',
  '废物',
  '垃圾',
  '滚',
  '去死',
  '骂',
  '喷子',
  '杠精',
  '互喷',
  '吵架',
  '撕逼',

  // ====== 攻击性词汇 ======
  '他妈',
  '操',
  '干你',
  '艹',
  '尼玛',
  '你妈',
  '妈的',
  '贱人',
  '婊子',
  '碧池',

  // ====== 垃圾信息模式 ======
  '加群',
  '加微信',
  '加QQ',
  '加我',
  '私聊',
  '私信我',
  '联系方式',
  '微信号',
  'qq号',
  '转账',
  '红包',
  '送钱',
  '领红包',
  '免费送',
  '充值',
  '代充',

  // ====== 广告/推广 ======
  '代练',
  '代打',
  '卖号',
  '买号',
  '转让',
  '出售',
  '出租',
  '租号',
  '刷钻',
  '刷分',
  '刷等级',
  '外挂',
  '作弊',
  '挂',
  '脚本',
  '辅助',

  // ====== 平台滥用 ======
  '封号',
  '举报',
  '投诉',
  '客服',
  '官方',
  '内部',
  '后台',
  '管理员',
  '版主',

  // ====== 违规内容提示 ======
  '破解',
  '盗版',
  '私服',
  '非法',
  '违法',
  '诈骗',
  '骗钱',
  '骗取',
];

const TITLE_MIN = 6;
const TITLE_MAX = 50;
const CONTENT_MIN = 10;
const CONTENT_MAX = 5000;
const TAGS_MAX = 5;
const IMAGES_MAX = 6;
const POST_INTERVAL_MS = 5 * 60 * 1000;

/**
 * 垃圾信息正则模式
 */
const SPAM_PATTERNS = [
  // URL链接（允许正常分享，但检测可疑链接）
  /https?:\/\/[^\s]+\.(xyz|top|win|click|link|biz)/gi,
  // 手机号（防止私下交易）
  /1[3-9]\d{9}/g,
  // QQ号
  /[QqＱ][QqＱ]\s*[号号码]?\s*[:：]?\s*\d{5,10}/g,
  // 微信号
  /微信\s*[号号码]?\s*[:：]?\s*[a-zA-Z0-9_-]{6,20}/g,
  // 重复字符检测（刷屏）
  /(.)\1{5,}/g,
];

/**
 * 检测内容中的敏感词
 */
function checkSensitiveWords(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const word of SENSITIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      found.push(word);
    }
  }

  return found;
}

/**
 * 检测垃圾信息模式
 */
function checkSpamPatterns(text: string): string[] {
  const found: string[] = [];

  for (const pattern of SPAM_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  }

  return found;
}

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

  // 敏感词检测
  const sensitiveInTitle = checkSensitiveWords(trimmedTitle);
  const sensitiveInContent = checkSensitiveWords(trimmedContent);
  if (sensitiveInTitle.length > 0 || sensitiveInContent.length > 0) {
    errors.push('内容包含敏感词，请修改后重试');
  }

  // 垃圾信息模式检测
  const spamInTitle = checkSpamPatterns(trimmedTitle);
  const spamInContent = checkSpamPatterns(trimmedContent);
  if (spamInTitle.length > 0 || spamInContent.length > 0) {
    errors.push('内容可能包含垃圾信息或联系方式，请修改');
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
