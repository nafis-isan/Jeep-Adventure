import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' ? '/api' : 'http://localhost:8000/api')).replace(/\/$/, '');
const TOKEN_KEY = 'jeep-adventure-token';

export const LOGO_URL = Platform.OS === 'web'
  ? '/Assets/images/jeep-adventure-logo.jpeg'
  : `${new URL(API_URL).origin}/Assets/images/jeep-adventure-logo.jpeg`;

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'FACILITATOR';
};

export type Team = {
  id: string;
  name: string;
  initials: string;
  motto: string;
  color?: string;
  status: string;
  members?: { id: string; name: string }[];
  totalPoints?: number;
  completedGames?: number;
  completedRoutes?: number;
};

export type AdventureRoute = {
  id: string;
  position: number;
  name: string;
  game_type: string;
  description: string;
  instruction: string;
  location: string;
  duration: number;
  max_points: number;
  difficulty: string;
  color: string;
};

export type LeaderboardEntry = {
  teamId: string;
  name: string;
  initials: string;
  totalPoints: number;
  completedGames: number;
};

export type Experience = {
  id: string;
  story: string;
  rating: number;
  media_url: string | null;
  created_at: string;
  team: { id: string; name: string; initials: string };
  route: { id: string; name: string; game_type: string };
  user: { id: string; name: string };
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function request<T>(
  path: string,
  token?: string | null,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(`Tidak dapat menghubungi server. Periksa alamat API: ${API_URL}`);
  }

  const payload = await response.json().catch(() => null) as (T & { message?: string; errors?: Record<string, string[]> }) | null;
  if (!response.ok) {
    const validationMessage = payload?.errors ? Object.values(payload.errors).flat()[0] : undefined;
    throw new Error(validationMessage || payload?.message || `Permintaan gagal (${response.status}).`);
  }
  if (!payload) throw new Error('Server mengirim respons yang tidak valid.');
  return payload;
}

export const saveToken = (token: string) => Platform.OS === 'web'
  ? Promise.resolve().then(() => { globalThis.localStorage.setItem(TOKEN_KEY, token); })
  : SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken = () => Platform.OS === 'web'
  ? Promise.resolve().then(() => globalThis.localStorage.getItem(TOKEN_KEY))
  : SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => Platform.OS === 'web'
  ? Promise.resolve().then(() => { globalThis.localStorage.removeItem(TOKEN_KEY); })
  : SecureStore.deleteItemAsync(TOKEN_KEY);
