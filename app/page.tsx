'use client'; 

import UserList from '@/components/UserList';
import ActivityLog from '@/components/ActivityLog';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-5 py-1 bg-white dark:bg-slate-950">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 bg-white dark:bg-slate-950">
        {/* Main content - Users table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-950">
          <UserList />
        </div>

        {/* Sidebar - Activity log */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-950">
          <div className="sticky top-22 bg-white dark:bg-slate-950">
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>  
  );
}
