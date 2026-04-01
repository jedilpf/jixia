const fs = require('fs');
const path = require('path');

const DOC_PATH = 'C:/Users/21389/Desktop/百家争鸣_v1.2_全量卡牌数据.md';
const RUNS_PER_MATCHUP = 100;

const SETTINGS = {
  targetMomentum: 8,
  maxRounds: 40,
  openingHand: 5,
  secondPlayerBonusDraw: 1,
  drawPerRound: 1,
  maxCardsPerTurn: 2,
  maxChip: 1,
  baseBudget: 3,
  budgetRoundRamp: 2,
  budgetMax: 6,
};

const FACTIONS = ['礼心殿', '游策阁', '名相府', '万农坊'];
const COMMON_FACTION = '通用';

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function parseCardsFromMd(text) {
  const lines = text.split(/\r?\n/);
  const rows = lines.filter((line) => line.trim().startsWith('|'));
  const dataRows = rows.slice(2);

  return dataRows
    .map((row) => row.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((cols) => cols.length === 7)
    .map(([faction, name, type, cost, power, hp, effect]) => ({
      faction,
      name,
      type,
      cost: Number(cost),
      power: type === '立论' ? Number(power) : 0,
      hp: type === '立论' ? Number(hp) : 0,
      effect,
    }));
}

function makeDeck(allCards, faction) {
  const deck = allCards.filter((c) => c.faction === faction || c.faction === COMMON_FACTION);
  return shuffle(deck);
}

function makePlayer(allCards, faction) {
  return {
    faction,
    deck: makeDeck(allCards, faction),
    hand: [],
    discard: [],
    slots: { main: null, side: null },
    chips: 0,
    momentum: 0,
    extraMomentumFromCardsThisRound: 0,
    pendingGonglun: false,
    wonMainThisRound: false,
    wonSideThisRound: false,
    wonSideLastRound: false,
    movedThisRound: false,
    mainMovedThisRound: false,
    nextLunDiscount: 0,
    firstShiCeDiscountUsed: false,
    shiCePlayedThisRound: 0,
  };
}

function cloneToBoardCard(template, slot) {
  return {
    ...template,
    slot,
    tempPower: 0,
    silenced: false,
    cantGainPower: false,
    movedThisRound: false,
    hpNow: template.hp,
  };
}

function drawCards(player, n) {
  for (let i = 0; i < n; i += 1) {
    if (player.deck.length === 0 && player.discard.length > 0) {
      player.deck = shuffle(player.discard.splice(0));
    }
    const card = player.deck.shift();
    if (!card) return;
    player.hand.push(card);
  }
}

function discardRandom(player, n) {
  for (let i = 0; i < n; i += 1) {
    if (!player.hand.length) return;
    const idx = Math.floor(Math.random() * player.hand.length);
    const [card] = player.hand.splice(idx, 1);
    player.discard.push(card);
  }
}

function energyForRound(round) {
  return Math.min(
    SETTINGS.budgetMax,
    SETTINGS.baseBudget + Math.floor((round - 1) / SETTINGS.budgetRoundRamp)
  );
}

function getFriendlyCards(player) {
  return [player.slots.main, player.slots.side].filter(Boolean);
}

function pickFriendlyCard(player, opts = {}) {
  const cards = getFriendlyCards(player).filter((c) => !(opts.excludeName && c.name === opts.excludeName));
  if (!cards.length) return null;

  if (opts.damagedFirst) {
    const damaged = cards.filter((c) => c.hpNow < c.hp);
    if (damaged.length) return damaged.sort((a, b) => (a.hpNow - b.hpNow))[0];
  }

  const main = player.slots.main;
  if (main && cards.some((c) => c === main)) return main;
  return cards[0];
}

function pickEnemyCard(enemy) {
  return enemy.slots.main ?? enemy.slots.side ?? null;
}

function adjustPower(card, delta) {
  if (!card) return;
  if (delta > 0 && card.cantGainPower) return;
  card.tempPower += delta;
}

function healCard(card, amount) {
  if (!card || amount <= 0) return;
  card.hpNow = Math.min(card.hp, card.hpNow + amount);
}

function damageCard(player, card, amount) {
  if (!card || amount <= 0) return;
  card.hpNow -= amount;
  if (card.hpNow <= 0) {
    const slot = card.slot;
    player.discard.push({
      faction: card.faction,
      name: card.name,
      type: card.type,
      cost: card.cost,
      power: card.power,
      hp: card.hp,
      effect: card.effect,
    });
    player.slots[slot] = null;
  }
}

function moveWithinPlayer(player, from, to) {
  if (!player.slots[from] || player.slots[to]) return false;
  const card = player.slots[from];
  player.slots[from] = null;
  player.slots[to] = card;
  card.slot = to;
  card.movedThisRound = true;
  player.movedThisRound = true;
  if (from === 'main' || to === 'main') player.mainMovedThisRound = true;

  if (card.name === '游士借席') {
    adjustPower(card, 1);
  }
  if (player.slots.side && player.slots.side.name === '纵横门生') {
    adjustPower(player.slots.side, 1);
  }
  return true;
}

function swapMainSide(player) {
  const main = player.slots.main;
  const side = player.slots.side;
  player.slots.main = side;
  player.slots.side = main;
  if (player.slots.main) player.slots.main.slot = 'main';
  if (player.slots.side) player.slots.side.slot = 'side';

  if (main || side) {
    player.movedThisRound = true;
    player.mainMovedThisRound = true;
  }
}

function addExtraMomentumFromCard(player, amount) {
  const remain = Math.max(0, 1 - player.extraMomentumFromCardsThisRound);
  const gain = Math.min(remain, amount);
  if (gain <= 0) return;
  player.extraMomentumFromCardsThisRound += gain;
  player.momentum += gain;
}

function parseFirstNumber(effect, regex) {
  const m = effect.match(regex);
  return m ? Number(m[1]) : 0;
}

function parseAllNumbers(effect, regex) {
  return [...effect.matchAll(regex)].map((m) => Number(m[1]));
}

function applyEffectByText(card, player, enemy, placedCard) {
  const effect = card.effect || '';

  if (effect.includes('交换你主议与旁议')) {
    swapMainSide(player);
  }
  if (effect.includes('移到另一个议位')) {
    if (!moveWithinPlayer(player, 'side', 'main')) {
      moveWithinPlayer(player, 'main', 'side');
    }
  }
  if (effect.includes('从旁议移到主议')) {
    moveWithinPlayer(player, 'side', 'main');
  }

  if (effect.includes('抽')) {
    const drawNums = parseAllNumbers(effect, /抽(\d+)张牌/g);
    const drawTotal = drawNums.reduce((a, b) => a + b, 0);
    if (drawTotal > 0) drawCards(player, drawTotal);
  }
  if (effect.includes('弃')) {
    const discardNums = parseAllNumbers(effect, /弃(\d+)张牌/g);
    const discardTotal = discardNums.reduce((a, b) => a + b, 0);
    if (discardTotal > 0) discardRandom(player, discardTotal);
  }

  if (effect.includes('文本失效')) {
    const target = pickEnemyCard(enemy);
    if (target) target.silenced = true;
  }
  if (effect.includes('不能获得辩锋提升')) {
    const target = pickEnemyCard(enemy);
    if (target) target.cantGainPower = true;
  }
  if (effect.includes('辩锋改为1')) {
    const target = pickEnemyCard(enemy);
    if (target) {
      target.tempPower += (1 - (target.power + target.tempPower));
    }
  }

  const signedPowerNums = parseAllNumbers(effect, /([+-]\d+)\s*辩锋/g);
  for (const delta of signedPowerNums) {
    if (delta > 0) {
      const target = effect.includes('本牌') && placedCard
        ? placedCard
        : pickFriendlyCard(player, { excludeName: effect.includes('另一张') ? placedCard?.name : undefined });
      adjustPower(target, delta);
    } else {
      const target = effect.includes('对位敌方立论') && placedCard
        ? enemy.slots[placedCard.slot] ?? pickEnemyCard(enemy)
        : pickEnemyCard(enemy);
      adjustPower(target, delta);
    }
  }

  const plusRootNums = parseAllNumbers(effect, /\+(\d+)\s*根基/g);
  for (const n of plusRootNums) {
    const target = pickFriendlyCard(player, { damagedFirst: true });
    healCard(target, n);
  }

  const recoverNums = parseAllNumbers(effect, /恢复(\d+)根基/g);
  for (const n of recoverNums) {
    const target = pickFriendlyCard(player, { damagedFirst: true });
    healCard(target, n);
  }

  const loseRootNums = parseAllNumbers(effect, /失去(\d+)根基/g);
  for (const n of loseRootNums) {
    const target = pickEnemyCard(enemy);
    if (target) damageCard(enemy, target, n);
  }

  if (card.name === '社仓余粮') {
    player.nextLunDiscount = Math.max(player.nextLunDiscount, 1);
  }
  if (card.name === '公论成势') {
    player.pendingGonglun = true;
  }
}

function scoreCardForPlay(card, player) {
  let score = 0;
  if (card.type === '立论') {
    score += card.power * 2 + card.hp;
    if (!player.slots.main) score += 4;
    if (!player.slots.side) score += 2;
  } else {
    score += 3;
    if (card.effect.includes('-2 辩锋')) score += 3;
    if (card.effect.includes('+1 辩锋')) score += 2;
    if (card.effect.includes('抽2张牌')) score += 2;
    if (card.name === '公论成势') score += 4;
  }
  score += Math.random() * 0.5;
  return score;
}

function hasCardNamed(player, name) {
  return Boolean(
    (player.slots.main && player.slots.main.name === name) ||
    (player.slots.side && player.slots.side.name === name)
  );
}

function calcCardCost(card, player) {
  let cost = card.cost;
  if (card.type === '施策' && !player.firstShiCeDiscountUsed && hasCardNamed(player, '纵横门生')) {
    cost -= 1;
  }
  if (card.type === '立论' && player.nextLunDiscount > 0) {
    cost -= player.nextLunDiscount;
  }
  return Math.max(0, cost);
}

function consumeCostDiscounts(card, player) {
  if (card.type === '施策' && !player.firstShiCeDiscountUsed && hasCardNamed(player, '纵横门生')) {
    player.firstShiCeDiscountUsed = true;
  }
  if (card.type === '立论' && player.nextLunDiscount > 0) {
    player.nextLunDiscount = 0;
  }
}

function tryPlayOneCard(player, enemy, budget) {
  const canPlaceLun = !player.slots.main || !player.slots.side;
  const candidates = player.hand.filter((c) => (c.type === '立论' ? canPlaceLun : true));
  if (!candidates.length) return { budget, played: false };

  const scored = candidates
    .map((card, idx) => ({ card, idx, score: scoreCardForPlay(card, player) }))
    .sort((a, b) => b.score - a.score);

  for (const item of scored) {
    const card = item.card;
    const cost = calcCardCost(card, player);
    let finalCost = cost;
    let useChip = false;

    if (finalCost > budget) {
      if (player.chips > 0 && finalCost - 1 <= budget) {
        finalCost -= 1;
        useChip = true;
      } else {
        continue;
      }
    }

    if (useChip) player.chips -= 1;
    budget -= finalCost;
    consumeCostDiscounts(card, player);

    const handIndex = player.hand.findIndex((h) => h.name === card.name && h.effect === card.effect && h.cost === card.cost);
    const [playedCard] = player.hand.splice(handIndex, 1);

    let placedCard = null;
    if (playedCard.type === '立论') {
      const slot = !player.slots.main ? 'main' : (!player.slots.side ? 'side' : null);
      if (slot) {
        placedCard = cloneToBoardCard(playedCard, slot);
        player.slots[slot] = placedCard;
      } else {
        player.discard.push(playedCard);
      }
    } else {
      player.discard.push(playedCard);
      player.shiCePlayedThisRound += 1;

      if (player.slots.main && player.slots.main.name === '辞锋术士') {
        adjustPower(player.slots.main, 1);
      }
      if (player.slots.side && player.slots.side.name === '辞锋术士') {
        adjustPower(player.slots.side, 1);
      }
      if (player.slots.main && player.slots.main.name === '执礼门生') {
        adjustPower(player.slots.main, 1);
      }
      if (player.slots.side && player.slots.side.name === '执礼门生') {
        adjustPower(player.slots.side, 1);
      }
    }

    applyEffectByText(playedCard, player, enemy, placedCard);
    return { budget, played: true };
  }

  return { budget, played: false };
}

function cleanupSilencedCards(player) {
  ['main', 'side'].forEach((slot) => {
    const card = player.slots[slot];
    if (!card) return;
    if (card.silenced) {
      card.tempPower = 0;
      card.cantGainPower = false;
    }
  });
}

function resolveSlot(a, b, slot) {
  const aCard = a.slots[slot];
  const bCard = b.slots[slot];
  const ap = aCard ? Math.max(0, aCard.power + aCard.tempPower) : 0;
  const bp = bCard ? Math.max(0, bCard.power + bCard.tempPower) : 0;

  if (ap === bp) {
    if (aCard) damageCard(a, aCard, 1);
    if (bCard) damageCard(b, bCard, 1);
    return;
  }

  if (ap > bp) {
    if (slot === 'main') {
      a.momentum += 1;
      a.wonMainThisRound = true;
    } else {
      a.chips = Math.min(SETTINGS.maxChip, a.chips + 1);
      a.wonSideThisRound = true;
    }
  } else {
    if (slot === 'main') {
      b.momentum += 1;
      b.wonMainThisRound = true;
    } else {
      b.chips = Math.min(SETTINGS.maxChip, b.chips + 1);
      b.wonSideThisRound = true;
    }
  }
}

function applyRoundEndTriggers(player) {
  if (player.pendingGonglun && player.wonMainThisRound && !player.mainMovedThisRound) {
    addExtraMomentumFromCard(player, 1);
  }
  player.pendingGonglun = false;

  const liBian = (player.slots.main && player.slots.main.name === '礼辩同归')
    || (player.slots.side && player.slots.side.name === '礼辩同归');
  if (liBian && player.wonMainThisRound) {
    const target = pickFriendlyCard(player, { damagedFirst: true });
    healCard(target, 1);
  }
}

function endRoundCleanup(player) {
  player.wonSideLastRound = player.wonSideThisRound;
  player.wonMainThisRound = false;
  player.wonSideThisRound = false;
  player.extraMomentumFromCardsThisRound = 0;
  player.movedThisRound = false;
  player.mainMovedThisRound = false;
  player.firstShiCeDiscountUsed = false;
  player.shiCePlayedThisRound = 0;

  ['main', 'side'].forEach((slot) => {
    const c = player.slots[slot];
    if (!c) return;
    c.tempPower = 0;
    c.silenced = false;
    c.cantGainPower = false;
    c.movedThisRound = false;
  });
}

function playRound(first, second, round) {
  drawCards(first, SETTINGS.drawPerRound);
  drawCards(second, SETTINGS.drawPerRound);

  let budgetFirst = energyForRound(round);
  let budgetSecond = energyForRound(round);

  for (let i = 0; i < SETTINGS.maxCardsPerTurn; i += 1) {
    const r1 = tryPlayOneCard(first, second, budgetFirst);
    budgetFirst = r1.budget;
    const r2 = tryPlayOneCard(second, first, budgetSecond);
    budgetSecond = r2.budget;
    if (!r1.played && !r2.played) break;
  }

  cleanupSilencedCards(first);
  cleanupSilencedCards(second);

  resolveSlot(first, second, 'main');
  resolveSlot(first, second, 'side');

  applyRoundEndTriggers(first);
  applyRoundEndTriggers(second);
}

function whoWins(a, b) {
  if (a.momentum >= SETTINGS.targetMomentum && b.momentum >= SETTINGS.targetMomentum) {
    if (a.momentum > b.momentum) return a.faction;
    if (b.momentum > a.momentum) return b.faction;
    return 'draw';
  }
  if (a.momentum >= SETTINGS.targetMomentum) return a.faction;
  if (b.momentum >= SETTINGS.targetMomentum) return b.faction;
  return null;
}

function simulateSingleGame(allCards, factionA, factionB, firstFaction) {
  const a = makePlayer(allCards, factionA);
  const b = makePlayer(allCards, factionB);

  const first = firstFaction === factionA ? a : b;
  const second = firstFaction === factionA ? b : a;

  drawCards(first, SETTINGS.openingHand);
  drawCards(second, SETTINGS.openingHand + SETTINGS.secondPlayerBonusDraw);

  let roundsPlayed = 0;
  for (let round = 1; round <= SETTINGS.maxRounds; round += 1) {
    roundsPlayed = round;
    playRound(first, second, round);
    const winnerMid = whoWins(a, b);
    if (winnerMid) {
      endRoundCleanup(a);
      endRoundCleanup(b);
      return { winner: winnerMid, rounds: roundsPlayed, momentumA: a.momentum, momentumB: b.momentum };
    }
    endRoundCleanup(a);
    endRoundCleanup(b);
  }

  if (a.momentum > b.momentum) return { winner: factionA, rounds: roundsPlayed, momentumA: a.momentum, momentumB: b.momentum };
  if (b.momentum > a.momentum) return { winner: factionB, rounds: roundsPlayed, momentumA: a.momentum, momentumB: b.momentum };
  return { winner: 'draw', rounds: roundsPlayed, momentumA: a.momentum, momentumB: b.momentum };
}

function runMatchup(allCards, factionA, factionB, runs) {
  const result = {
    matchup: `${factionA} vs ${factionB}`,
    runs,
    wins: { [factionA]: 0, [factionB]: 0, draw: 0 },
    avgRounds: 0,
    avgMomentum: { [factionA]: 0, [factionB]: 0 },
  };

  let roundsTotal = 0;
  let mATotal = 0;
  let mBTotal = 0;

  for (let i = 0; i < runs; i += 1) {
    const firstFaction = i % 2 === 0 ? factionA : factionB;
    const one = simulateSingleGame(allCards, factionA, factionB, firstFaction);
    result.wins[one.winner] += 1;
    roundsTotal += one.rounds;
    mATotal += one.momentumA;
    mBTotal += one.momentumB;
  }

  result.avgRounds = Number((roundsTotal / runs).toFixed(2));
  result.avgMomentum[factionA] = Number((mATotal / runs).toFixed(2));
  result.avgMomentum[factionB] = Number((mBTotal / runs).toFixed(2));
  return result;
}

function matchupIssues(matchupResult) {
  const entries = Object.entries(matchupResult.wins).filter(([k]) => k !== 'draw');
  entries.sort((a, b) => b[1] - a[1]);
  const [topName, topWins] = entries[0];
  const rate = topWins / matchupResult.runs;
  const drawRate = matchupResult.wins.draw / matchupResult.runs;

  const issues = [];
  if (rate >= 0.65) issues.push(`单边胜率偏高：${topName} 胜率 ${(rate * 100).toFixed(1)}%`);
  if (drawRate >= 0.15) issues.push(`平局偏多：${(drawRate * 100).toFixed(1)}%`);
  if (matchupResult.avgRounds <= 6) issues.push(`对局偏短：平均 ${matchupResult.avgRounds} 回合`);
  if (matchupResult.avgRounds >= 20) issues.push(`对局偏长：平均 ${matchupResult.avgRounds} 回合`);
  return issues;
}

function main() {
  if (!fs.existsSync(DOC_PATH)) {
    console.error(`文档不存在：${DOC_PATH}`);
    process.exit(1);
  }

  const text = fs.readFileSync(DOC_PATH, 'utf8');
  const cards = parseCardsFromMd(text);

  const results = [];
  for (let i = 0; i < FACTIONS.length; i += 1) {
    for (let j = i + 1; j < FACTIONS.length; j += 1) {
      results.push(runMatchup(cards, FACTIONS[i], FACTIONS[j], RUNS_PER_MATCHUP));
    }
  }

  const issues = results.flatMap((r) => matchupIssues(r).map((msg) => `[${r.matchup}] ${msg}`));

  const report = {
    docPath: DOC_PATH,
    rulesApplied: {
      targetMomentum: SETTINGS.targetMomentum,
      openingHand: SETTINGS.openingHand,
      secondPlayerBonusDraw: SETTINGS.secondPlayerBonusDraw,
      maxCardsPerTurn: SETTINGS.maxCardsPerTurn,
      maxChip: SETTINGS.maxChip,
      cardExtraMomentumCapPerRound: 1,
      roundTieDamage: 1,
      mainWinMomentum: 1,
      sideWinChip: 1,
      runsPerMatchup: RUNS_PER_MATCHUP,
    },
    assumptions: [
      '每回合双方各抽1张',
      '用度曲线为 3 起步，每2回合+1，最高6',
      '以卡牌文本关键词驱动效果，不可机读的复杂时序按近似规则处理',
    ],
    matchups: results,
    issues,
  };

  const outPath = path.join(__dirname, 'baijia-battle-100run-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`已完成对战模拟，报告：${outPath}`);
  results.forEach((r) => {
    console.log(
      `${r.matchup} -> ${Object.keys(r.wins).map((k) => `${k}:${r.wins[k]}`).join(', ')} | avgRounds=${r.avgRounds}`
    );
  });
  console.log(`问题数：${issues.length}`);
}

main();
