import type { PlayerProfile } from './types';

export type ProfileListener = (profile: PlayerProfile) => void;
export type ProfileUpdater = (current: PlayerProfile) => PlayerProfile;

export interface ProfileService {
  getProfile(): PlayerProfile;
  setProfile(profile: PlayerProfile): PlayerProfile;
  updateProfile(updater: ProfileUpdater): PlayerProfile;
  subscribe(listener: ProfileListener): () => void;
  resetProfile(userId?: string): PlayerProfile;
}

