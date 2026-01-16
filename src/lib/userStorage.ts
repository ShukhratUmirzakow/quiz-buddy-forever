// User profile storage using localStorage
export interface UserProfile {
  name: string;
  avatarUrl: string | null; // null means use default
  createdAt: number;
}

const USER_PROFILE_KEY = 'quizmaster-user-profile';

export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export function hasUserProfile(): boolean {
  return localStorage.getItem(USER_PROFILE_KEY) !== null;
}

export function updateUserName(name: string): void {
  const profile = getUserProfile();
  if (profile) {
    profile.name = name;
    saveUserProfile(profile);
  }
}

export function updateUserAvatar(avatarUrl: string | null): void {
  const profile = getUserProfile();
  if (profile) {
    profile.avatarUrl = avatarUrl;
    saveUserProfile(profile);
  }
}
