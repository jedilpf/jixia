export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export const PRE_BATTLE_COLORS = {
  textMain: '#f3debc',
  textMuted: '#bca47f',
  border: '#7a5a34',
  panel: 'rgba(26, 18, 12, 0.88)',
  panelSoft: 'rgba(39, 28, 18, 0.76)',
  button: '#6b3d1f',
  buttonHover: '#844b25',
};

export const PRE_BATTLE_BACKGROUND = asset('/assets/bg-main1.png');

export const FACTION_PORTRAIT_MAP: Record<string, string> = {
  confucian: asset('/assets/chars/stand/kongqiu.png'),
  legalist: asset('/assets/chars/stand/hanfeizi.png'),
  daoist: asset('/assets/chars/stand/zhuangzi.png'),
  mohist: asset('/assets/chars/stand/mozi.png'),
  strategist: asset('/assets/chars/stand/sunwu.png'),
  diplomat: asset('/assets/chars/stand/guiguzi.png'),
  logician: asset('/assets/chars/stand/huishi.png'),
  eclectic: asset('/assets/chars/stand/xuxing.png'),
  agronomist: asset('/assets/chars/stand/xuxing.png'),
  yin_yang: asset('/assets/chars/stand/zouyan.png'),
  novelist: asset('/assets/chars/huishi.png'),
  healer: asset('/assets/chars/luban.png'),
  musician: asset('/assets/chars/kongqiu.png'),
  calendar: asset('/assets/chars/zouyan.png'),
  ritualist: asset('/assets/chars/kongqiu.png'),
  merchant: asset('/assets/chars/guiguzi.png'),
};

export function getFactionPortrait(factionId: string | null | undefined): string {
  if (!factionId) return asset('/assets/card-back.png');
  return FACTION_PORTRAIT_MAP[factionId] ?? asset('/assets/card-back.png');
}

export const ISSUE_ART_MAP: Record<string, string> = {
  state_priority: asset('/assets/cards/libian.jpg'),
  crisis_response: asset('/assets/cards/zhange.jpg'),
  public_will: asset('/assets/cards/youshuo.jpg'),
};

export function getIssueArt(issueId: string): string {
  return ISSUE_ART_MAP[issueId] ?? asset('/assets/text-bg.png');
}
