import { motion } from "framer-motion";

const ProfileSkeleton = () => {
  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-xl animate-pulse">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center">
          <div className="h-8 w-64 bg-gray-700 rounded mx-auto mb-4"></div>
          <div className="h-12 w-24 bg-gray-700 rounded mx-auto"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-700 p-4 rounded-lg">
              <div className="h-6 w-16 bg-gray-600 rounded mx-auto mb-2"></div>
              <div className="h-8 w-12 bg-gray-600 rounded mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-gray-700/50 p-6 rounded-lg">
          <div className="h-6 w-48 bg-gray-700 rounded mb-4"></div>
          <div className="h-[300px] bg-gray-700 rounded"></div>
        </div>

        {/* Comments Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-700 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton; 