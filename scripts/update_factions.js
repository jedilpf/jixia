const fs = require('fs');
const path = require('path');

const replacements = {
    '门派一': '礼心殿',
    '门派二': '衡戒廷',
    '门派三': '归真观',
    '门派四': '玄匠盟',
    '门派五': '九阵堂',
    '门派六': '名相府',
    '门派七': '司天台',
    '门派八': '游策阁',
    '门派九': '万农坊',
    '门派十': '兼采楼'
};

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        for (const [key, value] of Object.entries(replacements)) {
            // Use regex to replace all instances globally
            const regex = new RegExp(key, 'g');
            content = content.replace(regex, value);
        }

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

// Target files
const filesToUpdate = [
    'src/data/cardsDB.json',
    'src/data/showcaseCards.ts',
    'public/游戏机制分析_现有原型卡整理.md',
    'docs/核心信息提取.md',
    'docs/卡牌设计.md',
    '软著申请材料/01-核心提交材料/软件说明书_增强版.md',
    '软著申请材料/提交材料 - 待打印/⚠️重要 - 请更新说明书.md'
];

filesToUpdate.forEach(file => {
    replaceInFile(path.join(__dirname, file));
});
