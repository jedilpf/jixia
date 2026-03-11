// Services Index - 统一导出所有服务

// Core Services
export {
  AudioService,
  audioService,
  SoundEffect,
  MusicTrack,
  AudioSettings,
} from "./AudioService";

export {
  ErrorTrackingService,
  errorTrackingService,
  ErrorReport,
  ErrorType,
} from "./ErrorTrackingService";

export {
  PerformanceService,
  performanceService,
  PerformanceMetrics,
  PerformanceReport,
  PerformanceThresholds,
} from "./PerformanceService";

// Game Services
export {
  NetworkSyncService,
  networkSyncService,
  NetworkState,
  SyncConfig,
  NetworkStats,
} from "./NetworkSyncService";

export {
  ReplayService,
  replayService,
  ReplayData,
  ReplayEvent,
  ReplayEventType,
  ReplaySpeed,
} from "./ReplayService";

export {
  StatsService,
  statsService,
  PlayerStats,
  MatchRecord,
  Achievement,
  DailyStats,
} from "./StatsService";

export {
  HotkeyService,
  hotkeyService,
  HotkeyAction,
  HotkeyConfig,
  HotkeyMap,
} from "./HotkeyService";

export {
  TutorialService,
  tutorialService,
  Tutorial,
  TutorialStep,
  TutorialProgress,
} from "./TutorialService";

// Social Services
export {
  LeaderboardService,
  leaderboardService,
  LeaderboardEntry,
  LeaderboardData,
  LeaderboardType,
  RankTier,
  RANK_TIERS,
} from "./LeaderboardService";

export {
  SeasonService,
  createSeasonService,
  Season,
  SeasonReward,
  PlayerSeasonData,
  SeasonProgress,
} from "./SeasonService";

export {
  FriendService,
  createFriendService,
  Friend,
  FriendRequest,
  FriendActivity,
  FriendStats,
  FriendStatus,
  FriendEvent,
} from "./FriendService";

export {
  SpectatorService,
  createSpectatorService,
  SpectatorRoom,
  SpectatorState,
  SpectatorChatMessage,
  SpectatorSettings,
} from "./SpectatorService";

// Progression Services
export {
  AchievementService,
  achievementService,
  Achievement,
  AchievementCategory,
  AchievementRarity,
  AchievementRequirement,
  AchievementReward,
  AchievementProgress,
  AchievementStats,
  ACHIEVEMENT_DEFINITIONS,
} from "./AchievementService";

export {
  DailyTaskService,
  dailyTaskService,
  DailyTask,
  TaskType,
  TaskDifficulty,
  TaskReward,
  DailyTaskProgress,
  WeeklyProgress,
  DAILY_TASK_TEMPLATES,
  WEEKLY_TASK_TEMPLATES,
} from "./DailyTaskService";

// Economy Services
export {
  ShopService,
  shopService,
  ShopItem,
  ShopCategory,
  ItemRarity,
  CardPack,
  CosmeticItem,
  ShopBundle,
  PurchaseHistory,
  PlayerCurrency,
  CARD_PACKS,
  SHOP_ITEMS,
  ShopEvent,
} from "./ShopService";

export {
  CollectionService,
  collectionService,
  CollectionCard,
  CollectionStats,
  CardFilter,
  DustInfo,
  DUST_VALUES,
  CollectionEvent,
} from "./CollectionService";

// Deck Services
export {
  DeckService,
  deckService,
  Deck,
  DeckCard,
  DeckStats,
  DeckValidationResult,
  DeckTemplate,
  DECK_RULES,
  DECK_TEMPLATES,
  DeckEvent,
} from "./DeckService";

// Communication Services
export {
  NotificationService,
  notificationService,
  Notification,
  NotificationType,
  NotificationPriority,
  Mail,
  MailAttachment,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationEvent,
} from "./NotificationService";

// Event Services
export {
  EventService,
  eventService,
  GameEvent,
  EventType,
  EventStatus,
  EventReward,
  EventTask,
  EventProgress,
  EventParticipation,
  DEFAULT_EVENTS,
  EventServiceEvent,
} from "./EventService";

// Account Services
export {
  AccountService,
  accountService,
  UserAccount,
  UserSettings,
  SecuritySettings,
  UserPreferences,
  LoginCredentials,
  RegisterData,
  SessionInfo,
  AccountStatus,
  UserRole,
  AccountEvent,
} from "./AccountService";

// Config Services
export {
  ConfigService,
  configService,
  GameConfig,
  RemoteConfig,
  ConfigEnvironment,
  DEFAULT_CONFIG,
} from "./ConfigService";

// Logger Services
export {
  LoggerService,
  logger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logFatal,
  LogLevel,
  LogCategory,
  LogEntry,
  LoggerConfig,
  DEFAULT_LOGGER_CONFIG,
} from "./LoggerService";

// Data Sync Services
export {
  DataSyncService,
  dataSyncService,
  SyncItem,
  SyncResult,
  SyncConfig,
  SyncStatus,
  SyncPriority,
  DEFAULT_SYNC_CONFIG,
  SyncEvent,
} from "./DataSyncService";

// Analytics Services
export {
  AnalyticsService,
  analyticsService,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsSession,
  AnalyticsConfig,
  MetricData,
  DEFAULT_ANALYTICS_CONFIG,
} from "./AnalyticsService";

// Update Services
export {
  UpdateService,
  updateService,
  VersionInfo,
  UpdateProgress,
  UpdateConfig,
  UpdateStatus,
  DEFAULT_UPDATE_CONFIG,
  UpdateEvent,
} from "./UpdateService";

// Cache Services
export {
  CacheService,
  cacheService,
  CacheStrategy,
  CacheConfig,
  CacheStats,
  DEFAULT_CACHE_CONFIG,
} from "./CacheService";

// State Machine Services
export {
  StateMachineService,
  stateMachineService,
  StateMachineConfig,
  StateDefinition,
  Transition,
  StateContext,
} from "./StateMachineService";

// Asset Loader Services
export {
  AssetLoaderService,
  assetLoaderService,
  Asset,
  AssetType,
  LoadProgress,
  AssetManifest,
} from "./AssetLoaderService";

// Input Services
export {
  InputService,
  inputService,
  InputType,
  InputBinding,
  InputEvent,
  GestureState,
  GestureType,
} from "./InputService";

// Scene Services
export {
  SceneService,
  sceneService,
  Scene,
  SceneTransition,
  SceneStackItem,
} from "./SceneService";

// AI Decision Services
export {
  AIDecisionService,
  aiDecisionService,
  BehaviorNode,
  NodeType,
  NodeStatus,
  AIContext,
} from "./AIDecisionService";

// Battle Record Services
export {
  BattleRecordService,
  battleRecordService,
  BattleRecord,
  BattleAction,
  BattleState,
  ReplayOptions,
} from "./BattleRecordService";

// I18n Services
export {
  I18nService,
  i18nService,
  Language,
  TranslationDict,
  I18nConfig,
  DEFAULT_I18N_CONFIG,
  TRANSLATIONS,
} from "./I18nService";

// Theme Services
export {
  ThemeService,
  themeService,
  ThemeMode,
  ThemeColor,
  ThemeConfig,
  ColorPalette,
  DEFAULT_THEME_CONFIG,
  COLOR_PALETTES,
} from "./ThemeService";

// Modal Services
export {
  ModalService,
  modalService,
  ModalSize,
  ModalPosition,
  ModalConfig,
  ModalInstance,
  ModalOptions,
  DEFAULT_MODAL_CONFIG,
} from "./ModalService";

// Toast Services
export {
  ToastService,
  toastService,
  ToastType,
  ToastPosition,
  ToastConfig,
  ToastOptions,
  ToastInstance,
  DEFAULT_TOAST_CONFIG,
  TOAST_DURATION,
} from "./ToastService";

// Form Validation Services
export {
  FormValidationService,
  formValidationService,
  rules,
  ValidationRuleType,
  ValidationRule,
  FieldConfig,
  ValidationError,
  ValidationResult,
  FormConfig,
} from "./FormValidationService";

// Pagination Services
export {
  PaginationService,
  paginationService,
  PaginationConfig,
  PaginationResult,
  PageInfo,
  DEFAULT_PAGINATION_CONFIG,
} from "./PaginationService";

// Search Services
export {
  SearchService,
  searchService,
  SearchConfig,
  SearchResult,
  SearchMatch,
  FilterConfig,
  SortConfig,
  SearchOptions,
} from "./SearchService";

// Card Effect Services
export {
  CardEffectService,
  cardEffectService,
  EffectType,
  EffectTarget,
  EffectTrigger,
  EffectCondition,
  CardEffect,
  EffectContext,
  EffectResult,
  EffectHandler,
} from "./CardEffectService";

// Buff Services
export {
  BuffService,
  buffService,
  BuffType,
  BuffStackType,
  BuffConfig,
  BuffInstance,
  BuffModifier,
  BuffEventType,
  BuffEvent,
} from "./BuffService";

// Skill Services
export {
  SkillService,
  skillService,
  SkillType,
  SkillTarget,
  SkillConfig,
  SkillInstance,
  SkillUseResult,
} from "./SkillService";

// Minion Services
export {
  MinionService,
  minionService,
  MinionTemplate,
  MinionInstance,
} from "./MinionService";

// Spell Services
export {
  SpellService,
  spellService,
  SpellTemplate,
  SpellCastResult,
} from "./SpellService";

// Weapon Services
export {
  WeaponService,
  weaponService,
  WeaponTemplate,
  WeaponInstance,
} from "./WeaponService";

// Hero Power Services
export {
  HeroPowerService,
  heroPowerService,
  HeroPowerConfig,
  HeroPowerState,
  HeroPowerResult,
} from "./HeroPowerService";

// Service Factory - 用于创建所有服务的实例
import { ErrorTrackingService } from "./ErrorTrackingService";
import { PerformanceService } from "./PerformanceService";
import { LeaderboardService } from "./LeaderboardService";
import { SeasonService } from "./SeasonService";
import { FriendService } from "./FriendService";
import { SpectatorService } from "./SpectatorService";
import { AchievementService } from "./AchievementService";
import { DailyTaskService } from "./DailyTaskService";
import { ShopService } from "./ShopService";
import { CollectionService } from "./CollectionService";
import { DeckService } from "./DeckService";
import { NotificationService } from "./NotificationService";
import { EventService } from "./EventService";
import { AccountService } from "./AccountService";
import { ConfigService } from "./ConfigService";
import { LoggerService } from "./LoggerService";
import { DataSyncService } from "./DataSyncService";
import { AnalyticsService } from "./AnalyticsService";
import { UpdateService } from "./UpdateService";
import { CacheService } from "./CacheService";
import { StateMachineService } from "./StateMachineService";
import { AssetLoaderService } from "./AssetLoaderService";
import { InputService } from "./InputService";
import { SceneService } from "./SceneService";
import { AIDecisionService } from "./AIDecisionService";
import { BattleRecordService } from "./BattleRecordService";
import { I18nService } from "./I18nService";
import { ThemeService } from "./ThemeService";
import { ModalService } from "./ModalService";
import { ToastService } from "./ToastService";
import { FormValidationService } from "./FormValidationService";
import { PaginationService } from "./PaginationService";
import { SearchService } from "./SearchService";
import { CardEffectService } from "./CardEffectService";
import { BuffService } from "./BuffService";
import { SkillService } from "./SkillService";
import { MinionService } from "./MinionService";
import { SpellService } from "./SpellService";
import { WeaponService } from "./WeaponService";
import { HeroPowerService } from "./HeroPowerService";

export interface Services {
  // Core
  errorTracking: ErrorTrackingService;
  performance: PerformanceService;
  logger: LoggerService;
  config: ConfigService;

  // Game
  leaderboard: LeaderboardService;
  season: SeasonService;
  friend: FriendService;
  spectator: SpectatorService;

  // Progression
  achievement: AchievementService;
  dailyTask: DailyTaskService;

  // Economy
  shop: ShopService;
  collection: CollectionService;

  // Deck
  deck: DeckService;

  // Communication
  notification: NotificationService;

  // Event
  event: EventService;

  // Account
  account: AccountService;

  // Data
  dataSync: DataSyncService;
  analytics: AnalyticsService;
  update: UpdateService;

  // Cache
  cache: CacheService;

  // State Machine
  stateMachine: StateMachineService<string, string>;

  // Asset Loader
  assetLoader: AssetLoaderService;

  // Input
  input: InputService;

  // Scene
  scene: SceneService;

  // AI Decision
  aiDecision: AIDecisionService;

  // Battle Record
  battleRecord: BattleRecordService;

  // UI
  i18n: I18nService;
  theme: ThemeService;
  modal: ModalService;
  toast: ToastService;

  // Utils
  formValidation: FormValidationService;
  pagination: PaginationService;
  search: SearchService;

  // Game Mechanics
  cardEffect: CardEffectService;
  buff: BuffService;
  skill: SkillService;
  minion: MinionService;
  spell: SpellService;
  weapon: WeaponService;
  heroPower: HeroPowerService;
}

export function createServices(playerId: string): Services {
  // Core
  const errorTracking = new ErrorTrackingService();
  const performance = new PerformanceService(errorTracking);
  const logger = new LoggerService();
  const config = new ConfigService();

  // Game
  const leaderboard = new LeaderboardService();
  const season = new SeasonService(leaderboard);
  const friend = new FriendService(playerId);
  const spectator = new SpectatorService();

  // Progression
  const achievement = new AchievementService();
  const dailyTask = new DailyTaskService();

  // Economy
  const shop = new ShopService();
  const collection = new CollectionService();

  // Deck
  const deck = new DeckService();

  // Communication
  const notification = new NotificationService();

  // Event
  const event = new EventService();

  // Account
  const account = new AccountService();

  // Data
  const dataSync = new DataSyncService();
  const analytics = new AnalyticsService();
  const update = new UpdateService();

  // Cache
  const cache = new CacheService();

  // State Machine
  const stateMachine = new StateMachineService<string, string>({
    initial: "idle",
    states: new Map(),
    transitions: [],
  });

  // Asset Loader
  const assetLoader = new AssetLoaderService();

  // Input
  const input = new InputService();

  // Scene
  const scene = new SceneService();

  // AI Decision
  const aiDecision = new AIDecisionService();

  // Battle Record
  const battleRecord = new BattleRecordService();

  // UI
  const i18n = new I18nService();
  const theme = new ThemeService();
  const modal = new ModalService();
  const toast = new ToastService();

  // Utils
  const formValidation = new FormValidationService();
  const pagination = new PaginationService();
  const search = new SearchService();

  // Game Mechanics
  const cardEffect = new CardEffectService();
  const buff = new BuffService();
  const skill = new SkillService();
  const minion = new MinionService();
  const spell = new SpellService();
  const weapon = new WeaponService();
  const heroPower = new HeroPowerService();

  return {
    errorTracking,
    performance,
    logger,
    config,
    leaderboard,
    season,
    friend,
    spectator,
    achievement,
    dailyTask,
    shop,
    collection,
    deck,
    notification,
    event,
    account,
    dataSync,
    analytics,
    update,
    cache,
    stateMachine,
    assetLoader,
    input,
    scene,
    aiDecision,
    battleRecord,
    i18n,
    theme,
    modal,
    toast,
    formValidation,
    pagination,
    search,
    cardEffect,
    buff,
    skill,
    minion,
    spell,
    weapon,
    heroPower,
  };
}

// Default services instance
export const services = createServices(`player_${Date.now()}`);
