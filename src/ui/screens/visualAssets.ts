import { getAssetUrl, getCardImageUrl, getCharacterImageUrl } from '@/utils/assets';

export function asset(path: string): string {
  return getAssetUrl(path);
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

export const PRE_BATTLE_BACKGROUND = getAssetUrl('assets/bg-main1.png');

export const FACTION_PORTRAIT_MAP: Record<string, string> = {
  confucian: getCharacterImageUrl('kongqiu', true),
  legalist: getCharacterImageUrl('hanfeizi', true),
  daoist: getCharacterImageUrl('zhuangzi', true),
  mohist: getCharacterImageUrl('mozi', true),
  strategist: getCharacterImageUrl('sunwu', true),
  diplomat: getCharacterImageUrl('guiguzi', true),
  logician: getCharacterImageUrl('huishi', true),
  eclectic: getCharacterImageUrl('xuxing', true),
  agronomist: getCharacterImageUrl('xuxing', true),
  yin_yang: getCharacterImageUrl('zouyan', true),
  novelist: getCharacterImageUrl('huishi'),
  healer: getCharacterImageUrl('luban'),
  musician: getCharacterImageUrl('kongqiu'),
  calendar: getCharacterImageUrl('zouyan'),
  ritualist: getCharacterImageUrl('kongqiu'),
  merchant: getCharacterImageUrl('guiguzi'),
};

export function getFactionPortrait(factionId: string | null | undefined): string {
  if (!factionId) return getAssetUrl('assets/card-back.png');
  return FACTION_PORTRAIT_MAP[factionId] ?? getAssetUrl('assets/card-back.png');
}

export const ISSUE_ART_MAP: Record<string, string> = {
  state_priority: getCardImageUrl('libian', '礼辩同归'),
  crisis_response: getCardImageUrl('zhange', '战鼓催锋'),
  public_will: getCardImageUrl('youshuo', '游说之辞'),
};

export function getIssueArt(issueId: string): string {
  return ISSUE_ART_MAP[issueId] ?? getAssetUrl('assets/text-bg.png');
}
