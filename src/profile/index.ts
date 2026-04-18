import type { ProfileService } from './ProfileService';
import { LocalProfileService } from './LocalProfileService';

export type { ProfileService, ProfileListener, ProfileUpdater } from './ProfileService';
export type {
  PlayerBattleStats,
  PlayerProfile,
  PlayerSaveState,
  PlayerUnlockState,
} from './types';
export { createDefaultPlayerProfile } from './types';
export { LocalProfileService } from './LocalProfileService';
export type {
  ProfileLoginPayload,
  RemoteAuthListener,
  RemoteProfileAuthState,
  RemoteProfileAuthStatus,
  RemoteProfilePushStrategy,
  RemoteProfileServiceOptions,
  RemoteProfileSession,
  RemoteProfileTransport,
} from './RemoteProfileService';
export { RemoteProfileService } from './RemoteProfileService';

let activeProfileService: ProfileService = new LocalProfileService();

export function getProfileService(): ProfileService {
  return activeProfileService;
}

export function setProfileService(service: ProfileService): void {
  activeProfileService = service;
}
