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


