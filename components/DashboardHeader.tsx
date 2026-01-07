
import React, { useState } from 'react';

interface DashboardHeaderProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSearch, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSearch(url);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <i className="fas fa-microscope text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">WebInsight Pro</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter webpage URL (e.g., https://example.com)"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-slate-400"></i>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="absolute inset-y-1 right-1 px-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-indigo-600 transition-colors"><i className="fas fa-bell"></i></button>
          <button className="hover:text-indigo-600 transition-colors"><i className="fas fa-cog"></i></button>
        </div>
      </div>
    </header>
  );
};
