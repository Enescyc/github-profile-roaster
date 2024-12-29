import { GitHubProfile } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ComparisonChartProps {
  profiles: GitHubProfile[];
}

const ComparisonChart = ({ profiles }: ComparisonChartProps) => {
  const data = profiles.map(profile => ({
    name: profile.username,
    score: profile.evaluationResults.overallScore,
    stars: profile.stats.totalStars,
    contributions: profile.stats.totalContributions,
  }));

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Comparison</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#60A5FA" name="Overall Score" />
            <Bar dataKey="stars" fill="#34D399" name="Total Stars" />
            <Bar dataKey="contributions" fill="#F472B6" name="Contributions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart; 