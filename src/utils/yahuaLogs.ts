/**
 * Yahua Logs - 雅化日志生成器
 * 
 * 将基础战斗动作转化为具有“春秋论辩”风格的锦绣文案。
 */

export interface LogContext {
  playerName?: string;
  targetName?: string;
  value?: number;
  faction?: string;
}

const TEMPLATES = {
  // 对局系统
  BATTLE_START: [
    "稷下学宫，海纳百川。今日辩端既开，愿诸子各抒胸臆，共定天下名实。",
    "钟鸣鼎食，百家争鸣。且看今日论道场上，谁人能执天下之牛耳？",
    "风起稷下，辩锋初显。此时此地，名实之辩，正式开启。"
  ],
  BATTLE_WIN: [
    "辞锋敛尽，胜负已分。今日之论，当载于史册，传于后世。",
    "彼方哑口，辩论终息。此战既胜，足见君之道，乃天下之正途。"
  ],
  BATTLE_LOSE: [
    "论点崩塌，底蕴消散。今日之败，非道之误，乃运之未至也。",
    "辩才不敌，退而自省。愿君卧薪尝胆，他日再来问鼎稷下。"
  ],

  // 战斗动作
  DAMAGE_DEALT: [
    "《{playerName}》词锋犀利，直击《{targetName}》本心，挫其底蕴 {value} 点。",
    "言如利剑，势如破竹。《{playerName}》一论既出，令《{targetName}》辩志不稳，底蕴受损 {value} 点。",
    "《{playerName}》驳斥有力，如平地惊雷，震荡《{targetName}》学识，底蕴折损 {value} 点。"
  ],
  SHIELD_GAIN: [
    "《{playerName}》秉持正道，其守若坚，立【护持】 {value} 层于席前。",
    "言之有据，无懈可击。《{playerName}》获得【护持】 {value} 层，防患于未然。",
    "正气凛然，邪不可干。《{playerName}》周身底蕴内敛，化为【护持】 {value} 层。"
  ],
  DRAW_CARD: [
    "《{playerName}》博览群书，于方寸间偶得新章，思绪大开。",
    "兼听则明，博采众长。《{playerName}》得百家之微言，心通意达，新得策卷一次。"
  ],
  PLAY_CARD: [
    "《{playerName}》思辨既明，抛出《{value}》论点，立于【{targetName}】。",
    "名正言顺，词锋疾出。《{playerName}》落笔生花，呈上《{value}》策论至【{targetName}】。",
    "议席之上，语惊四座。《{playerName}》提交《{value}》卷宗，直指【{targetName}】之要害。"
  ],
  ROUND_RESULT: [
    "明辩之下，优劣自现。我方势如破竹，敌方渐露破绽。",
    "此番交锋，堪称春秋绝唱。双方各有千秋，然大势已悄然偏移。"
  ],
  
  // 阵营特色
  RUJIA_ACTIVATE: [
    "儒者垂裳而治，以礼节之。浩然正气盈于会场。"
  ],
  FAJIA_ACTIVATE: [
    "法者严明如铁，以律定之。峻法威严，令众生屏息。"
  ],
  MOJIA_ACTIVATE: [
    "墨者兼爱非攻，以技济世。机关枢机错落，奇巧天成。"
  ]
};

function getRandomTemplate(category: keyof typeof TEMPLATES): string {
  const list = TEMPLATES[category];
  return list[Math.floor(Math.random() * list.length)];
}

export function formatYahuaLog(category: keyof typeof TEMPLATES, ctx: LogContext): string {
  let template = getRandomTemplate(category);
  return template
    .replace('{playerName}', ctx.playerName || '名士')
    .replace('{targetName}', ctx.targetName || '对手')
    .replace('{value}', String(ctx.value || 0))
    .replace('{faction}', ctx.faction || '百家');
}
