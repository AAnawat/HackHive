export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: number;
  problem: string;
  description?: string;
  difficulty: Difficulty;
  score: number;
  like?: number;
  hints?: string[];
  categories?: string[];
}

export interface User {
  id: number;
  username: string;
  gmail: string;
  pfp_path: string;
  score?: number;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  rank : number;
  pfp_path: string;
}

export interface Session {
  id: string;
  user_id: number;
  problem_id: number;
  flag: string | null;
  status: SessionStatus;
  task_arn: string | null;
  ip_address: string | null;
  started_at: string | null;
  ended_at: string | null;
}

export type SessionItem = {
  id: string;
  user_id: number;
  problem_id: number;
  status: SessionStatus;
};

export type SessionStatus = 'Unknown' | 'Pending' | 'Running' | 'Error' | 'Terminated';

export type SessionResp = Session;

export interface LaunchSessionResp {
  id: string;
  status: SessionStatus;
}