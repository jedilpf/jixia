import { useEffect, useState, useCallback } from 'react';
import { BoardPosition } from '@/types';

// ==================== 攻击动画状态 ====================

export interface AttackAnimation {
  id: string;
  attackerType: 'minion' | 'hero';
  attackerPlayerId: 'player' | 'enemy';
  attackerPos: BoardPosition | null; // null for hero
  targetType: 'minion' | 'hero';
  targetPlayerId: 'player' | 'enemy';
  targetPos: BoardPosition | null; // null for hero
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  damage: number;
  isComplete: boolean;
}

// ==================== 出牌动画状态 ====================

export interface PlayCardAnimation {
  id: string;
  cardName: string;
  playerId: 'player' | 'enemy';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isComplete: boolean;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isCritical?: boolean;
  isHealing?: boolean;
}

export interface ShakeEffect {
  id: string;
  targetId: string;
  intensity: number;
  duration: number;
}

// ==================== 攻击动画组件 ====================

interface AttackAnimatorProps {
  animation: AttackAnimation;
  scale: number;
  onComplete: () => void;
}

export function AttackAnimator({ animation, scale, onComplete }: AttackAnimatorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 400; // 总时长400ms
      const p = Math.min(elapsed / duration, 1);

      // 简化的攻击动画：冲过去 -> 消失
      // 0-70%: 冲向目标 (ease-out)
      // 70-100%: 在目标位置淡出
      if (p < 0.7) {
        const rushProgress = p / 0.7;
        const easeOut = 1 - Math.pow(1 - rushProgress, 3);
        setProgress(easeOut);
      } else {
        // 到达目标后保持位置，准备消失
        setProgress(1);
      }

      if (p >= 1) {
        onComplete();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete]);

  // 计算当前位置
  const currentX = animation.fromX + (animation.toX - animation.fromX) * progress;
  const currentY = animation.fromY + (animation.toY - animation.fromY) * progress;

  // 计算旋转角度（根据移动方向）
  const angle = Math.atan2(animation.toY - animation.fromY, animation.toX - animation.fromX) * (180 / Math.PI);

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${currentX * scale}px`,
        top: `${currentY * scale}px`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        transition: 'none',
      }}
    >
      {/* 攻击轨迹特效 */}
      {progress < 0.8 && (
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
          style={{
            width: `${100 * scale}px`,
            transform: 'translateY(-50%)',
            opacity: 0.8,
          }}
        />
      )}

      {/* 攻击者幽灵 */}
      <div
        className={`w-16 h-20 rounded-lg border-2 flex items-center justify-center ${animation.attackerPlayerId === 'player'
          ? 'bg-cyan-600/80 border-cyan-400'
          : 'bg-red-600/80 border-red-400'
          }`}
        style={{
          boxShadow: '0 0 20px rgba(250, 204, 21, 0.6)',
        }}
      >
        <span className="text-white text-2xl">⚔️</span>
      </div>

      {/* 命中特效 */}
      {progress >= 0.7 && progress < 0.9 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'hit-explode 0.1s ease-out',
          }}
        >
          <div className="w-24 h-24 rounded-full bg-yellow-400/60 animate-ping" />
        </div>
      )}
    </div>
  );
}

// ==================== 出牌动画组件 ====================

interface PlayCardAnimatorProps {
  animation: PlayCardAnimation;
  scale: number;
  onComplete: () => void;
}

export function PlayCardAnimator({ animation, scale, onComplete }: PlayCardAnimatorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 500; // 500ms 出牌动画

      const p = Math.min(elapsed / duration, 1);
      // ease-out 缓动
      const easeOut = 1 - Math.pow(1 - p, 3);
      setProgress(easeOut);

      if (p >= 1) {
        onComplete();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete]);

  // 计算当前位置
  const currentX = animation.fromX + (animation.toX - animation.fromX) * progress;
  const currentY = animation.fromY + (animation.toY - animation.fromY) * progress;

  // 缩放效果：从大到小
  const cardScale = 1 - progress * 0.2;
  const opacity = 1 - progress * 0.5;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${currentX * scale}px`,
        top: `${currentY * scale}px`,
        transform: `translate(-50%, -50%) scale(${cardScale})`,
        opacity,
        transition: 'none',
      }}
    >
      {/* 卡牌 */}
      <div
        className={`w-20 h-28 rounded-lg border-2 flex items-center justify-center ${animation.playerId === 'player'
          ? 'bg-cyan-800/90 border-cyan-400'
          : 'bg-red-800/90 border-red-400'
          }`}
        style={{
          boxShadow: '0 0 30px rgba(250, 204, 21, 0.5)',
        }}
      >
        <span className="text-white text-xs font-bold text-center px-1">{animation.cardName}</span>
      </div>

      {/* 出牌轨迹 */}
      <div
        className="absolute top-1/2 left-1/2 h-1 bg-gradient-to-r from-yellow-400 to-transparent"
        style={{
          width: `${60 * scale}px`,
          transform: `translate(-100%, -50%)`,
          opacity: 0.6 * (1 - progress),
        }}
      />
    </div>
  );
}

// ==================== 伤害数字组件 ====================

interface DamageNumberProps {
  damage: DamageNumber;
  scale: number;
  onComplete: () => void;
}

export function DamageNumberDisplay({ damage, scale, onComplete }: DamageNumberProps) {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 1000; // 1秒动画

      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      // 前50%上升，后50%淡出
      if (p > 0.5) {
        setOpacity(1 - (p - 0.5) * 2);
      }

      if (p >= 1) {
        onComplete();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete]);

  // 向上飘动
  const offsetY = -80 * progress;

  return (
    <div
      className={`absolute pointer-events-none z-50 font-black text-6xl ${damage.isHealing
        ? 'text-green-400'
        : damage.isCritical
          ? 'text-red-500'
          : 'text-yellow-400'
        }`}
      style={{
        left: `${damage.x * scale}px`,
        top: `${(damage.y + offsetY) * scale}px`,
        opacity,
        transform: `translate(-50%, -50%) scale(${1 + (1 - progress) * 0.5})`,
        textShadow: '0 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        transition: 'none',
        WebkitTextStroke: '2px black',
      }}
    >
      {damage.isHealing ? '+' : '-'}{damage.damage}
    </div>
  );
}

// ==================== 受击抖动效果组件 ====================

interface ShakeWrapperProps {
  children: React.ReactNode;
  isShaking: boolean;
  intensity?: number;
}

export function ShakeWrapper({ children, isShaking, intensity = 5 }: ShakeWrapperProps) {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isShaking) {
      setShakeOffset({ x: 0, y: 0 });
      return;
    }

    let startTime: number;
    let animationFrame: number;
    const duration = 300; // 抖动300ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < duration) {
        // 随机抖动
        const x = (Math.random() - 0.5) * intensity * 2;
        const y = (Math.random() - 0.5) * intensity * 2;
        setShakeOffset({ x, y });
        animationFrame = requestAnimationFrame(animate);
      } else {
        setShakeOffset({ x: 0, y: 0 });
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isShaking, intensity]);

  return (
    <div
      style={{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        transition: 'none',
      }}
    >
      {children}
    </div>
  );
}

// ==================== 攻击轨迹线组件 ====================

interface AttackTrailProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  scale: number;
  onComplete: () => void;
}

export function AttackTrail({ fromX, fromY, toX, toY, scale, onComplete }: AttackTrailProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 400;

      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      if (p >= 1) {
        onComplete();
        return;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onComplete]);

  const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
  const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
  const currentLength = length * progress;

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${fromX * scale}px`,
        top: `${fromY * scale}px`,
        width: `${currentLength * scale}px`,
        height: `${4 * scale}px`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        background: 'linear-gradient(90deg, rgba(250,204,21,0.8) 0%, rgba(250,204,21,0) 100%)',
        borderRadius: '2px',
        opacity: 1 - progress,
      }}
    />
  );
}

// ==================== 动画管理 Hook ====================

// eslint-disable-next-line react-refresh/only-export-components
export function useBattleAnimations() {
  const [attackAnimations, setAttackAnimations] = useState<AttackAnimation[]>([]);
  const [playCardAnimations, setPlayCardAnimations] = useState<PlayCardAnimation[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [shakingTargets, setShakingTargets] = useState<Set<string>>(new Set());

  const addAttackAnimation = useCallback((animation: Omit<AttackAnimation, 'id' | 'isComplete'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAttackAnimations((prev) => [...prev, { ...animation, id, isComplete: false }]);

    // 添加受击抖动
    const targetId = animation.targetType === 'hero'
      ? `${animation.targetPlayerId}-hero`
      : `${animation.targetPlayerId}-minion-${animation.targetPos?.row}-${animation.targetPos?.col}`;
    setShakingTargets((prev) => new Set(prev).add(targetId));

    // 300ms后移除抖动
    setTimeout(() => {
      setShakingTargets((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }, 300);

    return id;
  }, []);

  const addPlayCardAnimation = useCallback((animation: Omit<PlayCardAnimation, 'id' | 'isComplete'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPlayCardAnimations((prev) => [...prev, { ...animation, id, isComplete: false }]);
    return id;
  }, []);

  const addDamageNumber = useCallback((damage: Omit<DamageNumber, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setDamageNumbers((prev) => [...prev, { ...damage, id }]);
    return id;
  }, []);

  const removeAttackAnimation = useCallback((id: string) => {
    setAttackAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const removePlayCardAnimation = useCallback((id: string) => {
    setPlayCardAnimations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const removeDamageNumber = useCallback((id: string) => {
    setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const isShaking = useCallback((targetId: string) => {
    return shakingTargets.has(targetId);
  }, [shakingTargets]);

  return {
    attackAnimations,
    playCardAnimations,
    damageNumbers,
    addAttackAnimation,
    addPlayCardAnimation,
    addDamageNumber,
    removeAttackAnimation,
    removePlayCardAnimation,
    removeDamageNumber,
    isShaking,
  };
}
