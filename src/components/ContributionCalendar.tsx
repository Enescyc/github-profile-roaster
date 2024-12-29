import { motion } from "framer-motion";
import { Contribution } from "../types";
import * as Tooltip from '@radix-ui/react-tooltip';

interface ContributionCalendarProps {
  contributions: Contribution[];
}

interface ContributionDetail {
  type: string;
  repo: string;
  count: number;
}

const ContributionCalendar = ({ contributions }: ContributionCalendarProps) => {
  // Group contributions by date with error handling
  const contributionsByDate = contributions.reduce((acc, contribution) => {
    if (!contribution.date) return acc;
    const date = contribution.date.split('T')[0];
    acc[date] = (acc[date] || 0) + (contribution.count || 0);
    return acc;
  }, {} as { [key: string]: number });

  // Generate last 52 weeks of dates
  const today = new Date();
  const weeks = Array.from({ length: 52 }, (_, weekIndex) => {
    const week = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (51 - weekIndex) * 7 - (6 - dayIndex));
      return date.toISOString().split('T')[0];
    });
    return week;
  });

  const getContributionDetails = (date: string): ContributionDetail[] => {
    return contributions
      .filter(c => c.date?.startsWith(date))
      .map(c => ({
        type: (c.type || 'Unknown').replace('Event', ''),
        repo: (c.repo || 'unknown').split('/').pop() || 'unknown',
        count: c.count || 0
      }))
      .filter(detail => detail.count > 0);
  };

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count <= 2) return 'bg-green-900';
    if (count <= 5) return 'bg-green-700';
    if (count <= 10) return 'bg-green-500';
    return 'bg-green-300';
  };

  return (
    <div className="p-2 sm:p-4 bg-gray-900 rounded-lg overflow-x-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Contribution Calendar 📅</h3>
      <Tooltip.Provider delayDuration={0}>
        <div className="min-w-fit">
          <div className="flex gap-[2px] sm:gap-1 relative">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px] sm:gap-1">
                {week.map((date) => {
                  const count = contributionsByDate[date] || 0;
                  const details = getContributionDetails(date);
                  const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  
                  return (
                    <Tooltip.Root key={date}>
                      <Tooltip.Trigger asChild>
                        <motion.button
                          type="button"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ delay: weekIndex * 0.01 }}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm ${getIntensity(count)} cursor-pointer`}
                        />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="z-50 bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm min-w-[180px] sm:min-w-[200px] max-w-[300px] shadow-xl animate-in fade-in-0 zoom-in-95"
                          sideOffset={5}
                        >
                          <div className="font-semibold mb-2">{formattedDate}</div>
                          <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {count === 0 ? (
                              <div className="text-gray-400">No contributions</div>
                            ) : (
                              <>
                                <div className="font-medium sticky top-0 bg-gray-800 py-1">
                                  Total: {count} contributions
                                </div>
                                <div className="space-y-2">
                                  {details.map((detail, i) => (
                                    <div key={i} className="text-sm text-gray-300 flex justify-between">
                                      <span className="break-all pr-2">{detail.type} in {detail.repo}</span>
                                      <span className="ml-2 flex-shrink-0">×{detail.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Tooltip.Provider>
      <div className="flex justify-end items-center mt-2 text-xs sm:text-sm text-gray-400">
        <span>Less</span>
        <div className="flex gap-[2px] sm:gap-1 mx-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-gray-800" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-900" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-700" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-500" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-300" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionCalendar; 