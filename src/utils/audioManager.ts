class UIAudioManager {
    private static instance: UIAudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private sfxVolume: number = 0.5;

    private constructor() { }

    static getInstance() {
        if (!UIAudioManager.instance) {
            UIAudioManager.instance = new UIAudioManager();
        }
        return UIAudioManager.instance;
    }

    // 初始化 AudioContext，通常需要用户产生交互后调用
    public init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.sfxVolume;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    public setVolume(vol: number) {
        this.sfxVolume = vol;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(vol, this.ctx?.currentTime || 0);
        }
    }

    // 播放轻微的悬停音效 (类似古琴轻抚或竹木碰撞)
    public playHover() {
        if (!this.ctx || !this.masterGain) return;

        // 如果 Context 处于挂起状态（被浏览器自动播放策略限制），尝试恢复
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const t = this.ctx.currentTime;

        // 创建振荡器产生类似木质敲击的短促音
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        // 悬停音效参数：频率较低、极短的收音
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    // 播放点击音效 (类似石子/玉佩敲击或者水滴)
    public playClick() {
        if (!this.ctx || !this.masterGain) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // 竹简咔哒声（短促、木质感）
        // 方波包含更多泛音，适合模拟打击乐的木质质感
        osc.type = 'square';

        // 快速降频，模拟敲击时的音高瞬间变化
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.03);

        // 低通滤波器：一开始放行高频细节，瞬间收紧保留浑厚的木声
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.05);

        // 音量包络：极快爆发，瞬间衰减（咔哒一下，干净利落）
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    // 播放卡牌悬停音效（比按钮悬停更有仪式感 — 纸页翻动+低沉弦音）
    public playCardHover() {
        if (!this.ctx || !this.masterGain) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;

        // 第一层：纸页翻动（高频短脉冲）
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.connect(gain1); gain1.connect(this.masterGain);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(900, t);
        osc1.frequency.exponentialRampToValueAtTime(300, t + 0.04);
        gain1.gain.setValueAtTime(0.12, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc1.start(t); osc1.stop(t + 0.07);

        // 第二层：低沉弦音余韵（略滞后于第一层）
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.connect(gain2); gain2.connect(this.masterGain);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220, t + 0.02);
        osc2.frequency.exponentialRampToValueAtTime(180, t + 0.12);
        gain2.gain.setValueAtTime(0, t + 0.02);
        gain2.gain.linearRampToValueAtTime(0.1, t + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc2.start(t + 0.02); osc2.stop(t + 0.18);
    }

    // 加载并播放自定义音频文件（放在 public/assets/ 中的 mp3 等）
    private customSounds: Record<string, AudioBuffer> = {};

    public async loadCustomSound(name: string, url: string) {
        if (!this.ctx) return;
        try {
            const resp = await fetch(url);
            const arrayBuf = await resp.arrayBuffer();
            const audio = await this.ctx.decodeAudioData(arrayBuf);
            this.customSounds[name] = audio;
        } catch (e) {
            console.warn(`[uiAudio] failed to load ${url}`, e);
        }
    }

    public playCustomSound(name: string, volume = 1.0) {
        if (!this.ctx || !this.masterGain) return;
        const buf = this.customSounds[name];
        if (!buf) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        src.buffer = buf;
        gain.gain.value = volume;
        src.connect(gain); gain.connect(this.masterGain);
        src.start();
    }
}

export const uiAudio = UIAudioManager.getInstance();
