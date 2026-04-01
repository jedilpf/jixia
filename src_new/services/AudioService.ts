/**
 * 音效管理服务
 * 
 * 管理游戏内所有音频播放，包括背景音乐和音效
 */

export type SoundType = 
  | 'phase_start'       // 阶段开始
  | 'phase_reveal'      // 揭示阶段
  | 'phase_hidden'      // 隐藏阶段
  | 'phase_end'         // 回合结束
  | 'resolution'        // 结算
  | 'card_select'       // 选择卡牌
  | 'card_deselect'     // 取消选择
  | 'card_play'         // 打出卡牌
  | 'card_draw'         // 抽牌
  | 'attack'            // 攻击
  | 'damage'            // 受到伤害
  | 'heal'              // 治疗
  | 'time_warning'      // 时间警告
  | 'ready'             // 准备就绪
  | 'victory'           // 胜利
  | 'defeat'            // 失败
  | 'hover'             // 悬停
  | 'click';            // 点击

interface AudioConfig {
  volume: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

interface SoundInstance {
  audio: HTMLAudioElement;
  config: AudioConfig;
  type: SoundType;
}

export class AudioService {
  private static instance: AudioService;
  private sounds: Map<SoundType, HTMLAudioElement>;
  private bgm: HTMLAudioElement | null;
  private masterVolume: number;
  private sfxVolume: number;
  private bgmVolume: number;
  private isMuted: boolean;
  private currentBgm: string | null;

  // 音效URL映射（实际项目中应该指向真实音频文件）
  private soundUrls: Record<SoundType, string> = {
    phase_start: '/sounds/phase_start.mp3',
    phase_reveal: '/sounds/phase_reveal.mp3',
    phase_hidden: '/sounds/phase_hidden.mp3',
    phase_end: '/sounds/phase_end.mp3',
    resolution: '/sounds/resolution.mp3',
    card_select: '/sounds/card_select.mp3',
    card_deselect: '/sounds/card_deselect.mp3',
    card_play: '/sounds/card_play.mp3',
    card_draw: '/sounds/card_draw.mp3',
    attack: '/sounds/attack.mp3',
    damage: '/sounds/damage.mp3',
    heal: '/sounds/heal.mp3',
    time_warning: '/sounds/time_warning.mp3',
    ready: '/sounds/ready.mp3',
    victory: '/sounds/victory.mp3',
    defeat: '/sounds/defeat.mp3',
    hover: '/sounds/hover.mp3',
    click: '/sounds/click.mp3',
  };

  private constructor() {
    this.sounds = new Map();
    this.bgm = null;
    this.masterVolume = 1.0;
    this.sfxVolume = 0.7;
    this.bgmVolume = 0.5;
    this.isMuted = false;
    this.currentBgm = null;
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * 预加载音效
   */
  preloadSounds(): Promise<void> {
    const promises = Object.entries(this.soundUrls).map(([type, url]) => {
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', () => {
          console.warn(`Failed to load sound: ${type}`);
          resolve(); // 即使加载失败也继续
        });
        audio.load();
        this.sounds.set(type as SoundType, audio);
      });
    });

    return Promise.all(promises).then(() => undefined);
  }

  /**
   * 播放音效
   */
  play(type: SoundType, config: Partial<AudioConfig> = {}): void {
    if (this.isMuted) return;

    const audio = this.sounds.get(type);
    if (!audio) {
      console.warn(`Sound not found: ${type}`);
      return;
    }

    // 克隆音频元素以支持重叠播放
    const clone = audio.cloneNode() as HTMLAudioElement;
    const volume = (config.volume ?? 1.0) * this.sfxVolume * this.masterVolume;
    clone.volume = Math.max(0, Math.min(1, volume));
    
    // 淡入效果
    if (config.fadeIn && config.fadeIn > 0) {
      clone.volume = 0;
      clone.play();
      this.fadeIn(clone, volume, config.fadeIn);
    } else {
      clone.play().catch(err => {
        console.warn(`Failed to play sound: ${type}`, err);
      });
    }

    // 清理克隆的音频元素
    clone.addEventListener('ended', () => {
      clone.remove();
    }, { once: true });
  }

  /**
   * 播放背景音乐
   */
  playBGM(url: string, fadeDuration: number = 1000): void {
    if (this.currentBgm === url) return;

    // 停止当前BGM
    if (this.bgm) {
      this.fadeOut(this.bgm, fadeDuration, () => {
        this.bgm?.pause();
        this.bgm = null;
      });
    }

    // 播放新BGM
    const newBgm = new Audio(url);
    newBgm.loop = true;
    newBgm.volume = 0;
    
    newBgm.play().then(() => {
      this.bgm = newBgm;
      this.currentBgm = url;
      this.fadeIn(newBgm, this.bgmVolume * this.masterVolume, fadeDuration);
    }).catch(err => {
      console.warn('Failed to play BGM:', err);
    });
  }

  /**
   * 停止背景音乐
   */
  stopBGM(fadeDuration: number = 1000): void {
    if (!this.bgm) return;

    this.fadeOut(this.bgm, fadeDuration, () => {
      this.bgm?.pause();
      this.bgm = null;
      this.currentBgm = null;
    });
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * 设置音效音量
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置背景音乐音量
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this.bgmVolume * this.masterVolume;
    }
  }

  /**
   * 静音切换
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgm) {
      this.bgm.muted = this.isMuted;
    }
    return this.isMuted;
  }

  /**
   * 淡入效果
   */
  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fade = () => {
      currentStep++;
      audio.volume = Math.min(targetVolume, volumeStep * currentStep);
      
      if (currentStep < steps) {
        setTimeout(fade, stepDuration);
      }
    };

    fade();
  }

  /**
   * 淡出效果
   */
  private fadeOut(audio: HTMLAudioElement, duration: number, callback?: () => void): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const startVolume = audio.volume;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    const fade = () => {
      currentStep++;
      audio.volume = Math.max(0, startVolume - volumeStep * currentStep);
      
      if (currentStep < steps) {
        setTimeout(fade, stepDuration);
      } else {
        callback?.();
      }
    };

    fade();
  }

  /**
   * 更新所有音量
   */
  private updateVolumes(): void {
    if (this.bgm) {
      this.bgm.volume = this.bgmVolume * this.masterVolume;
    }
  }

  /**
   * 获取当前音量设置
   */
  getVolumeSettings(): { master: number; sfx: number; bgm: number; isMuted: boolean } {
    return {
      master: this.masterVolume,
      sfx: this.sfxVolume,
      bgm: this.bgmVolume,
      isMuted: this.isMuted,
    };
  }
}

// 便捷导出
export const audioService = AudioService.getInstance();
export default audioService;
