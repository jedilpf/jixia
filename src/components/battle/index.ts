/**
 * 战斗界面组件导出
 * 三层架构：主战斗层 / 信息面板层 / 轻社交层
 */

// 第一层：常驻主战斗层
export { TopStatusBar } from './layers/TopStatusBar';
export { BattleArena } from './layers/BattleArena';
export { BottomControls } from './layers/BottomControls';

// 第二层：信息面板层
export { default as CardLibraryPanel } from './panels/CardLibraryPanel';
export { default as StatusPanel } from './panels/StatusPanel';
export { default as LogDrawer } from './panels/LogDrawer';

// 第三层：轻社交层
export { default as ChatFloat } from './panels/ChatFloat';

// 确认对话框
export { default as ExitConfirmModal } from './panels/ExitConfirmModal';

// 辅助组件
export { default as OperationHints } from './controls/OperationHints';
export { default as LogButton } from './controls/LogButton';

// ═══════════════════════════════════════════════════════════════
// 旧版组件导出（向后兼容）- 使用命名导出
// ═══════════════════════════════════════════════════════════════
export { HandCard } from './HandCard';
export { MinionCard } from './MinionCard';
export { HeroCard } from './HeroCard';
export { DeckPile } from './DeckPile';
export { EmptySlot } from './EmptySlot';
export { DragGhost } from './DragGhost';
export { BattleBackground } from './BattleBackground';
export { EndTurnButton } from './EndTurnButton';
export { GameResultOverlay } from './GameResultOverlay';
export { HeroConsole } from './HeroConsole';
export { TurnBanner } from './TurnBanner';
export { CastingBar } from './CastingBar';
export { SurrenderButton } from './SurrenderButton';
export { SettingsButton } from './SettingsButton';
export { DropZoneHighlight } from './DropZoneHighlight';
export { AttackPointer } from './AttackPointer';
export { BookArea } from './BookArea';
export { GoldDisplay } from './GoldDisplay';
