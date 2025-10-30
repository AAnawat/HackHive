import type { SessionResp, LaunchSessionResp } from '../types';
// ========== Base URL ==========
const API_BASE = 'http://localhost:8080/api';

type FetchOptions = RequestInit & { token?: string };

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

export async function getProblem(problemId: number) {
  const res = await fetch(`${API_BASE}/problems/${problemId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch problem');
  }
  return res.json();
}

export function voteProblem(problemId: number, isLiked: boolean, token: string) {
  return request(`/problems/${problemId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ isLiked }),
    token,
  });
}

export async function getSession(token?: string, problemId?: number): Promise<SessionResp> {
  try {

    const res: any = await request('/sessions', {
      method: 'GET',
      token,
    });
    
    if (!res) {
      throw new Error('Failed to fetch session');
    }

    if (res.problem_id !== problemId) {
      throw new Error('No open session for this problem');
    }

    return res as SessionResp;

  } catch (error) {
    console.log("Error fetching session:", error);
    return undefined
  }
}

export async function launchSession(userId: number, problemId: number, token?: string): Promise<LaunchSessionResp> {
  const res = await fetch(`${API_BASE}/sessions/launch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ userId, problemId }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Launch failed: ${res.status}${detail ? ` - ${detail}` : ''}`);
  }

  const data = await res.json();
  return data as LaunchSessionResp;
}

export async function getSessionStatus(sessionId: number | string, token?: string): Promise<SessionResp> {
  try {
    
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });
  
    if (!res.ok) {
      if (res.status === 204) {
        return {
          id: String(sessionId),
          user_id: 0,
          problem_id: 0,
          flag: null,
          status: 'Pending',
          task_arn: null,
          ip_address: null,
          started_at: null,
          ended_at: null,
        };
      }
      const detail = await res.text().catch(() => '');
      throw new Error(`Status check failed: ${res.status}${detail ? ` - ${detail}` : ''}`);
    }
  
    const data = await res.json();
    if (data && data.status === 'Active') {
      data.status = 'Running';
    }
  
    return data as SessionResp;

  } catch (error) {
    console.log(error);
    return undefined
  }
}


export async function stopSession(sessionId: number | string, token?: string): Promise<void> {
  await request(`/sessions/${sessionId}/stop`, {
    method: 'DELETE',
    token,
  });
}

export function submitFlag(
  session_id: number,
  flag: string,
  token: string
): Promise<{ correct: boolean; message: string; score?: number }> {
  return request(`/sessions/${session_id}/submit`, {
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

// Helper function to create FormData for user updates with file
export function createUserUpdateFormData(payload: Record<string, unknown>, file?: File): FormData {
  const formData = new FormData();

  // Add all text fields to FormData
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Add file if provided
  if (file) {
    formData.append('profile_pic', file);
  }

  return formData;
}

export function getUser(userId: number) {
  return request(`/users/${userId}`);
}

export function updateUser(userId: number, payload: FormData, token: string) {
  // Validate that payload is FormData since backend only accepts FormData
  if (!(payload instanceof FormData)) {
    throw new Error('updateUser only accepts FormData. Backend requires FormData for all user updates.');
  }

  const options: FetchOptions = {
    method: 'PUT',
    token,
    // For FormData, don't set Content-Type header - let browser set it with boundary
    body: payload
  };

  return requestFormData(`/users/${userId}`, options);
}

// Request helper specifically for FormData requests
async function requestFormData<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  // Don't set Content-Type for FormData - let browser set it with boundary
  // Add any additional headers (but not Content-Type)
  if (options.headers) {
    const additionalHeaders = options.headers as Record<string, string>;
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        headers[key] = value;
      }
    });
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message = (data as any)?.error || (typeof data === 'string' ? data : 'Request failed');

      // Enhanced error handling for FormData upload scenarios
      if (res.status === 415) {
        throw new Error('Unsupported file type. Please select a valid image file.');
      }
      if (res.status >= 500) {
        throw new Error('Server error during upload. Please try again.');
      }

      throw new Error(message);
    }

    return data as T;
  } catch (error) {
    // Handle network errors for FormData uploads
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error during upload. Please check your connection and try again.');
    }
    throw error;
  }
}

export  function getLeaderboard(limit: number = 20): Promise<any[]> {
  return request(`/leaderboard?limit=${limit}`);
}