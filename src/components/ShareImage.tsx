import { useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { GitHubProfile } from '../types';

interface ShareImageProps {
  profile: GitHubProfile;
  onGenerate: (dataUrl: string) => void;
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

const ShareImage = ({ profile, onGenerate, onGenerateStart, onGenerateEnd }: ShareImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateImage = async () => {
      if (!containerRef.current) return;
      
      try {
        onGenerateStart?.();
        
        // Wait for fonts and images to load
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(containerRef.current, {
          backgroundColor: '#1a1a1a',
          scale: 2,
          logging: true,
          useCORS: true,
          allowTaint: true,
          width: 1080,
          height: 1080,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector('[data-share-container]');
            if (clonedElement instanceof HTMLElement) {
              clonedElement.style.transform = 'none';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.position = 'relative';
              clonedElement.style.width = '1080px';
              clonedElement.style.height = '1080px';
              clonedElement.style.overflow = 'hidden';
            }
          }
        });
        
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        if (dataUrl === 'data:,') {
          throw new Error('Generated image is empty');
        }

        onGenerate(dataUrl);
      } catch (error) {
        console.error('Error generating image:', error);
      } finally {
        onGenerateEnd?.();
      }
    };

    // Generate image whenever profile changes
    generateImage();

  }, [profile]);

  const { topLanguages, stats, activityStats } = useMemo(() => {
    const totalRepos = Object.values(profile.stats.topLanguages).reduce((a, b) => a + b, 0);
    const languages = Object.entries(profile.stats.topLanguages)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalRepos) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // Calculate activity metrics
    const now = new Date();
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const recentContributions = profile.stats.contributions.filter(
      c => new Date(c.date) > oneMonthAgo
    );
    const avgPerDay = Math.round((recentContributions.reduce((sum, c) => sum + c.count, 0) / 30) * 10) / 10;

    return {
      topLanguages: languages,
      stats: {
        commits: profile.stats.totalContributions,
        streak: profile.stats.contributionStreak,
        repos: profile.stats.totalRepos,
        stars: profile.stats.totalStars,
      },
      activityStats: {
        avgPerDay,
        bestStreak: profile.stats.contributionStreak,
        totalPRs: profile.stats.contributions.filter(c => c.type === 'PullRequestEvent').length,
        activeRepos: new Set(profile.stats.contributions.map(c => c.repo)).size
      }
    };
  }, [profile.stats]);

  const getHolidayEmoji = (score: number) => {
    if (score >= 90) return '🎄';
    if (score >= 80) return '🎅';
    if (score >= 70) return '🎁';
    if (score >= 60) return '⛄';
    if (score >= 50) return '❄️';
    if (score >= 40) return '🦌';
    return '🔔';
  };

  const getHolidayComment = (score: number) => {
    if (score >= 90) return 'Santa\'s Favorite Developer!';
    if (score >= 80) return 'Christmas Star Coder!';
    if (score >= 70) return 'Coding Like An Elf!';
    if (score >= 60) return 'Nice List Material!';
    if (score >= 50) return 'Getting Warmer!';
    if (score >= 40) return 'Coal-ding Skills Need Work!';
    return 'Time for a Christmas Miracle!';
  };

  return (
    <div 
      ref={containerRef}
      data-share-container
      className="bg-gradient-to-br from-green-900 via-red-900 to-green-900"
      style={{ 
        width: '1080px',
        height: '1080px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Snow Effect Background - Updated opacity to 30% */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-6xl animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          >
            {['❄️', '🎄', '🎁', '⭐', '🔔', '🦌'][i % 6]}
          </div>
        ))}
      </div>

      <div className="relative p-12 h-full flex flex-col">
        {/* Header with Holiday Theme */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold mb-2 text-red-400">
            🎄 GitHub Profile Roast 🎄
          </div>
          <div className="text-2xl text-green-400">
            Special Holiday Edition 2024 ⛄
          </div>
        </div>

        {/* Main Score with Holiday Theme */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex flex-col items-center">
            <div className="flex items-center justify-center">
              <div className="text-[160px] font-bold text-red-400 leading-none">
                {profile.evaluationResults.overallScore}
              </div>
              <div className="text-7xl ml-4">
                {getHolidayEmoji(profile.evaluationResults.overallScore)}
              </div>
            </div>
            <div className="text-4xl font-bold mt-4 text-red-300">
              @{profile.username}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Roast Comment */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-red-500/30">
              <div className="text-xl leading-relaxed text-gray-200 italic">
                "{profile.evaluationResults.humorousComments[0]}"
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-green-500/30">
              <h3 className="text-lg font-semibold mb-3 text-green-400">
                🎁 Activity Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>Daily Commits: {activityStats.avgPerDay}</div>
                  <div>Best Streak: {activityStats.bestStreak} days</div>
                  <div>Active Repos: {activityStats.activeRepos}</div>
                  <div>Total PRs: {activityStats.totalPRs}</div>
                </div>
                <div className="space-y-2">
                  <div>Total Repos: {stats.repos}</div>
                  <div>Total Stars: {stats.stars}</div>
                  <div>Total Commits: {stats.commits}</div>
                  <div>Contributions: {profile.stats.totalContributions}</div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-red-500/30">
              <h3 className="text-lg font-semibold mb-3 text-red-400">
                🎄 Score Categories
              </h3>
              <div className="space-y-3">
                {profile.evaluationResults.categories.map(category => (
                  <div key={category.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category.name}</span>
                      <span className="text-green-400">{category.score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-red-500"
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Languages */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-green-500/30">
              <h3 className="text-lg font-semibold mb-3 text-green-400">
                ⭐ Top Languages
              </h3>
              <div className="space-y-3">
                {topLanguages.map((lang, i) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <span className="text-xl">{['🎄', '🎁', '⛄'][i]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>{lang.name}</span>
                        <span className="text-red-400">{lang.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-red-500/30">
              <h3 className="text-lg font-semibold mb-3 text-red-400">
                🎅 Santa's Advice
              </h3>
              <div className="space-y-2 text-sm">
                {profile.evaluationResults.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-lg">
                      {['🎄', '⛄', '🎁', '🔔'][i % 4]}
                    </span>
                    <div>{rec}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contribution Pattern */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-green-500/30">
              <h3 className="text-lg font-semibold mb-3 text-green-400">
                🦌 Activity Highlights
              </h3>
              <div className="space-y-2 text-sm">
                <div>Most Active Time: {profile.stats.contributionStreak} days</div>
                <div>Average Weekly PRs: {Math.round(activityStats.totalPRs / 52)}</div>
                <div>Repository Growth: {stats.repos} total</div>
                <div>Community Impact: {stats.stars} stars received</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎄</span>
            <span className="text-xl text-green-400">github-roaster.com</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-xl">Share Your Holiday Roast</span>
            <span className="text-2xl">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS for snow animation
const styles = `
  @keyframes float {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-20px) rotate(180deg); }
    100% { transform: translateY(0) rotate(360deg); }
  }
  .animate-float {
    animation: float 5s ease-in-out infinite;
  }
`;

export default ShareImage; 