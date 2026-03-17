// CombatDemo.tsx - 战斗效果演示组件
// 展示完整的打斗效果系统

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useCombatEffects,
  AttackAnimation,
  DamageNumber,
  ScreenShake,
  ComboDisplay,
  AttackType,
  ElementType,
} from './CombatEffects';

// ==================== 演示用战斗单位 ====================

interface CombatUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  isPlayer: boolean;
  isAttacking: boolean;
  isHit: boolean;
}

// ==================== 主演示组件 ====================

export function CombatDemo() {
  const [units, setUnits] = useState<CombatUnit[]>([
    { id: 'player', name: '玩家英雄', hp: 100, maxHp: 100, x: 200, y: 400, isPlayer: true, isAttacking: false, isHit: false },
    { id: 'enemy', name: '敌方怪物', hp: 100, maxHp: 100, x: 600, y: 200, isPlayer: false, isAttacking: false, isHit: false },
  ]);
  
  const [selectedAttack, setSelectedAttack] = useState<AttackType>('slash');
  const [selectedElement, setSelectedElement] = useState<ElementType>('physical');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  const {
    effects,
    damageNumbers,
    screenShake,
    comboCount,
    addEffect,
    addDamageNumber,
    removeEffect,
    removeDamageNumber,
  } = useCombatEffects();

  // 执行攻击
  const performAttack = useCallback((attackerId: string, targetId: string) => {
    const attacker = units.find(u => u.id === attackerId);
    const target = units.find(u => u.id === targetId);
    if (!attacker || !target) return;

    // 设置攻击状态
    setUnits(prev => prev.map(u => 
      u.id === attackerId ? { ...u, isAttacking: true } : u
    ));

    // 计算伤害
    const isCritical = Math.random() < 0.2;
    const isDodged = Math.random() < 0.1;
    const isBlocked = Math.random() < 0.15;
    const baseDamage = Math.floor(Math.random() * 20) + 10;
    const damage = isCritical ? Math.floor(baseDamage * 1.5) : baseDamage;

    // 添加攻击效果
    addEffect({
      type: selectedAttack,
      element: selectedElement,
      damage,
      isCritical,
      isDodged,
      isBlocked,
      fromX: attacker.x,
      fromY: attacker.y,
      toX: target.x,
      toY: target.y,
      attackerId,
      targetId,
    });

    // 延迟显示伤害数字
    setTimeout(() => {
      addDamageNumber({
        damage,
        x: target.x,
        y: target.y - 50,
        isCritical,
        isHealing: false,
        isDodged,
        isBlocked,
      });

      // 更新目标血量
      if (!isDodged && !isBlocked) {
        setUnits(prev => prev.map(u => 
          u.id === targetId 
            ? { ...u, hp: Math.max(0, u.hp - damage), isHit: true }
            : u
        ));
      }

      // 清除状态
      setTimeout(() => {
        setUnits(prev => prev.map(u => ({
          ...u,
          isAttacking: false,
          isHit: false,
        })));
      }, 300);
    }, 300);
  }, [units, selectedAttack, selectedElement, addEffect, addDamageNumber]);

  // 自动播放演示
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      const attacker = Math.random() > 0.5 ? 'player' : 'enemy';
      const target = attacker === 'player' ? 'enemy' : 'player';
      
      // 随机选择攻击类型和元素
      const attacks: AttackType[] = ['slash', 'thrust', 'smash', 'magic', 'arrow', 'claw', 'explosion', 'lightning'];
      const elements: ElementType[] = ['fire', 'ice', 'lightning', 'poison', 'physical'];
      setSelectedAttack(attacks[Math.floor(Math.random() * attacks.length)]);
      setSelectedElement(elements[Math.floor(Math.random() * elements.length)]);
      
      performAttack(attacker, target);
    }, 1500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, performAttack]);

  // 重置战斗
  const resetCombat = () => {
    setUnits(prev => prev.map(u => ({ ...u, hp: u.maxHp })));
  };

  return (
    <ScreenShake intensity={screenShake?.intensity || 0} isShaking={!!screenShake}>
      <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        </div>

        {/* 标题 */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
          <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5)' }}>
            ⚔️ 战斗效果演示 ⚔️
          </h1>
          <p className="text-gray-300">点击按钮或开启自动播放查看打斗效果</p>
        </div>

        {/* 控制面板 */}
        <div className="absolute top-24 left-8 z-20 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-bold mb-3">攻击设置</h3>
          
          <div className="mb-3">
            <label className="text-gray-300 text-sm block mb-1">攻击类型</label>
            <select 
              value={selectedAttack}
              onChange={(e) => setSelectedAttack(e.target.value as AttackType)}
              className="w-full bg-gray-800 text-white rounded px-2 py-1 border border-gray-600"
            >
              <option value="slash">⚔️ 斩击</option>
              <option value="thrust">🗡️ 突刺</option>
              <option value="smash">🔨 重击</option>
              <option value="magic">✨ 魔法</option>
              <option value="arrow">🏹 箭矢</option>
              <option value="claw">🐾 爪击</option>
              <option value="bite">🦷 撕咬</option>
              <option value="kick">🦶 踢击</option>
              <option value="punch">👊 拳击</option>
              <option value="throw">🎯 投掷</option>
              <option value="explosion">💥 爆炸</option>
              <option value="lightning">⚡ 闪电</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="text-gray-300 text-sm block mb-1">元素属性</label>
            <select 
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value as ElementType)}
              className="w-full bg-gray-800 text-white rounded px-2 py-1 border border-gray-600"
            >
              <option value="physical">⚪ 物理</option>
              <option value="fire">🔥 火焰</option>
              <option value="ice">❄️ 冰霜</option>
              <option value="lightning">⚡ 雷电</option>
              <option value="poison">☠️ 毒素</option>
              <option value="holy">✨ 圣光</option>
              <option value="shadow">🌑 暗影</option>
            </select>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => performAttack('player', 'enemy')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-all transform hover:scale-105"
            >
              🗡️ 玩家攻击
            </button>
            <button
              onClick={() => performAttack('enemy', 'player')}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-all transform hover:scale-105"
            >
              👹 敌方攻击
            </button>
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`w-full font-bold py-2 px-4 rounded transition-all transform hover:scale-105 ${
                isAutoPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
              } text-white`}
            >
              {isAutoPlaying ? '⏹ 停止自动' : '▶️ 自动播放'}
            </button>
            <button
              onClick={resetCombat}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all"
            >
              🔄 重置
            </button>
          </div>
        </div>

        {/* 战斗区域 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 玩家单位 */}
          <CombatUnitDisplay 
            unit={units.find(u => u.id === 'player')!}
            onClick={() => performAttack('player', 'enemy')}
          />

          {/* 敌方单位 */}
          <CombatUnitDisplay 
            unit={units.find(u => u.id === 'enemy')!}
            onClick={() => performAttack('enemy', 'player')}
          />
        </div>

        {/* 攻击动画层 */}
        <AnimatePresence>
          {effects.map(effect => (
            <AttackAnimation
              key={effect.id}
              effect={effect}
              scale={1}
              onComplete={() => removeEffect(effect.id)}
            />
          ))}
        </AnimatePresence>

        {/* 伤害数字层 */}
        <AnimatePresence>
          {damageNumbers.map(damage => (
            <DamageNumber
              key={damage.id}
              damage={damage.damage}
              x={damage.x}
              y={damage.y}
              isCritical={damage.isCritical}
              isHealing={damage.isHealing}
              isDodged={damage.isDodged}
              isBlocked={damage.isBlocked}
              scale={1}
              onComplete={() => removeDamageNumber(damage.id)}
            />
          ))}
        </AnimatePresence>

        {/* 连招显示 */}
        <ComboDisplay count={comboCount} x={400} y={300} scale={1} />

        {/* 说明文字 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20">
            <p className="text-gray-300 text-sm">
              💡 点击单位进行攻击 | 支持暴击、闪避、格挡 | 屏幕震动效果 | 粒子特效
            </p>
          </div>
        </div>
      </div>
    </ScreenShake>
  );
}

// ==================== 战斗单位显示组件 ====================

interface CombatUnitDisplayProps {
  unit: CombatUnit;
  onClick: () => void;
}

function CombatUnitDisplay({ unit, onClick }: CombatUnitDisplayProps) {
  const hpPercent = (unit.hp / unit.maxHp) * 100;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: unit.x - 60, top: unit.y - 80 }}
      animate={{
        scale: unit.isAttacking ? 1.2 : unit.isHit ? 0.9 : 1,
        x: unit.isHit ? [0, -10, 10, -5, 5, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 单位形象 */}
      <div
        className={`w-32 h-40 rounded-xl border-4 flex flex-col items-center justify-center relative overflow-hidden ${
          unit.isPlayer
            ? 'bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400'
            : 'bg-gradient-to-b from-red-600 to-red-800 border-red-400'
        }`}
        style={{
          boxShadow: unit.isHit 
            ? '0 0 50px rgba(255, 0, 0, 0.8)' 
            : `0 0 30px ${unit.isPlayer ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
        }}
      >
        {/* 单位图标 */}
        <div className="text-6xl mb-2">
          {unit.isPlayer ? '🧙‍♂️' : '👹'}
        </div>
        
        {/* 单位名称 */}
        <div className="text-white font-bold text-sm">{unit.name}</div>

        {/* 受击闪光效果 */}
        <AnimatePresence>
          {unit.isHit && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 血条 */}
      <div className="mt-2 w-32 bg-gray-800 rounded-full h-4 border-2 border-gray-600 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          initial={{ width: `${hpPercent}%` }}
          animate={{ width: `${hpPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* 血量文字 */}
      <div className="text-center mt-1">
        <span className={`font-bold ${hpPercent > 50 ? 'text-green-400' : hpPercent > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
          {unit.hp}/{unit.maxHp} HP
        </span>
      </div>

      {/* 攻击状态指示器 */}
      {unit.isAttacking && (
        <motion.div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <span className="text-2xl">⚔️</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default CombatDemo;
