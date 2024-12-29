export interface Repository {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
}

export interface ProfileStats {
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  topLanguages: { [key: string]: number };
  contributionsLastYear: number;
  contributionStreak: number;
  contributions: Contribution[];
  totalContributions: number;
  averageContributionsPerWeek: number;
}

export interface GitHubProfile {
  username: string;
  repositories: Repository[];
  stats: ProfileStats;
  evaluationResults: EvaluationResult;
}

export interface RoastCategory {
  name: string;
  score: number;
  comment: string;
  recommendation?: string;
}

export interface EvaluationResult {
  overallScore: number;
  humorousComments: string[];
  recommendations: string[];
  categories: RoastCategory[];
}

export interface Contribution {
  type: string;
  repo: string;
  date: string;
  count: number;
}

interface UserProgress {
  searchHistory: string[];
  lastVisited: Date;
  favoriteProfiles: string[];
  compareHistory: string[][];
} 