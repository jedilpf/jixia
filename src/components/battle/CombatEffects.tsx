// CombatEffects.tsx - 完整战斗效果系统
// 提供流畅的动作动画、物理碰撞、多样化招式和视觉反馈

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

// ==================== 类型定义 ====================

export type AttackType = 
  | 'slash'      // 斩击
  | 'thrust'     // 突刺
  | 'smash'      // 重击
  | 'magic'      // 魔法
  | 'arrow'      // 箭矢
  | 'claw'       // 爪击
  | 'bite'       // 撕咬
  | 'kick'       // 踢击
  | 'punch'      // 拳击
  | 'throw'      // 投掷
  | 'explosion'  // 爆炸
  | 'lightning'; // 闪电

export type ElementType =
  | 'fire'       // 火
  | 'ice'        // 冰
  | 'lightning'  // 雷
  | 'poison'     // 毒
  | 'holy'       // 圣光
  | 'shadow'     // 暗影
  | 'physical';  // 物理

export interface CombatEffect {
  id: string;
  type: AttackType;
  element: ElementType;
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  attackerId: string;
  targetId: string;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  type: 'spark' | 'blood' | 'magic' | 'dust' | 'fire' | 'ice';
  count: number;
  color: string;
}

export interface ScreenShake {
  intensity: number;
  duration: number;
}

// ==================== 招式配置 ====================

const ATTACK_CONFIGS: Record<AttackType, {
  name: string;
  icon: string;
  duration: number;
  particleCount: number;
  soundEffect?: string;
}> = {
  slash: { name: '斩击', icon: '⚔️', duration: 400, particleCount: 8 },
  thrust: { name: '突刺', icon: '🗡️', duration: 300, particleCount: 5 },
  smash: { name: '重击', icon: '🔨', duration: 600, particleCount: 12 },
  magic: { name: '魔法', icon: '✨', duration: 500, particleCount: 15 },
  arrow: { name: '箭矢', icon: '🏹', duration: 350, particleCount: 3 },
  claw: { name: '爪击', icon: '🐾', duration: 250, particleCount: 6 },
  bite: { name: '撕咬', icon: '🦷', duration: 300, particleCount: 4 },
  kick: { name: '踢击', icon: '🦶', duration: 350, particleCount: 5 },
  punch: { name: '拳击', icon: '👊', duration: 250, particleCount: 4 },
  throw: { name: '投掷', icon: '🎯', duration: 400, particleCount: 6 },
  explosion: { name: '爆炸', icon: '💥', duration: 700, particleCount: 20 },
  lightning: { name: '闪电', icon: '⚡', duration: 200, particleCount: 10 },
};

const ELEMENT_COLORS: Record<ElementType, { primary: string; secondary: string; glow: string }> = {
  fire: { primary: '#ff4444', secondary: '#ff8800', glow: 'rgba(255, 68, 68, 0.6)' },
  ice: { primary: '#44aaff', secondary: '#88ccff', glow: 'rgba(68, 170, 255, 0.6)' },
  lightning: { primary: '#ffdd00', secondary: '#ffff88', glow: 'rgba(255, 221, 0, 0.6)' },
  poison: { primary: '#44ff44', secondary: '#88ff88', glow: 'rgba(68, 255, 68, 0.6)' },
  holy: { primary: '#ffff88', secondary: '#ffffff', glow: 'rgba(255, 255, 136, 0.6)' },
  shadow: { primary: '#8844ff', secondary: '#aa88ff', glow: 'rgba(136, 68, 255, 0.6)' },
  physical: { primary: '#cccccc', secondary: '#ffffff', glow: 'rgba(200, 200, 200, 0.6)' },
};

// ==================== 攻击动画组件 ====================

interface AttackAnimationProps {
  effect: CombatEffect;
  scale: number;
  onComplete: () => void;
}

export function AttackAnimation({ effect, scale, onComplete }: AttackAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'approach' | 'hit' | 'recover'>('approach');
  const config = ATTACK_CONFIGS[effect.type];
  const colors = ELEMENT_COLORS[effect.element];

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = config.duration;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(elapsed / duration, 1);

      // 分段动画
      if (p < 0.4) {
        setPhase('approach');
        setProgress(p / 0.4);
      } else if (p < 0.6) {
        setPhase('hit');
        setProgress((p - 0.4) / 0.2);
      } else {
        setPhase('recover');
        setProgress((p - 0.6) / 0.4);
      }

      if (p >= 1) {
        onComplete();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete, config.duration]);

  // 计算位置
  let currentX = effect.fromX;
  let currentY = effect.fromY;
  let rotation = 0;
  let scale2 = 1;

  if (phase === 'approach') {
    // 冲向目标
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentX = effect.fromX + (effect.toX - effect.fromX) * easeOut;
    currentY = effect.fromY + (effect.toY - effect.fromY) * easeOut;
    rotation = Math.atan2(effect.toY - effect.fromY, effect.toX - effect.fromX) * (180 / Math.PI);
    scale2 = 1 + progress * 0.3;
  } else if (phase === 'hit') {
    // 命中瞬间
    currentX = effect.toX;
    currentY = effect.toY;
    scale2 = 1.3 - progress * 0.3;
  } else {
    // 后退
    currentX = effect.toX + (effect.fromX - effect.toX) * progress * 0.3;
    currentY = effect.toY + (effect.fromY - effect.toY) * progress * 0.3;
    scale2 = 1 - progress * 0.5;
  }

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${currentX * scale}px`,
        top: `${currentY * scale}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale2})`,
      }}
    >
      {/* 攻击图标 */}
      <motion.div
        className="text-5xl"
        animate={{
          filter: phase === 'hit' ? `drop-shadow(0 0 20px ${colors.glow})` : 'none',
        }}
        style={{
          textShadow: `0 0 30px ${colors.glow}`,
        }}
      >
        {config.icon}
      </motion.div>

      {/* 拖尾效果 */}
      {phase === 'approach' && (
        <div
          className="absolute top-1/2 right-full h-2 rounded-full"
          style={{
            width: `${100 * scale}px`,
            background: `linear-gradient(90deg, transparent, ${colors.primary})`,
            transform: 'translateY(-50%)',
          }}
        />
      )}

      {/* 命中特效 */}
      {phase === 'hit' && (
        <HitEffect 
          type={effect.type} 
          element={effect.element} 
          isCritical={effect.isCritical}
          scale={scale}
        />
      )}
    </div>
  );
}

// ==================== 命中特效组件 ====================

interface HitEffectProps {
  type: AttackType;
  element: ElementType;
  isCritical: boolean;
  scale: number;
}

function HitEffect({ element, isCritical, scale }: HitEffectProps) {
  const colors = ELEMENT_COLORS[element];
  const particleCount = isCritical ? 20 : 10;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 爆炸光环 */}
      <motion.div
        className="absolute rounded-full"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ 
          width: isCritical ? 200 * scale : 120 * scale, 
          height: isCritical ? 200 * scale : 120 * scale, 
          opacity: 0 
        }}
        transition={{ duration: 0.4 }}
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
        }}
      />

      {/* 冲击波 */}
      <motion.div
        className="absolute rounded-full border-4"
        initial={{ width: 20, height: 20, opacity: 1 }}
        animate={{ 
          width: isCritical ? 300 * scale : 180 * scale, 
          height: isCritical ? 300 * scale : 180 * scale, 
          opacity: 0 
        }}
        transition={{ duration: 0.5 }}
        style={{ borderColor: colors.secondary }}
      />

      {/* 粒子效果 */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <Particle
          key={i}
          angle={(360 / particleCount) * i + Math.random() * 30}
          distance={isCritical ? 100 + Math.random() * 50 : 50 + Math.random() * 30}
          color={Math.random() > 0.5 ? colors.primary : colors.secondary}
          scale={scale}
        />
      ))}

      {/* 暴击标记 */}
      {isCritical && (
        <motion.div
          className="absolute text-4xl font-black text-red-500"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1.5, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
            WebkitTextStroke: '2px white',
          }}
        >
          CRIT!
        </motion.div>
      )}
    </div>
  );
}

// ==================== 粒子组件 ====================

interface ParticleProps {
  angle: number;
  distance: number;
  color: string;
  scale: number;
}

function Particle({ angle, distance, color, scale }: ParticleProps) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * distance * scale;
  const y = Math.sin(rad) * distance * scale;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full"
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ 
        x, 
        y, 
        opacity: 0, 
        scale: 0 
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ backgroundColor: color }}
    />
  );
}

// ==================== 伤害数字组件（增强版） ====================

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  isCritical: boolean;
  isHealing: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  scale: number;
  onComplete: () => void;
}

export function DamageNumber({ 
  damage, x, y, isCritical, isHealing, isDodged, isBlocked, scale, onComplete 
}: DamageNumberProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (isDodged) {
      setDisplayText('闪避!');
    } else if (isBlocked) {
      setDisplayText('格挡!');
    } else {
      setDisplayText(isHealing ? `+${damage}` : `-${damage}`);
    }

    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [damage, isHealing, isDodged, isBlocked, onComplete]);

  const getColor = () => {
    if (isDodged) return '#888888';
    if (isBlocked) return '#666666';
    if (isHealing) return '#44ff44';
    if (isCritical) return '#ff4444';
    return '#ffdd44';
  };

  return (
    <motion.div
      className="absolute pointer-events-none z-50 font-black"
      initial={{ 
        x: x * scale, 
        y: y * scale, 
        scale: isCritical ? 2 : 1.5,
        opacity: 1 
      }}
      animate={{ 
        y: (y - 80) * scale,
        scale: isCritical ? 1.8 : 1.2,
        opacity: 0 
      }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        color: getColor(),
        fontSize: isCritical ? '72px' : '48px',
        textShadow: `0 0 20px ${getColor()}, 0 4px 8px rgba(0,0,0,0.8)`,
        WebkitTextStroke: '3px black',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {displayText}
    </motion.div>
  );
}

// ==================== 屏幕震动组件 ====================

interface ScreenShakeProps {
  children: React.ReactNode;
  intensity: number;
  isShaking: boolean;
}

export function ScreenShake({ children, intensity, isShaking }: ScreenShakeProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (!isShaking) {
      controls.stop();
      controls.set({ x: 0, y: 0 });
      return;
    }

    controls.start({
      x: [0, -intensity, intensity, -intensity * 0.8, intensity * 0.8, 0],
      y: [0, intensity * 0.5, -intensity * 0.5, intensity * 0.3, -intensity * 0.3, 0],
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
      },
    });
  }, [isShaking, intensity, controls]);

  return (
    <motion.div animate={controls} style={{ width: '100%', height: '100%' }}>
      {children}
    </motion.div>
  );
}

// ==================== 连招显示组件 ====================

interface ComboDisplayProps {
  count: number;
  x: number;
  y: number;
  scale: number;
}

export function ComboDisplay({ count, x, y, scale }: ComboDisplayProps) {
  if (count < 2) return null;

  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ x: x * scale, y: y * scale, scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400 }}
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div className="text-center">
        <div className="text-6xl font-black text-yellow-400"
          style={{
            textShadow: '0 0 30px #ff8800, 0 4px 8px rgba(0,0,0,0.8)',
            WebkitTextStroke: '2px #ff4400',
          }}
        >
          {count}
        </div>
        <div className="text-2xl font-bold text-white"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          HIT COMBO!
        </div>
      </div>
    </motion.div>
  );
}

// ==================== 战斗效果管理 Hook ====================

export function useCombatEffects() {
  const [effects, setEffects] = useState<CombatEffect[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical: boolean;
    isHealing: boolean;
    isDodged: boolean;
    isBlocked: boolean;
  }>>([]);
  const [screenShake, setScreenShake] = useState<ScreenShake | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const comboTimer = useRef<NodeJS.Timeout | null>(null);

  const addEffect = useCallback((effect: Omit<CombatEffect, 'id'>) => {
    const id = `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEffect = { ...effect, id };
    setEffects(prev => [...prev, newEffect]);

    // 触发屏幕震动
    if (effect.isCritical || effect.type === 'explosion' || effect.type === 'smash') {
      setScreenShake({ intensity: effect.isCritical ? 15 : 8, duration: 400 });
      setTimeout(() => setScreenShake(null), 400);
    }

    // 连招计数
    setComboCount(prev => {
      const newCount = prev + 1;
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setComboCount(0), 2000);
      return newCount;
    });

    return id;
  }, []);

  const addDamageNumber = useCallback((params: {
    damage: number;
    x: number;
    y: number;
    isCritical?: boolean;
    isHealing?: boolean;
    isDodged?: boolean;
    isBlocked?: boolean;
  }) => {
    const id = `damage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setDamageNumbers(prev => [...prev, { ...params, id, 
      isCritical: params.isCritical || false,
      isHealing: params.isHealing || false,
      isDodged: params.isDodged || false,
      isBlocked: params.isBlocked || false,
    }]);
    return id;
  }, []);

  const removeEffect = useCallback((id: string) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  const removeDamageNumber = useCallback((id: string) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  }, []);

  return {
    effects,
    damageNumbers,
    screenShake,
    comboCount,
    addEffect,
    addDamageNumber,
    removeEffect,
    removeDamageNumber,
  };
}

export default useCombatEffects;
