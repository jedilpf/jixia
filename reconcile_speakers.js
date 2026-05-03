import fs from 'fs';
import path from 'path';

const charsDir = 'f:/zz/jixia2.0【完整链路版本】/public/assets/story/chars';
const dataDir = 'f:/zz/jixia2.0【完整链路版本】/src/game/story/data';

const files = fs.readdirSync(charsDir).filter(f => f.endsWith('.png'));
const fileNames = files.map(f => f.replace('.png', ''));

const speakers = new Set();
const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));

dataFiles.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const matches = content.matchAll(/speaker:\s*['"]([^'"]+)['"]/g);
  for (const match of matches) {
    speakers.add(match[1]);
  }
});

console.log('--- Unique Speakers in Story Data ---');
const sortedSpeakers = Array.from(speakers).sort();
sortedSpeakers.forEach(s => console.log(s));

console.log('\n--- Missing Mappings (Speaker has no image defined in mapping) ---');
const SPEAKER_TO_IMAGE = {
  '登记官': 'assets/story/chars/registration_official.png',
  '登记': 'assets/story/chars/registration_official.png',
  '稷下宫主': 'assets/story/chars/school_master.png',
  '祭酒': 'assets/story/chars/jijiu.png',
  '墨家弟子': 'assets/story/chars/mohist_disciple.png',
  '追兵首领': 'assets/story/chars/pursuer_leader.png',
  '法家官员': 'assets/story/chars/legalist_official.png',
  '祖父': 'assets/story/chars/grandfather.png',
  '执笔史官': 'assets/story/chars/history_official.png',
  '孟舆': 'assets/story/chars/meng_yu.png',
  '汝': 'assets/story/chars/meng_yu.png',
  '苏秦': 'assets/story/chars/suqin.png',
  '禽滑厘': 'assets/story/chars/qinhuali.png',
  '慎到': 'assets/story/chars/shendao.png',
  '庄周': 'assets/story/chars/zhuangzhou.png',
  '无名老者': 'assets/story/chars/nameless_elder.png',
  '藏书阁老者': 'assets/story/chars/nameless_elder.png',
  '颜如玉': 'assets/story/chars/yanruyu.png',
  '公输盘': 'assets/story/chars/gongshupan.png',
  '执教长史': 'assets/story/chars/instructor_official.png',
  '儒家讲席': 'assets/story/chars/yanruyu.png',
  '学宫评议席': 'assets/story/chars/jijiu.png',
};

sortedSpeakers.forEach(speaker => {
  if (speaker && !SPEAKER_TO_IMAGE[speaker]) {
    console.log(`Speaker: "${speaker}" is missing a mapping.`);
  }
});

console.log('\n--- Unused Assets (Asset exists but no speaker uses it) ---');
const mappedAssets = new Set(Object.values(SPEAKER_TO_IMAGE).map(a => a.split('/').pop().replace('.png', '')));
fileNames.forEach(file => {
  if (!mappedAssets.has(file)) {
    console.log(`Asset: "${file}.png" is present but not mapped.`);
  }
});
