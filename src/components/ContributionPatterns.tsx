import { motion } from "framer-motion";
import { Contribution } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ContributionPatternsProps {
  contributions: Contribution[];
}

const ContributionPatterns = ({ contributions }: ContributionPatternsProps) => {
  // Calculate activity by day of week
  const getDayOfWeekStats = () => {
    const dayStats = Array(7).fill(0);
    contributions.forEach(c => {
      if (!c.date) return;
      const day = new Date(c.date).getDay();
      dayStats[day] += c.count || 0;
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((name, index) => ({
      name,
      contributions: dayStats[index]
    }));
  };

  // Calculate activity by hour
  const getHourlyStats = () => {
    const hourStats = Array(24).fill(0);
    contributions.forEach(c => {
      if (!c.date) return;
      const hour = new Date(c.date).getHours();
      hourStats[hour] += c.count || 0;
    });
    
    return hourStats.map((count, hour) => ({
      name: `${hour}:00`,
      contributions: count
    }));
  };

  const dayStats = getDayOfWeekStats();
  const hourStats = getHourlyStats();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Activity by Day of Week 📅</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dayStats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: 'white' }}
            />
            <Bar dataKey="contributions" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Activity by Hour ⏰</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourStats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
              labelStyle={{ color: 'white' }}
            />
            <Bar dataKey="contributions" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContributionPatterns; 