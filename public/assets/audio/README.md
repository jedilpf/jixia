# 音频资源目录

此目录存放游戏音效和背景音乐资源。

## 目录结构

```
audio/
├── combat/          # 战斗音效
│   ├── slash.mp3        # 斩击音效
│   ├── thrust.mp3       # 刺击音效
│   ├── smash.mp3        # 重击音效
│   ├── magic.mp3        # 魔法音效
│   ├── arrow.mp3        # 箭矢音效
│   ├── explosion.mp3    # 爆炸音效
│   └── lightning.mp3    # 闪电音效
│
├── story/           # 故事场景音效
│   ├── bgm_dream.mp3    # 梦境场景音乐
│   ├── bgm_city.mp3     # 城市场景音乐
│   ├── bgm_hall.mp3     # 殿堂场景音乐
│   ├── choice_select.mp3 # 选择确认音效
│   └── dialogue_advance.mp3 # 对话推进音效
│
└── jingles/         # 结果音效
    ├── victory.mp3      # 胜利音效
    ├── defeat.mp3       # 失败音效
    └── level_up.mp3     # 升级音效
```

## 使用说明

1. 将对应的音频文件放入相应目录
2. 推荐格式：MP3 或 OGG
3. 推荐采样率：44100 Hz
4. 音效时长建议：
   - 战斗音效：0.5-2 秒
   - 结果音效：2-5 秒
   - 背景音乐：60-180 秒（循环）

## 代码调用

```typescript
// 加载战斗音效
await uiAudio.loadCombatSounds();

// 播放战斗音效
uiAudio.playCombatSound('slash');

// 加载结果音效
await uiAudio.loadJingles();

// 播放胜利音效
uiAudio.playVictoryJingle();
```