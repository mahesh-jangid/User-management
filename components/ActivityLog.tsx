'use client';

import { useStore } from '@/lib/store';

export default function ActivityLog() {
  const activityLog = useStore((state) => state.activityLog);
  const clearActivityLog = useStore((state) => state.clearActivityLog);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add':
        return 'bg-green-500 dark:bg-green-500 text-white dark:text-white font-bold';
      case 'edit':
        return 'bg-blue-500 dark:bg-blue-500 text-white dark:text-white font-bold';
      case 'delete':
        return 'bg-red-500 dark:bg-red-500 text-white dark:text-white font-bold';
      default:
        return 'bg-gray-500 dark:bg-gray-500 text-white dark:text-white font-bold';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'add':
        return '✚ Added';
      case 'edit':
        return '✎ Edited';
      case 'delete':
        return '✕ Deleted';
      default:
        return action;
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return d.toLocaleDateString();
  };

  return (
    <div className="activity-log-container w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700" data-component="activity-log">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-slate-100 truncate">
          Activity Log
        </h2>
        {activityLog.length > 0 && (
          <button
            onClick={clearActivityLog}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {activityLog.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-center py-6 sm:py-8 text-sm">
          No activity yet
        </p>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {activityLog.map((entry) => (
            <div
              key={entry.id}
              className="activity-card flex items-start gap-2 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600"
            >
              <div
                className={`px-2 sm:px-3 py-1 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getActionColor(
                  entry.action
                )}`}
              >
                {getActionLabel(entry.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">
                  {entry.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">
                  {formatTime(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
