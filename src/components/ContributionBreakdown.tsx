import { motion } from "framer-motion";
import { Contribution } from "../types";

interface ContributionBreakdownProps {
  contributions: Contribution[];
}

const ContributionBreakdown = ({ contributions }: ContributionBreakdownProps) => {
  const typeBreakdown = contributions.reduce((acc, contribution) => {
    acc[contribution.type] = (acc[contribution.type] || 0) + contribution.count;
    return acc;
  }, {} as { [key: string]: number });

  const total = Object.values(typeBreakdown).reduce((sum, count) => sum + count, 0);

  const typeIcons: { [key: string]: string } = {
    PushEvent: "🔨",
    PullRequestEvent: "🔄",
    IssuesEvent: "🐛",
    CreateEvent: "✨",
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Contribution Breakdown 📊</h3>
      <div className="space-y-3">
        {Object.entries(typeBreakdown).map(([type, count], index) => {
          const percentage = (count / total) * 100;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-1">
                <span>
                  {typeIcons[type]} {type.replace('Event', '')}
                </span>
                <span className="text-sm text-gray-400">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="h-full bg-blue-400"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ContributionBreakdown; 