-- ============================================
-- 稷下学宫·问道百家 - 数据库初始化脚本
-- 版本: 1.0.0
-- 创建日期: 2026-04-10
-- ============================================

-- 启用外键约束
PRAGMA foreign_keys = ON;

-- ============================================
-- 1. 用户相关表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'inactive')),
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin', 'moderator')),
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    opportunity INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT
);

-- 刷新令牌表
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 设备绑定表
CREATE TABLE IF NOT EXISTS device_bindings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'electron', 'mobile')),
    trusted INTEGER DEFAULT 1,
    last_seen_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 2. 卡牌相关表
-- ============================================

-- 卡牌表
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    faction TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('立论', '策术', '玄章', '门客', '反诘')),
    rarity TEXT NOT NULL CHECK (rarity IN ('常见', '稀有', '史诗', '传说')),
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    cost INTEGER NOT NULL,
    attack INTEGER,
    hp INTEGER,
    shield INTEGER,
    skill TEXT NOT NULL,
    background TEXT,
    unlock_level INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1
);

-- 用户卡牌表（拥有关系）
CREATE TABLE IF NOT EXISTS user_cards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    unlocked_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    UNIQUE(user_id, card_id)
);

-- 用户牌组表
CREATE TABLE IF NOT EXISTS user_decks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    faction TEXT NOT NULL,
    cards TEXT NOT NULL, -- JSON数组
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. 对战相关表
-- ============================================

-- 对局表
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    player1_id TEXT NOT NULL,
    player2_id TEXT,
    player1_faction TEXT NOT NULL,
    player2_faction TEXT NOT NULL,
    winner_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'finished')),
    rounds INTEGER DEFAULT 0,
    final_momentum TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    finished_at TEXT,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 对局日志表
CREATE TABLE IF NOT EXISTS match_logs (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    phase TEXT NOT NULL,
    player_id TEXT NOT NULL,
    action TEXT NOT NULL,
    data TEXT, -- JSON
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 4. 进度与存档表
-- ============================================

-- 玩家进度表
CREATE TABLE IF NOT EXISTS player_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    win_streak INTEGER DEFAULT 0,
    max_win_streak INTEGER DEFAULT 0,
    total_damage INTEGER DEFAULT 0,
    collected_cards INTEGER DEFAULT 0,
    opportunity INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 争鸣史存档表
CREATE TABLE IF NOT EXISTS story_saves (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    slot_type TEXT NOT NULL CHECK (slot_type IN ('autosave', 'manual_1', 'manual_2', 'manual_3')),
    version TEXT NOT NULL,
    current_node_id TEXT NOT NULL,
    chapter INTEGER DEFAULT 0,
    scene INTEGER DEFAULT 0,
    player_stats TEXT NOT NULL, -- JSON
    player_relationships TEXT NOT NULL, -- JSON
    player_flags TEXT NOT NULL, -- JSON
    history TEXT NOT NULL, -- JSON
    visited_nodes TEXT, -- JSON
    bridge_state TEXT, -- JSON
    play_time INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, slot_type)
);

-- ============================================
-- 5. 社区相关表
-- ============================================

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('论道', '战报', '问答', '文苑')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT, -- JSON数组
    images TEXT, -- JSON数组
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    is_pinned INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    collect_count INTEGER DEFAULT 0,
    qa_status TEXT DEFAULT 'open' CHECK (qa_status IN ('open', 'answered', 'resolved')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    parent_id TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    like_count INTEGER DEFAULT 0,
    is_answer INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 用户互动表（点赞、收藏）
CREATE TABLE IF NOT EXISTS user_interactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'collect')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, target_type, target_id, interaction_type)
);

-- ============================================
-- 6. 索引创建
-- ============================================

-- 用户表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- 注：email 唯一性在应用层处理，SQLite 不支持部分索引 WHERE email IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 刷新令牌表索引
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 设备绑定表索引
CREATE INDEX IF NOT EXISTS idx_device_bindings_user ON device_bindings(user_id);
CREATE INDEX IF NOT EXISTS idx_device_bindings_device ON device_bindings(device_id);

-- 用户卡牌表索引
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON user_cards(card_id);

-- 用户牌组表索引
CREATE INDEX IF NOT EXISTS idx_user_decks_user_id ON user_decks(user_id);

-- 对局表索引
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_at);

-- 对局日志表索引
CREATE INDEX IF NOT EXISTS idx_match_logs_match ON match_logs(match_id);
CREATE INDEX IF NOT EXISTS idx_match_logs_round ON match_logs(match_id, round);

-- 玩家进度表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_progress_user ON player_progress(user_id);

-- 争鸣史存档表索引
CREATE INDEX IF NOT EXISTS idx_story_saves_user ON story_saves(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_saves_slot ON story_saves(user_id, slot_type);

-- 社区帖子表索引
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_hot ON posts(category, view_count DESC, created_at DESC);

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- 用户互动表索引
CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_target ON user_interactions(target_type, target_id);

-- ============================================
-- 7. 成就相关表
-- ============================================

-- 成就定义表
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('wins', 'games', 'streak', 'collection', 'story', 'social', 'special')),
    tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    requirement TEXT NOT NULL, -- JSON
    reward TEXT NOT NULL, -- JSON
    icon TEXT,
    is_active INTEGER DEFAULT 1
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- 成就表索引
CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- ============================================
-- 7. 初始数据
-- ============================================

-- 插入默认卡牌数据（示例：每个门派一张一阶卡）
INSERT OR IGNORE INTO cards (id, name, faction, type, rarity, tier, cost, skill, unlock_level) VALUES
('card_lxd_001', '温言立论', '礼心殿', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_hjt_001', '衡戒初鸣', '衡戒廷', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_zgq_001', '归真初悟', '归真观', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_xjm_001', '玄匠初作', '玄匠盟', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_jzt_001', '九阵初布', '九阵堂', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_msf_001', '名相初议', '名相府', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_stt_001', '司天初测', '司天台', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_ycg_001', '游策初行', '游策阁', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_wnf_001', '万农初耕', '万农坊', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_jcl_001', '兼采初纳', '兼采楼', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_tgf_001', '天工初制', '天工坊', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_lys_001', '两仪初分', '两仪署', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_xlg_001', '杏林初诊', '杏林馆', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_bys_001', '稗言初录', '稗言社', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_yzy_001', '养真初修', '养真院', '立论', '常见', 1, 2, '获得1点大势', 1),
('card_ctg_001', '筹天初算', '筹天阁', '立论', '常见', 1, 2, '获得1点大势', 1);
