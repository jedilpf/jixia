/**
 * 稷下名士录 (Personage Archive)
 * 记录各个门派的护法名士、生平及其在稷下学宫的立场。
 */
export interface Personage {
  id: string;
  name: string;
  title: string;
  factionId: string;
  style: string;
  portrait: string;
  bio: string;
  motto: string;
  unlockedByDefault: boolean;
}

export const PERSONAGES: Personage[] = [
  {
    id: 'mozi',
    name: '墨翟',
    title: '墨家钜子 / 机关大宗师',
    factionId: 'mohist',
    style: '守御与节用',
    portrait: '/assets/chars/stand/mozi.png',
    bio: '不仅是守城防御的大师，更是将天地机巧融入辩论逻辑的先驱。其言如壁垒，坚不可摧。',
    motto: '兼爱非攻，天下大同。',
    unlockedByDefault: true
  },
  {
    id: 'hanfeizi',
    name: '韩非',
    title: '法家集大成者 / 持法辩才',
    factionId: 'legalist',
    style: '法术与威势',
    portrait: '/assets/chars/stand/hanfeizi.png',
    bio: '孤愤而论法。其辞虽讷，其文如霜。主张以法治心，以势夺人，论辩中极具压迫感。',
    motto: '凡治天下，必因人情。',
    unlockedByDefault: true
  },
  {
    id: 'zhuangzi',
    name: '庄周',
    title: '道家宗师 / 逍遥梦蝶者',
    factionId: 'daoist',
    style: '无为与借势',
    portrait: '/assets/chars/stand/zhuangzi.png',
    bio: '御风而行，梦蝶而辩。其逻辑跳脱于形色之外，擅长借力打力，变幻莫测。',
    motto: '天地与我并生，而万物与我为一。',
    unlockedByDefault: true
  },
  {
    id: 'kongqiu',
    name: '孔丘',
    title: '至圣先师 / 儒门之首',
    factionId: 'confucian',
    style: '秩序与教化',
    portrait: '/assets/chars/stand/kongqiu.png',
    bio: '以礼制辩，以仁御气。不仅关注论战的胜负，更在乎论战背后的春秋大义。',
    motto: '君子和而不同，小人同而不和。',
    unlockedByDefault: true
  }
];
