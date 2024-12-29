import { motion } from "framer-motion";
import { Contribution, GitHubProfile } from "../types";
import LanguageChart from "./LanguageChart";
import ContributionCalendar from './ContributionCalendar';
import * as Tooltip from '@radix-ui/react-tooltip';
import ContributionBreakdown from './ContributionBreakdown';
import ContributionPatterns from './ContributionPatterns';


interface ProfileCardProps {
  profile: GitHubProfile;
  compact?: boolean;
}

const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

const ProfileCard = ({ profile, compact }: ProfileCardProps) => {
  const getContributionStats = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const recentContributions = profile.stats.contributions.filter(
      c => new Date(c.date) > oneMonthAgo
    );

    const totalRecent = recentContributions.reduce((sum, c) => sum + c.count, 0);
    const avgPerDay = (totalRecent / 30).toFixed(1);
    
    return {
      recentTotal: totalRecent,
      avgPerDay,
      mostActiveRepo: getMostActiveRepo(profile.stats.contributions),
      bestDay: getBestContributionDay(profile.stats.contributions),
    };
  };

  const getMostActiveRepo = (contributions: Contribution[]) => {
    if (!contributions || contributions.length === 0) {
      return ['No repos', 0];
    }

    const repoActivity = contributions.reduce((acc, c) => {
      if (c.repo) {
        acc[c.repo] = (acc[c.repo] || 0) + c.count;
      }
      return acc;
    }, {} as { [key: string]: number });

    const entries = Object.entries(repoActivity);
    return entries.length > 0 ? entries.sort(([, a], [, b]) => b - a)[0] : ['No repos', 0];
  };

  const getBestContributionDay = (contributions: Contribution[]) => {
    if (!contributions || contributions.length === 0) {
      return { date: 'No data', count: 0 };
    }

    const dailyContributions = contributions.reduce((acc, c) => {
      if (c.date) {
        const date = c.date.split('T')[0];
        acc[date] = (acc[date] || 0) + c.count;
      }
      return acc;
    }, {} as { [key: string]: number });

    const entries = Object.entries(dailyContributions);
    const [bestDay, count] = entries.length > 0 
      ? entries.sort(([, a], [, b]) => b - a)[0]
      : ['No data', 0];

    return {
      date: bestDay === 'No data' ? bestDay : new Date(bestDay).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count,
    };
  };

  const stats = getContributionStats();
  const [mostActiveRepo, repoCount] = stats.mostActiveRepo;

  return (
    <motion.div 
      {...animations}
      whileHover={{ scale: 1.02 }}
      className={`${
        compact ? 'p-4' : 'mt-8 p-6'
      } bg-gray-800 rounded-lg shadow-xl`}
    >
      {compact ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{profile.username}</h2>
          <div className="text-3xl font-bold text-blue-400">
            {profile.evaluationResults.overallScore}/100
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Profile Header */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold">{profile.username}'s Roast Results</h2>
            <div className="mt-2">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl font-bold text-blue-400"
              >
                {profile.evaluationResults.overallScore}/100
              </motion.span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Repos" 
              value={profile.stats.totalRepos} 
              icon="📚"
            />
            <StatCard 
              title="Stars" 
              value={profile.stats.totalStars} 
              icon="⭐"
            />
            <StatCard 
              title="Forks" 
              value={profile.stats.totalForks} 
              icon="🍴"
            />
            <StatCard 
              title="Languages" 
              value={Object.keys(profile.stats.topLanguages).length} 
              icon="💻"
            />
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Streak" 
              value={profile.stats.contributionStreak} 
              icon="🔥"
              description={`Your longest streak of consecutive days with contributions. Keep it up!`}
            />
            <StatCard 
              title="Weekly Avg" 
              value={profile.stats.averageContributionsPerWeek} 
              icon="📊"
              description={`You make an average of ${profile.stats.averageContributionsPerWeek} contributions per week`}
            />
            <StatCard 
              title="30-Day Avg" 
              value={Number(stats.avgPerDay)} 
              icon="📈"
              description={`${stats.recentTotal} contributions in the last 30 days (${stats.avgPerDay} per day)`}
            />
            <StatCard 
              title="Best Day" 
              value={stats.bestDay.count} 
              icon="🌟"
              description={`Most active day was ${stats.bestDay.date} with ${stats.bestDay.count} contributions`}
            />
          </div>

          {/* Most Active Repository Card */}
          <div className="mt-4 bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Most Active Repository 🏆</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{typeof mostActiveRepo === 'string' ? mostActiveRepo.split('/')[1] : mostActiveRepo}</span>
              <span className="bg-blue-500 px-2 py-1 rounded text-sm">
                {repoCount} contributions
              </span>
            </div>
          </div>

          {/* Contribution Calendar */}
          <ContributionCalendar contributions={profile.stats.contributions} />

          {/* Language Distribution */}
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Language Distribution 📊</h3>
            <LanguageChart languages={profile.stats.topLanguages} />
          </div>

          {/* Humorous Comments */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">The Roast 🔥</h3>
            {profile.evaluationResults.humorousComments.map((comment, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="bg-gray-700 p-4 rounded-lg"
              >
                {comment}
              </motion.div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Friendly Advice 💡</h3>
            {profile.evaluationResults.recommendations.map((rec, index) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="bg-gray-700 p-4 rounded-lg"
              >
                {rec}
              </motion.div>
            ))}
          </div>

          {/* Category Scores */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Score Breakdown 📊</h3>
            {profile.evaluationResults.categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-blue-400">{category.score}/100</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.score}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-blue-400"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contribution Breakdown */}
          <ContributionBreakdown contributions={profile.stats.contributions} />

          {/* Contribution Patterns */}
          <div className="bg-gray-900 rounded-lg p-4">
            <ContributionPatterns contributions={profile.stats.contributions} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, description }: { 
  title: string; 
  value: number; 
  icon: string;
  description?: string;
}) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-gray-700 p-4 rounded-lg text-center cursor-pointer"
        >
          <motion.div
            initial={{ rotateY: 0 }}
            whileHover={{ rotateY: 180 }}
            transition={{ duration: 0.3 }}
            className="text-2xl mb-2"
          >
            {icon}
          </motion.div>
          <h4 className="text-gray-400">{title}</h4>
          <div className="text-2xl font-bold">{value}</div>
        </motion.div>
      </Tooltip.Trigger>
      {description && (
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm max-w-xs"
            sideOffset={5}
          >
            {description}
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      )}
    </Tooltip.Root>
  </Tooltip.Provider>
);

export default ProfileCard; 