const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\21389\\Documents\\trae_projects\\jixia2.0【完整链路版本】\\src';
const files = [
    'utils/gameLogic.ts',
    'utils/aiLogic.ts',
    'hooks/useEntityAttack.ts',
    'hooks/useDragAttack.ts',
    'hooks/useDragAndDrop.ts',
    'hooks/useBattleState.ts',
    'data/hero.ts',
    'data/cards.ts',
    'components/BattleLayout.tsx',
    'components/battle/WeaponDisplay.tsx',
    'components/battle/MinionCard.tsx',
    'components/battle/HeroConsole.tsx',
    'components/battle/HeroCard.tsx',
    'components/battle/HandCard.tsx',
    'components/battle/GameResultOverlay.tsx'
];

files.forEach(f => {
    const fp = path.join(dir, f);
    if (fs.existsSync(fp)) {
        let c = fs.readFileSync(fp, 'utf8');
        c = c.replace(/@\/types\/game/g, '@/types');
        fs.writeFileSync(fp, c);
        console.log('Updated ' + f);
    }
});
