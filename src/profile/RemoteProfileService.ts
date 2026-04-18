import type { ProfileListener, ProfileService, ProfileUpdater } from './ProfileService';
import { LocalProfileService } from './LocalProfileService';
import {
  clonePlayerProfile,
  createDefaultPlayerProfile,
  type PlayerProfile,
  PROFILE_STORAGE_VERSION,
} from './types';

const REMOTE_SESSION_STORAGE_KEY = 'jixia.profile.remote-session.v1';

export interface ProfileLoginPayload {
  userId: string;
  password?: string;
  token?: string;
  provider?: string;
  metadata?: Record<string, string>;
}

export interface RemoteProfileSession {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface RemoteProfileTransport {
  login(payload: ProfileLoginPayload): Promise<RemoteProfileSession>;
  pullProfile(session: RemoteProfileSession): Promise<Partial<PlayerProfile> | null>;
  pushProfile(session: RemoteProfileSession, profile: PlayerProfile): Promise<void>;
  logout?(session: RemoteProfileSession): Promise<void>;
}

export type RemoteProfileAuthStatus =
  | 'signed_out'
  | 'authenticating'
  | 'signed_in'
  | 'syncing'
  | 'error';

export interface RemoteProfileAuthState {
  status: RemoteProfileAuthStatus;
  session: RemoteProfileSession | null;
  lastError: string | null;
}

export type RemoteAuthListener = (state: RemoteProfileAuthState) => void;

export type RemoteProfilePushStrategy = 'manual' | 'on_mutation' | 'interval';

export interface RemoteProfileServiceOptions {
  transport: RemoteProfileTransport;
  localCache?: ProfileService;
  autoPullOnLogin?: boolean;
  pushStrategy?: RemoteProfilePushStrategy;
  pushIntervalMs?: number;
  // Backward compatibility: maps to pushStrategy='on_mutation' when true.
  autoPushOnMutation?: boolean;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeNumber(value: unknown, fallback: number, min = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.floor(value));
}

function normalizeRemoteProfile(
  input: Partial<PlayerProfile> | null | undefined,
  fallbackUserId: string,
): PlayerProfile {
  const base = createDefaultPlayerProfile(fallbackUserId);
  if (!input) return base;

  return {
    ...base,
    ...input,
    userId: typeof input.userId === 'string' && input.userId.trim() ? input.userId : base.userId,
    level: normalizeNumber(input.level, base.level, 1),
    exp: normalizeNumber(input.exp, base.exp, 0),
    totalExp: normalizeNumber(input.totalExp, base.totalExp, 0),
    unlock: {
      ...base.unlock,
      ...(input.unlock ?? {}),
      personages: Array.isArray(input.unlock?.personages)
        ? [...input.unlock.personages]
        : base.unlock.personages,
      factionReputation: {
        ...base.unlock.factionReputation,
        ...(input.unlock?.factionReputation ?? {}),
      },
      cardCollection: {
        ...base.unlock.cardCollection,
        ...(input.unlock?.cardCollection ?? {}),
      },
    },
    save: {
      ...base.save,
      ...(input.save ?? {}),
    },
    stats: {
      ...base.stats,
      ...(input.stats ?? {}),
    },
    version: PROFILE_STORAGE_VERSION,
    updatedAt: Date.now(),
  };
}

function cloneAuthState(state: RemoteProfileAuthState): RemoteProfileAuthState {
  return {
    ...state,
    session: state.session ? { ...state.session } : null,
  };
}

export class RemoteProfileService implements ProfileService {
  private profile: PlayerProfile;
  private readonly transport: RemoteProfileTransport;
  private readonly localCache: ProfileService;
  private readonly autoPullOnLogin: boolean;
  private readonly pushStrategy: RemoteProfilePushStrategy;
  private readonly pushIntervalMs: number;
  private readonly listeners = new Set<ProfileListener>();
  private readonly authListeners = new Set<RemoteAuthListener>();
  private authState: RemoteProfileAuthState;
  private pushIntervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(options: RemoteProfileServiceOptions) {
    this.transport = options.transport;
    this.localCache = options.localCache ?? new LocalProfileService();
    this.autoPullOnLogin = options.autoPullOnLogin ?? true;
    this.pushStrategy =
      options.pushStrategy ?? (options.autoPushOnMutation ? 'on_mutation' : 'manual');
    this.pushIntervalMs = Math.max(5_000, options.pushIntervalMs ?? 60_000);
    this.profile = this.localCache.getProfile();

    const cachedSession = this.loadCachedSession();
    this.authState = {
      status: cachedSession ? 'signed_in' : 'signed_out',
      session: cachedSession,
      lastError: null,
    };

    if (this.pushStrategy === 'interval') {
      this.startPushInterval();
    }
  }

  getProfile(): PlayerProfile {
    return clonePlayerProfile(this.profile);
  }

  setProfile(profile: PlayerProfile): PlayerProfile {
    this.profile = normalizeRemoteProfile(profile, this.profile.userId);
    this.localCache.setProfile(this.profile);
    this.notifyProfile();
    this.schedulePushIfNeeded();
    return this.getProfile();
  }

  updateProfile(updater: ProfileUpdater): PlayerProfile {
    const nextProfile = updater(this.getProfile());
    this.profile = normalizeRemoteProfile(nextProfile, this.profile.userId);
    this.localCache.setProfile(this.profile);
    this.notifyProfile();
    this.schedulePushIfNeeded();
    return this.getProfile();
  }

  subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  resetProfile(userId = this.profile.userId): PlayerProfile {
    this.profile = this.localCache.resetProfile(userId);
    this.notifyProfile();
    this.schedulePushIfNeeded();
    return this.getProfile();
  }

  getAuthState(): RemoteProfileAuthState {
    return cloneAuthState(this.authState);
  }

  subscribeAuth(listener: RemoteAuthListener): () => void {
    this.authListeners.add(listener);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  async login(payload: ProfileLoginPayload): Promise<RemoteProfileAuthState> {
    this.setAuthState({
      status: 'authenticating',
      session: this.authState.session,
      lastError: null,
    });

    try {
      const session = await this.transport.login(payload);
      const normalizedSession = this.normalizeSession(session);
      this.persistCachedSession(normalizedSession);
      this.setAuthState({
        status: 'signed_in',
        session: normalizedSession,
        lastError: null,
      });

      if (this.autoPullOnLogin) {
        await this.pullRemoteProfileFromSession(normalizedSession);
      } else if (this.profile.userId !== normalizedSession.userId) {
        // Keep local progress, but attach it to signed-in account when pull is disabled.
        this.profile = normalizeRemoteProfile(this.profile, normalizedSession.userId);
        this.localCache.setProfile(this.profile);
        this.notifyProfile();
      }

      return this.getAuthState();
    } catch (err) {
      this.persistCachedSession(null);
      this.setAuthState({
        status: 'error',
        session: null,
        lastError: this.toErrorMessage(err),
      });
      throw err;
    }
  }

  async pullRemoteProfile(): Promise<PlayerProfile> {
    const session = this.requireSession();
    return this.pullRemoteProfileFromSession(session);
  }

  private async pullRemoteProfileFromSession(session: RemoteProfileSession): Promise<PlayerProfile> {
    this.setAuthState({
      status: 'syncing',
      session,
      lastError: null,
    });

    try {
      const remoteProfile = await this.transport.pullProfile(session);
      this.profile = remoteProfile
        ? normalizeRemoteProfile(remoteProfile, session.userId)
        : createDefaultPlayerProfile(session.userId);
      this.localCache.setProfile(this.profile);
      this.notifyProfile();

      this.setAuthState({
        status: 'signed_in',
        session,
        lastError: null,
      });
      return this.getProfile();
    } catch (err) {
      this.setAuthState({
        status: 'error',
        session,
        lastError: this.toErrorMessage(err),
      });
      throw err;
    }
  }

  async pushRemoteProfile(profile: PlayerProfile = this.profile): Promise<PlayerProfile> {
    const session = this.requireSession();
    const normalizedProfile = normalizeRemoteProfile(profile, session.userId);

    this.setAuthState({
      status: 'syncing',
      session,
      lastError: null,
    });

    try {
      await this.transport.pushProfile(session, normalizedProfile);
      this.profile = normalizedProfile;
      this.localCache.setProfile(this.profile);
      this.notifyProfile();
      this.setAuthState({
        status: 'signed_in',
        session,
        lastError: null,
      });
      return this.getProfile();
    } catch (err) {
      this.setAuthState({
        status: 'error',
        session,
        lastError: this.toErrorMessage(err),
      });
      throw err;
    }
  }

  async logout(): Promise<RemoteProfileAuthState> {
    const session = this.authState.session;
    if (session && this.transport.logout) {
      try {
        await this.transport.logout(session);
      } catch (err) {
        this.setAuthState({
          status: 'error',
          session,
          lastError: this.toErrorMessage(err),
        });
        throw err;
      }
    }

    this.persistCachedSession(null);
    this.setAuthState({
      status: 'signed_out',
      session: null,
      lastError: null,
    });
    return this.getAuthState();
  }

  dispose(): void {
    this.stopPushInterval();
    this.listeners.clear();
    this.authListeners.clear();
  }

  private schedulePushIfNeeded(): void {
    if (this.pushStrategy !== 'on_mutation' || !this.authState.session) return;

    void this.pushRemoteProfile(this.profile).catch(() => {
      // pushRemoteProfile updates auth state with failure details.
    });
  }

  private startPushInterval(): void {
    if (this.pushIntervalHandle) return;
    this.pushIntervalHandle = setInterval(() => {
      if (!this.authState.session) return;
      void this.pushRemoteProfile(this.profile).catch(() => {
        // pushRemoteProfile updates auth state with failure details.
      });
    }, this.pushIntervalMs);
  }

  private stopPushInterval(): void {
    if (!this.pushIntervalHandle) return;
    clearInterval(this.pushIntervalHandle);
    this.pushIntervalHandle = null;
  }

  private notifyProfile(): void {
    const snapshot = this.getProfile();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private notifyAuth(): void {
    const snapshot = this.getAuthState();
    for (const listener of this.authListeners) {
      listener(snapshot);
    }
  }

  private setAuthState(state: RemoteProfileAuthState): void {
    this.authState = cloneAuthState(state);
    this.notifyAuth();
  }

  private normalizeSession(session: RemoteProfileSession): RemoteProfileSession {
    if (!session.accessToken || typeof session.accessToken !== 'string') {
      throw new Error('Remote profile session is missing accessToken.');
    }
    if (!session.userId || typeof session.userId !== 'string' || !session.userId.trim()) {
      throw new Error('Remote profile session is missing userId from server.');
    }

    return {
      ...session,
      userId: session.userId,
    };
  }

  private requireSession(): RemoteProfileSession {
    if (!this.authState.session) {
      throw new Error('Remote profile service is not logged in.');
    }

    return this.authState.session;
  }

  private loadCachedSession(): RemoteProfileSession | null {
    if (!isBrowser()) return null;

    try {
      const raw = window.localStorage.getItem(REMOTE_SESSION_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<RemoteProfileSession>;
      if (
        typeof parsed.userId !== 'string' ||
        !parsed.userId.trim() ||
        typeof parsed.accessToken !== 'string' ||
        !parsed.accessToken.trim()
      ) {
        return null;
      }

      return {
        userId: parsed.userId,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresAt: parsed.expiresAt,
      };
    } catch {
      return null;
    }
  }

  private persistCachedSession(session: RemoteProfileSession | null): void {
    if (!isBrowser()) return;

    try {
      if (session) {
        window.localStorage.setItem(REMOTE_SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(REMOTE_SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.error('[profile] Failed to persist remote session:', err);
    }
  }

  private toErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Unknown remote profile error.';
  }
}
