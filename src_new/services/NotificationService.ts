export type NotificationType =
  | "system"
  | "reward"
  | "social"
  | "game"
  | "event"
  | "achievement"
  | "maintenance"
  | "promotion";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: number;
  expiresAt?: number;
  icon?: string;
  action?: {
    label: string;
    type: "open_url" | "open_page" | "claim_reward" | "dismiss";
    data?: unknown;
  };
  metadata?: Record<string, unknown>;
}

export interface Mail {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  content: string;
  attachments: MailAttachment[];
  isRead: boolean;
  isClaimed: boolean;
  createdAt: number;
  expiresAt?: number;
  importance: "normal" | "important";
}

export interface MailAttachment {
  type: "gold" | "gems" | "card_pack" | "card" | "item";
  id: string;
  name: string;
  quantity: number;
  claimed: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  types: Record<NotificationType, boolean>;
  maxNotifications: number;
  retentionDays: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  desktopEnabled: false,
  types: {
    system: true,
    reward: true,
    social: true,
    game: true,
    event: true,
    achievement: true,
    maintenance: true,
    promotion: true,
  },
  maxNotifications: 100,
  retentionDays: 30,
};

export class NotificationService {
  private static readonly NOTIFICATIONS_KEY = "jixia_notifications";
  private static readonly MAIL_KEY = "jixia_mail";
  private static readonly SETTINGS_KEY = "jixia_notification_settings";
  private static readonly LAST_READ_KEY = "jixia_last_read";

  private notifications: Notification[] = [];
  private mails: Mail[] = [];
  private settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  private observers: Set<(event: NotificationEvent) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.cleanExpiredItems();
  }

  private loadFromStorage(): void {
    try {
      const notificationsData = localStorage.getItem(NotificationService.NOTIFICATIONS_KEY);
      if (notificationsData) {
        this.notifications = JSON.parse(notificationsData);
      }

      const mailData = localStorage.getItem(NotificationService.MAIL_KEY);
      if (mailData) {
        this.mails = JSON.parse(mailData);
      }

      const settingsData = localStorage.getItem(NotificationService.SETTINGS_KEY);
      if (settingsData) {
        this.settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(settingsData) };
      }
    } catch (e) {
      console.warn("Failed to load notifications from storage");
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(NotificationService.NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
      localStorage.setItem(NotificationService.MAIL_KEY, JSON.stringify(this.mails));
      localStorage.setItem(NotificationService.SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Failed to save notifications to storage");
    }
  }

  private cleanExpiredItems(): void {
    const now = Date.now();
    
    // 清理过期通知
    this.notifications = this.notifications.filter(
      n => !n.expiresAt || n.expiresAt > now
    );

    // 清理过期邮件
    this.mails = this.mails.filter(
      m => !m.expiresAt || m.expiresAt > now
    );

    // 限制数量
    if (this.notifications.length > this.settings.maxNotifications) {
      this.notifications = this.notifications.slice(-this.settings.maxNotifications);
    }

    this.saveToStorage();
  }

  // 添加通知
  addNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Notification {
    if (!this.settings.enabled || !this.settings.types[notification.type]) {
      return null as unknown as Notification;
    }

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      isRead: false,
    };

    this.notifications.unshift(newNotification);
    
    // 限制数量
    if (this.notifications.length > this.settings.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.settings.maxNotifications);
    }

    this.saveToStorage();
    this.notifyObservers({ type: "notification_added", data: newNotification });

    // 播放声音
    if (this.settings.soundEnabled) {
      this.playNotificationSound(notification.priority);
    }

    return newNotification;
  }

  // 添加邮件
  addMail(mail: Omit<Mail, "id" | "createdAt" | "isRead" | "isClaimed">): Mail {
    const newMail: Mail = {
      ...mail,
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      isRead: false,
      isClaimed: false,
    };

    this.mails.unshift(newMail);
    this.saveToStorage();
    this.notifyObservers({ type: "mail_added", data: newMail });

    return newMail;
  }

  // 获取通知
  getNotifications(type?: NotificationType): Notification[] {
    let notifications = this.notifications;
    
    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  }

  // 获取未读通知
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  // 获取邮件
  getMails(): Mail[] {
    return this.mails.sort((a, b) => b.createdAt - a.createdAt);
  }

  // 获取未读邮件
  getUnreadMails(): Mail[] {
    return this.mails.filter(m => !m.isRead);
  }

  // 标记通知为已读
  markNotificationAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.isRead = true;
    this.saveToStorage();
    this.notifyObservers({ type: "notification_read", data: { notificationId } });
    return true;
  }

  // 标记所有通知为已读
  markAllNotificationsAsRead(): void {
    for (const notification of this.notifications) {
      notification.isRead = true;
    }
    this.saveToStorage();
    this.notifyObservers({ type: "all_notifications_read", data: null });
  }

  // 标记邮件为已读
  markMailAsRead(mailId: string): boolean {
    const mail = this.mails.find(m => m.id === mailId);
    if (!mail) return false;

    mail.isRead = true;
    this.saveToStorage();
    this.notifyObservers({ type: "mail_read", data: { mailId } });
    return true;
  }

  // 领取邮件附件
  claimMailAttachments(mailId: string): { success: boolean; attachments?: MailAttachment[]; error?: string } {
    const mail = this.mails.find(m => m.id === mailId);
    if (!mail) return { success: false, error: "邮件不存在" };

    if (mail.isClaimed) return { success: false, error: "附件已领取" };

    const unclaimedAttachments = mail.attachments.filter(a => !a.claimed);
    if (unclaimedAttachments.length === 0) return { success: false, error: "没有可领取的附件" };

    // 标记为已领取
    for (const attachment of mail.attachments) {
      attachment.claimed = true;
    }
    mail.isClaimed = true;

    this.saveToStorage();
    this.notifyObservers({ type: "mail_claimed", data: { mailId, attachments: unclaimedAttachments } });

    return { success: true, attachments: unclaimedAttachments };
  }

  // 删除通知
  deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    this.notifications.splice(index, 1);
    this.saveToStorage();
    this.notifyObservers({ type: "notification_deleted", data: { notificationId } });
    return true;
  }

  // 删除邮件
  deleteMail(mailId: string): boolean {
    const index = this.mails.findIndex(m => m.id === mailId);
    if (index === -1) return false;

    this.mails.splice(index, 1);
    this.saveToStorage();
    this.notifyObservers({ type: "mail_deleted", data: { mailId } });
    return true;
  }

  // 获取未读数量
  getUnreadCount(): { notifications: number; mails: number; total: number } {
    const notifications = this.notifications.filter(n => !n.isRead).length;
    const mails = this.mails.filter(m => !m.isRead).length;
    return { notifications, mails, total: notifications + mails };
  }

  // 获取可领取附件数量
  getClaimableAttachmentCount(): number {
    return this.mails.filter(m => !m.isClaimed && m.attachments.some(a => !a.claimed)).length;
  }

  // 更新设置
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveToStorage();
  }

  // 获取设置
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // 播放通知声音
  private playNotificationSound(priority: NotificationPriority): void {
    // 实际实现中这里会播放不同的音效
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 根据优先级调整音调
    const frequencies = { low: 440, normal: 523, high: 659, urgent: 880 };
    oscillator.frequency.value = frequencies[priority];

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  // 快速创建常见通知
  createSystemNotification(title: string, message: string): Notification {
    return this.addNotification({
      type: "system",
      title,
      message,
      priority: "normal",
    });
  }

  createRewardNotification(title: string, message: string, rewards: unknown): Notification {
    return this.addNotification({
      type: "reward",
      title,
      message,
      priority: "high",
      action: {
        label: "领取",
        type: "claim_reward",
        data: rewards,
      },
    });
  }

  createAchievementNotification(achievementName: string): Notification {
    return this.addNotification({
      type: "achievement",
      title: "成就解锁",
      message: `恭喜！你解锁了成就：${achievementName}`,
      priority: "high",
      icon: "🏆",
    });
  }

  createFriendRequestNotification(friendName: string): Notification {
    return this.addNotification({
      type: "social",
      title: "好友请求",
      message: `${friendName} 请求添加你为好友`,
      priority: "normal",
    });
  }

  createGameInviteNotification(friendName: string): Notification {
    return this.addNotification({
      type: "game",
      title: "游戏邀请",
      message: `${friendName} 邀请你进行对战`,
      priority: "high",
    });
  }

  // 发送系统邮件
  sendSystemMail(subject: string, content: string, attachments?: MailAttachment[]): Mail {
    return this.addMail({
      from: "system",
      fromName: "系统",
      subject,
      content,
      attachments: attachments || [],
      importance: "normal",
    });
  }

  // 发送补偿邮件
  sendCompensationMail(reason: string, compensation: MailAttachment[]): Mail {
    return this.addMail({
      from: "system",
      fromName: "客服",
      subject: `补偿：${reason}`,
      content: `亲爱的玩家，由于${reason}，我们为你准备了以下补偿，请查收。`,
      attachments: compensation,
      importance: "important",
    });
  }

  subscribe(callback: (event: NotificationEvent) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: NotificationEvent): void {
    this.observers.forEach(callback => callback(event));
  }

  // 清空所有通知
  clearAllNotifications(): void {
    this.notifications = [];
    this.saveToStorage();
  }

  // 清空所有邮件
  clearAllMails(): void {
    this.mails = [];
    this.saveToStorage();
  }
}

export interface NotificationEvent {
  type:
    | "notification_added"
    | "notification_read"
    | "all_notifications_read"
    | "notification_deleted"
    | "mail_added"
    | "mail_read"
    | "mail_claimed"
    | "mail_deleted";
  data: unknown;
}

export const notificationService = new NotificationService();
