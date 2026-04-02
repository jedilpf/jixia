// 手牌姿态类型
export type HandPose = {
    x: number;
    y: number;   // anchor y：player=底边基线，enemy=顶边基线
    rot: number; // deg
    z: number;   // 用于重叠顺序
};

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// 炉石味扇形算法：重叠式圆弧 + 中间牌在上层
export function computeHandFan(
    count: number,
    centerX: number,
    baseY: number,
    opts?: {
        direction?: 'up' | 'down'; // player=up, enemy=down
        radius?: number;
        maxAngleDeg?: number;      // 角度上限
        step?: number;             // 邻牌水平间距（越小越重叠）
        easePow?: number;          // 非线性指数
        reverse?: boolean;         // 反转扇形（宽边在上）
        hoveredIndex?: number | null; // 悬浮的卡牌索引，用于挤压避让
    }
): HandPose[] {
    if (count <= 0) return [];
    if (count === 1) return [{ x: centerX, y: baseY, rot: 0, z: 1000 }];

    const direction = opts?.direction ?? 'up';
    const reverse = opts?.reverse ?? false;
    const signY = direction === 'up' ? -1 : 1;

    const radius = opts?.radius ?? 680;

    const maxAngleCap = opts?.maxAngleDeg ?? 42;
    const maxAngle = Math.min((count - 1) * 7 * (Math.PI / 180), maxAngleCap * (Math.PI / 180));

    const easePow = opts?.easePow ?? 0.85;
    const mid = (count - 1) / 2;
    const step = opts?.step ?? Math.max(65, 130 - count * 8);

    const poses: HandPose[] = [];
    for (let i = 0; i < count; i++) {
        const t = (i - mid) / mid; // -1..1
        const te = Math.sign(t) * Math.pow(Math.abs(t), easePow);

        const a = te * maxAngle;

        // 水平：动态 step 让卡牌重叠可按数量收缩
        let x = centerX + (i - mid) * step;

        // 垂直：圆弧抬起
        const arcLift = (1 - Math.cos(a)) * radius;
        const y = baseY + signY * arcLift;

        // 旋转角度：正常或反转
        let rot = (a * 180) / Math.PI;
        if (reverse) {
            rot = -rot; // 反转旋转方向
        }

        // 挤压与展平逻辑 (Hearthstone hover fan squeeze effect)
        let z = 100 + i;
        if (opts?.hoveredIndex !== undefined && opts.hoveredIndex !== null) {
            const hIdx = opts.hoveredIndex;
            const dist = Math.abs(i - hIdx);

            if (i === hIdx) {
                // 悬停目标：扶正（旋转归零）并置于绝对最顶层
                rot = 0;
                z = 5000;
            } else {
                const pushDistance = 70;
                const pushEffect = pushDistance / Math.max(1, Math.pow(dist, 0.7));

                if (i < hIdx) {
                    x -= pushEffect;
                    rot -= 3;
                } else if (i > hIdx) {
                    x += pushEffect;
                    rot += 3;
                }
            }
        }

        poses.push({ x, y, rot, z });
    }
    return poses;
}
