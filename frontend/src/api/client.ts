// src/api/client.ts

// ========== Base URL ==========
const API_BASE = 'http://localhost:8080/api';

type FetchOptions = RequestInit & { token?: string };

// ========== Generic Request Helper ==========
async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (data as any)?.error || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(message);
  }

  return data as T;
}

// ========== Problems ==========
export interface ProblemsFilter {
  problem?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  categories?: string[];
  page?: number;
  perPage?: number;
}

export function getProblems(filter: ProblemsFilter = {}) {
  const params = new URLSearchParams();
  if (filter.problem) params.set('problem', filter.problem);
  if (filter.difficulty) params.set('difficulty', filter.difficulty);
  if (filter.categories?.length) params.set('categories', filter.categories.join(','));
  params.set('page', String(filter.page ?? 1));
  params.set('perPage', String(filter.perPage ?? 10));

  return request(`/problems?${params.toString()}`);
}

export function getProblem(id: number) {
  return request(`/problems/${id}`);
}

export function voteProblem(id: number, isLiked: boolean, token: string) {
  return request(`/problems/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ isLiked }),
    token,
  });
}

export function submitFlag(
  id: number,
  flag: string,
  token: string
): Promise<{ correct: boolean; message: string; score?: number }> {
  return request(`/problems/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ flag }),
    token,
  });
}

// ========== API: Get Problem Categories ==========
export function getProblemCategories(): Promise<{ categories: string[] }> {
  return request('/problems/categories/list');
}
// ========== Auth ==========
export function login(gmail: string, password: string): Promise<{ token: string }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ gmail, password }),
  });
}

// ========== Users ==========
export function registerUser(gmail: string, username: string, password: string) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ gmail, username, password }),
  });
}

export function getUser(id: number) {
  return request(`/users/${id}`);
}

export function updateUser(id: number, payload: Record<string, unknown>, token: string) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  });
}

// ========== Leaderboard ==========
export interface LeaderboardEntry {
  id: number;
  username: string;
  totalScore: number;
  problemsSolved: number;
}

export function getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  return request(`/users/leaderboard?limit=${limit}`);
}
