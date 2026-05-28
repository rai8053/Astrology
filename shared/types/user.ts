export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  timezone: string;
  language: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
}
