import { forwardRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (username: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ onSearch }, ref) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username..."
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          Roast 🔍
        </button>
      </div>
    </form>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar; 