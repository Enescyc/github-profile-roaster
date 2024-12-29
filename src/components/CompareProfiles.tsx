import { GitHubProfile } from '../types';
import ComparisonChart from './ComparisonChart';
import ProfileCard from './ProfileCard';

interface CompareProfilesProps {
  profiles: GitHubProfile[];
}

export const CompareProfiles = ({ profiles }: CompareProfilesProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {profiles.map(profile => (
        <ProfileCard key={profile.username} profile={profile} compact />
      ))}
      <div className="col-span-2">
        <ComparisonChart profiles={profiles} />
      </div>
    </div>
  );
};

export {}; 