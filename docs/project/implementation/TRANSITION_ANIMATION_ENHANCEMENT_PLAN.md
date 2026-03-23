# 场景切换动画及后续优化实施方案

## 文档信息

| 属性 | 值 |
|------|-----|
| 文档ID | DOC-IMPLEMENTATION-001 |
| 版本 | 1.0.0 |
| 创建日期 | 2026-03-23 |
| 状态 | 草稿 |

---

## 一、场景切换动画现状分析

### 1.1 TransitionScreen组件状态

**文件位置**: `src/components/TransitionScreen.tsx`

**当前状态**: 代码完整，功能正常

**已实现功能**:
- 视频播放（支持多视频源切换）
- 背景模糊效果
- 进度条显示
- 跳过按钮（点击或ESC）
- 淡入淡出过渡
- 自动退出计时器

**缺失资源**:
- `public/assets/transition.mp4` - 缺失
- `素材/fbe7eb1e32979861693d5d7ff6742c3e.mp4` - 缺失

### 1.2 问题诊断

| 问题 | 原因 | 影响 | 解决方案 |
|------|------|------|----------|
| 视频无法播放 | 视频文件不存在 | 显示纯黑背景 | 添加备用CSS动画 |
| 跳过提示文字可见 | CSS动画正常 | 提示文字闪烁 | 已有CSS动画，无需修改 |

### 1.3 组件回退机制

当前代码已实现视频失败时的回退机制：
```typescript
// 当视频加载失败时，显示渐变背景
{videoFailed ? (
  <div style={{
    background: 'radial-gradient(circle at 30% 30%, rgba(170,35,28,0.28), transparent 45%), ...'
  }} />
) : null}
```

---

## 二、场景切换动画增强方案

### 方案一：添加CSS备用动画（推荐）

**实施难度**: 低

**资源需求**: 无需新资源

**具体步骤**:

1. 在 `TransitionScreen.tsx` 中添加CSS动画组件
2. 当视频不可用时，使用CSS动画作为替代

**修改文件**: `src/components/TransitionScreen.tsx`

**代码实现**:

```tsx
// 在 videoFailed 分支中添加CSS动画
{videoFailed && !cssFallbackActive ? null : null}

// 添加CSS动画组件
const CSSFallbackAnimation = () => (
  <div className="transition-fallback">
    <div className="gear gear-1" />
    <div className="gear gear-2" />
    <div className="gear gear-3" />
    <div className="particle particle-1" />
    <div className="particle particle-2" />
    <div className="particle particle-3" />
    <div className="ember ember-1" />
    <div className="ember ember-2" />
  </div>
);
```

**CSS动画样式**:

```css
/* 齿轮旋转动画 */
.gear {
  position: absolute;
  border-radius: 50%;
  border: 3px solid #d4a520;
  animation: rotate 4s linear infinite;
}

.gear-1 { width: 120px; height: 120px; top: 20%; left: 15%; animation-duration: 3s; }
.gear-2 { width: 80px; height: 80px; top: 60%; right: 20%; animation-duration: 5s; animation-direction: reverse; }
.gear-3 { width: 60px; height: 60px; bottom: 25%; left: 30%; animation-duration: 4s; }

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 火星粒子动画 */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #E85D04;
  border-radius: 50%;
  animation: float-up 2s ease-out infinite;
}

@keyframes float-up {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-100px) scale(0); }
}
```

---

### 方案二：创建视频资源（备选）

**实施难度**: 中

**资源需求**: 需要设计团队提供视频

**视频规格建议**:

| 参数 | 建议值 |
|------|--------|
| 分辨率 | 1920x1080 |
| 时长 | 5-8秒 |
| 格式 | MP4 (H.264) |
| 大小 | < 10MB |
| 内容 | 稷下青铜机关城主题动画 |

**推荐内容元素**:
- 齿轮转动
- 火焰光芒
- 百家标志浮现
- 铜绿纹理流动

---

## 三、其他可优化内容

### 3.1 PreFactionLoading增强

**当前状态**: 已创建，集成完成

**可优化项**:
| 优化项 | 优先级 | 说明 |
|--------|--------|------|
| 添加门派Logo加载动画 | 低 | 加载时显示门派Logo |
| 增加加载文字描述 | 中 | 显示"正在加载XXX" |
| 添加跳过功能 | 中 | 允许跳过等待 |

### 3.2 按钮系统完善

**当前按钮清单**:

| 按钮 | 位置 | 状态 |
|------|------|------|
| 鸣金按钮 | 战斗界面 | 已完成 |
| 认输按钮 | 战斗界面 | 已完成 |
| 设置按钮 | 主菜单 | 已完成 |
| 英雄技能按钮 | 战斗界面 | 已完成 |
| 战斗日志按钮 | 战斗界面 | 已完成 |
| 本地双人入口 | 主菜单 | 缺失 |

**缺失按钮实现**:
| 按钮 | 实现方案 | 优先级 |
|------|----------|--------|
| 本地双人入口 | 在MainMenu中添加新按钮 | P0 |
| 跳过动画按钮 | 在TransitionScreen中添加 | P1 |
| 卡牌详情按钮 | 在CardView中添加 | P2 |

---

## 四、实施方案时间表

### 阶段一：动画修复（1天内）

| 序号 | 任务 | 预计时间 | 依赖 |
|------|------|----------|------|
| 1 | 添加CSS备用动画到TransitionScreen | 2小时 | 无 |
| 2 | 测试动画回退机制 | 1小时 | 任务1 |
| 3 | 验证跳过功能正常 | 1小时 | 无 |

### 阶段二：功能完善（2-3天）

| 序号 | 任务 | 预计时间 | 依赖 |
|------|------|----------|------|
| 1 | 实现本地双人入口按钮 | 4小时 | 无 |
| 2 | 完善PreFactionLoading | 2小时 | 无 |
| 3 | 添加跳过动画功能 | 1小时 | 阶段一 |

### 阶段三：体验优化（1周内）

| 序号 | 任务 | 预计时间 | 依赖 |
|------|------|----------|------|
| 1 | 音效系统完善 | 4小时 | 无 |
| 2 | 添加更多加载动画 | 3小时 | 无 |
| 3 | 优化过渡效果 | 4小时 | 阶段一二 |

---

## 五、技术实现细节

### 5.1 CSS备用动画实现

**文件**: `src/components/TransitionScreen.tsx`

**修改点**:

```tsx
// 1. 添加useMemo检测视频是否可用
const videoAvailable = useMemo(() => {
  return !videoFailed && videoSrc;
}, [videoFailed, videoSrc]);

// 2. 修改videoFailed处理逻辑
{videoFailed ? (
  <>
    <CSSFallbackAnimation />
    <div className="fallback-text">场景切换中...</div>
  </>
) : null}

// 3. 添加CSSFallbackAnimation组件
const CSSFallbackAnimation = () => {
  return (
    <div className="transition-fallback-container">
      {/* 齿轮动画 */}
      <div className="gear gear-1" />
      <div className="gear gear-2" />
      <div className="gear gear-3" />
      {/* 火星粒子 */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
    </div>
  );
};
```

**CSS样式**:

```css
.transition-fallback-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(circle at 30% 30%, rgba(170,35,28,0.28), transparent 45%),
              radial-gradient(circle at 78% 75%, rgba(230,110,62,0.22), transparent 45%),
              linear-gradient(120deg, #170807 0%, #3a0f0c 45%, #120505 100%);
}

.gear {
  position: absolute;
  border-radius: 50%;
  border: 3px solid #d4a520;
  opacity: 0.6;
  animation: rotate 4s linear infinite;
}

.gear-1 {
  width: 150px;
  height: 150px;
  top: -30px;
  left: -30px;
  animation-duration: 6s;
}

.gear-2 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: -20px;
  animation-duration: 4s;
  animation-direction: reverse;
}

.gear-3 {
  width: 60px;
  height: 60px;
  top: 40%;
  left: 10%;
  animation-duration: 3s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #E85D04;
  border-radius: 50%;
  box-shadow: 0 0 6px #E85D04;
}

.particle-1 { top: 80%; left: 20%; animation: particle-rise 2.5s ease-out infinite; }
.particle-2 { top: 75%; left: 40%; animation: particle-rise 2s ease-out infinite 0.3s; }
.particle-3 { top: 85%; left: 60%; animation: particle-rise 2.2s ease-out infinite 0.6s; }
.particle-4 { top: 70%; left: 80%; animation: particle-rise 1.8s ease-out infinite 0.9s; }
.particle-5 { top: 90%; left: 30%; animation: particle-rise 2.8s ease-out infinite 1.2s; }

@keyframes particle-rise {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-150px) scale(0.3); }
}

.fallback-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(242,204,183,0.85);
  letter-spacing: 0.2em;
  font-family: serif;
  font-size: 14px;
  animation: text-pulse 2s ease-in-out infinite;
}

@keyframes text-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

---

## 六、风险与解决方案

### 6.1 技术风险

| 风险 | 可能性 | 影响 | 缓解方案 |
|------|--------|------|----------|
| CSS动画性能问题 | 低 | 中 | 使用transform和opacity动画 |
| 视频文件损坏 | 中 | 低 | 已有回退机制 |
| 浏览器兼容性问题 | 低 | 低 | 使用标准CSS动画 |

### 6.2 资源风险

| 风险 | 可能性 | 影响 | 缓解方案 |
|------|--------|------|----------|
| 视频资源无法获取 | 中 | 中 | 使用CSS动画替代 |
| 视频加载时间过长 | 中 | 中 | 添加loading提示 |

### 6.3 时间风险

| 风险 | 可能性 | 影响 | 缓解方案 |
|------|--------|------|----------|
| 任务延期 | 低 | 中 | 分解任务里程碑 |
| 集成问题 | 中 | 中 | 提前进行单元测试 |

---

## 七、验证方法

### 7.1 功能验证清单

| 验证项 | 验证方法 | 预期结果 |
|--------|----------|----------|
| 过渡动画显示 | 进入战斗流程 | 动画正常播放 |
| 跳过功能 | 按ESC或点击 | 立即切换到下一屏幕 |
| 回退机制 | 删除视频文件后测试 | CSS动画正常显示 |
| 淡出效果 | 动画完成后 | 渐变为黑后切换 |

### 7.2 性能验证

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 动画帧率 | >= 30fps | 浏览器DevTools |
| 内存占用 | < 100MB | Performance Monitor |
| 加载时间 | < 2s | Network tab |

---

## 八、后续优化建议

### 8.1 短期优化（1-2周）

1. 添加更多CSS过渡效果
2. 优化移动端显示
3. 添加音效反馈

### 8.2 长期优化（1个月以上）

1. 开发专用过渡动画视频
2. 建立动画资源库
3. 实现自定义过渡编辑器

---

## 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-23 | 初始版本 | AI Assistant |
