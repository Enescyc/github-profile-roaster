import axios from 'axios';
import { GitHubProfile, Repository, ProfileStats, Contribution } from '../types';
import { CacheService } from './cache';

const GITHUB_API_BASE = 'https://api.github.com';

interface RoastCategory {
  name: string;
  score: number;
  comment: string;
  recommendation?: string;
}

class RateLimiter {
  private requests: number = 0;
  private resetTime: Date = new Date();

  async checkLimit(): Promise<boolean> {
    if (this.requests >= 60) {
      const now = new Date();
      if (now < this.resetTime) {
        throw new Error('Rate limit exceeded');
      }
      this.requests = 0;
    }
    this.requests++;
    return true;
  }
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const cachedProfile = CacheService.get<GitHubProfile>(username);
  if (cachedProfile) {
    return cachedProfile;
  }

  try {
    // Fetch user repositories
    const reposResponse = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`
    );

    // Fetch user events (contributions)
    const eventsResponse = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/events?per_page=100`
    );

    const repositories: Repository[] = reposResponse.data.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      lastUpdated: repo.updated_at,
    }));

    // Process contributions
    const contributions = processContributions(eventsResponse.data);
    const stats = calculateStats(repositories, contributions);
    const evaluationResults = evaluateProfile(repositories, stats);

    const profile: GitHubProfile = {
      username,
      repositories,
      stats,
      evaluationResults,
    };

    CacheService.set(username, profile);
    return profile;
  } catch (error) {
    throw new Error('Failed to fetch GitHub profile');
  }
}

function processContributions(events: any[]): Contribution[] {
  return events
    .filter(event => ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent'].includes(event.type))
    .map(event => ({
      type: event.type,
      repo: event.repo.name,
      date: event.created_at,
      count: event.type === 'PushEvent' ? event.payload.commits?.length || 1 : 1,
    }));
}

function calculateStats(repositories: Repository[], contributions: Contribution[]): ProfileStats {
  const stats: ProfileStats = {
    totalStars: 0,
    totalForks: 0,
    totalRepos: repositories.length,
    topLanguages: {},
    contributionsLastYear: 0,
    contributionStreak: calculateContributionStreak(contributions),
    contributions,
    totalContributions: contributions.reduce((sum, c) => sum + c.count, 0),
    averageContributionsPerWeek: 0,
  };

  // Calculate language stats
  repositories.forEach((repo) => {
    stats.totalStars += repo.stars;
    stats.totalForks += repo.forks;
    if (repo.language) {
      stats.topLanguages[repo.language] = (stats.topLanguages[repo.language] || 0) + 1;
    }
  });

  // Calculate contributions in the last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  stats.contributionsLastYear = contributions
    .filter(c => new Date(c.date) > oneYearAgo)
    .reduce((sum, c) => sum + c.count, 0);

  // Calculate average contributions per week
  const weeks = 52;
  stats.averageContributionsPerWeek = Math.round(stats.contributionsLastYear / weeks);

  return stats;
}

function calculateContributionStreak(contributions: Contribution[]): number {
  let currentStreak = 0;
  let maxStreak = 0;
  let lastDate: Date | null = null;

  // Sort contributions by date
  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sortedContributions.forEach(contribution => {
    const currentDate = new Date(contribution.date);
    
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const dayDifference = Math.floor(
        (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDifference <= 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    lastDate = currentDate;
  });

  return maxStreak;
}

function evaluateProfile(repositories: Repository[], stats: ProfileStats) {
  const categories: RoastCategory[] = [];
  let totalScore = 0;
  const humorousComments: string[] = [];
  const recommendations: string[] = [];

  // Repository Quality
  const repoQuality = evaluateRepoQuality(repositories);
  categories.push(repoQuality);

  // Code Consistency
  const codeConsistency = evaluateCodeConsistency(repositories, stats);
  categories.push(codeConsistency);

  // Community Engagement
  const communityEngagement = evaluateCommunityEngagement(stats);
  categories.push(communityEngagement);

  // Project Maintenance
  const projectMaintenance = evaluateProjectMaintenance(repositories);
  categories.push(projectMaintenance);

  // Add contribution evaluation
  const contributionCategory = evaluateContributions(stats);
  categories.push(contributionCategory);

  // Calculate final score and collect comments
  categories.forEach(category => {
    totalScore += category.score;
    humorousComments.push(category.comment);
    if (category.recommendation) {
      recommendations.push(category.recommendation);
    }
  });

  return {
    overallScore: Math.round(totalScore / categories.length),
    humorousComments,
    recommendations,
    categories // Adding categories to the response
  };
}

function evaluateRepoQuality(repositories: Repository[]): RoastCategory {
  const hasReadme = repositories.some(repo => 
    repo.name.toLowerCase().includes('readme') || repo.description?.toLowerCase().includes('readme')
  );
  const hasTests = repositories.some(repo => 
    repo.name.toLowerCase().includes('test') || repo.description?.toLowerCase().includes('test')
  );

  const score = hasReadme ? (hasTests ? 85 : 65) : (hasTests ? 60 : 40);
  
  return {
    name: "Repository Quality",
    score,
    comment: getRepoQualityComment(hasReadme, hasTests),
    recommendation: getRepoQualityRecommendation(hasReadme, hasTests)
  };
}

function evaluateCodeConsistency(repositories: Repository[], stats: ProfileStats): RoastCategory {
  const languageCount = Object.keys(stats.topLanguages).length;
  let score = 70;
  let comment = "";
  let recommendation = "";

  if (languageCount === 0) {
    score = 0;
    comment = "Your profile is as empty as my coffee cup on Monday morning! ☕";
    recommendation = "Start by pushing some code - any code!";
  } else if (languageCount === 1) {
    score = 60;
    comment = "Monogamous with your programming language, I see! 💍";
    recommendation = "Try exploring other languages - polyglot programming is the future!";
  } else if (languageCount > 8) {
    score = 75;
    comment = "Jack of all trades, master of... some? 🃏";
    recommendation = "Consider focusing on a few languages to build deeper expertise.";
  } else {
    score = 85;
    comment = "Nice language diversity - you're like the United Nations of code! 🌎";
  }

  return { name: "Code Consistency", score, comment, recommendation };
}

function evaluateCommunityEngagement(stats: ProfileStats): RoastCategory {
  const { totalStars, totalForks } = stats;
  let score = 70;
  let comment = "";
  let recommendation = "";

  if (totalStars === 0 && totalForks === 0) {
    score = 30;
    comment = "Your repos are like my high school dance - nobody's joining in! 💃";
    recommendation = "Try contributing to popular projects to gain visibility!";
  } else if (totalStars + totalForks > 100) {
    score = 90;
    comment = "Look at you, Mr./Ms. Popular! Your repos are getting more action than a cat video! 🐱";
  } else {
    score = 60;
    comment = "Your community engagement is like my gym membership - showing potential but needs more commitment! 🏋️‍♂️";
    recommendation = "Consider creating more shareable content and engaging with other projects!";
  }

  return { name: "Community Engagement", score, comment, recommendation };
}

function evaluateProjectMaintenance(repositories: Repository[]): RoastCategory {
  const now = new Date();
  const recentActivity = repositories.filter(repo => {
    const lastUpdate = new Date(repo.lastUpdated);
    const monthsAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo < 3;
  }).length;

  let score = 70;
  let comment = "";
  let recommendation = "";

  if (recentActivity === 0) {
    score = 30;
    comment = "Your last commit is so old, it probably runs on Windows 95! 🖥️";
    recommendation = "Time to dust off that keyboard and get coding!";
  } else if (recentActivity > 5) {
    score = 90;
    comment = "You're coding like there's no tomorrow! Save some commits for the rest of us! ⚡";
  } else {
    score = 60;
    comment = "Your commit history is like my diet - inconsistent but trying! 🥗";
    recommendation = "Try to maintain a more regular coding schedule!";
  }

  return { name: "Project Maintenance", score, comment, recommendation };
}

function getRepoQualityComment(hasReadme: boolean, hasTests: boolean): string {
  if (!hasReadme && !hasTests) {
    return "Documentation? Tests? Never heard of them! Living life on the edge! 🎢";
  } else if (!hasReadme) {
    return "Tests but no README? It's like having a book with no cover! 📚";
  } else if (!hasTests) {
    return "Great README, but where are the tests? It's like a car with no airbags! 🚗";
  }
  return "Look at you, with your tests and documentation! Someone's been reading 'Clean Code'! 📖";
}

function getRepoQualityRecommendation(hasReadme: boolean, hasTests: boolean): string {
  if (!hasReadme && !hasTests) {
    return "Add some READMEs and tests - your future self will thank you!";
  } else if (!hasReadme) {
    return "Consider adding READMEs to help others understand your projects!";
  } else if (!hasTests) {
    return "Adding tests would make your projects more reliable!";
  }
  return "";
}

// Add new contribution-based roasts
function evaluateContributions(stats: ProfileStats): RoastCategory {
  const { contributionStreak, averageContributionsPerWeek } = stats;
  let score = 70;
  let comment = "";
  let recommendation = "";

  if (contributionStreak > 30) {
    score = 95;
    comment = "Your contribution streak is longer than my Netflix binge sessions! 🔥";
  } else if (contributionStreak > 14) {
    score = 85;
    comment = "Two weeks of daily commits? Someone's trying to impress their future employer! 👔";
  } else if (contributionStreak > 7) {
    score = 75;
    comment = "A week-long streak! Your keyboard must be feeling loved! ⌨️";
  } else {
    score = 60;
    comment = "Your contribution graph looks like my gym attendance - sporadic at best! 💪";
    recommendation = "Try to code a little bit every day - consistency is key!";
  }

  if (averageContributionsPerWeek > 20) {
    comment += "\nYou're pushing code faster than I push my luck! 🎲";
  }

  return {
    name: "Contribution Activity",
    score,
    comment,
    recommendation
  };
} 