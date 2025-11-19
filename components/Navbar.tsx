'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import * as Switch from '@radix-ui/react-switch';

export default function Navbar() {
  const loggedInUser = useStore((state) => state.loggedInUser);
  const setLoggedInUser = useStore((state) => state.setLoggedInUser);
  const darkMode = useStore((state) => state.darkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);

  useEffect(() => {
    console.log('Dark mode changed:', darkMode);
  }, [darkMode]);

  // Fetch users to set a default logged-in user
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userAPI.fetchUsers();
      return res.data;
    },
  });

  // Set logged-in user on first load (user with ID 1)
  useEffect(() => {
    if (users && !loggedInUser) {
      const defaultUser = users.find((u: any) => u.id === 1);
      if (defaultUser) {  
        setLoggedInUser(defaultUser);
      }
    }
  }, [users, loggedInUser, setLoggedInUser]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-5">
        <div className="flex justify-between items-center h-16 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
              User Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* User Info */}
            {loggedInUser && (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-full font-bold text-sm flex-shrink-0">
                  {getInitials(loggedInUser.name)}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                    {loggedInUser.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {loggedInUser.email}
                  </p>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle with Radix Switch */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="text-lg hidden sm:inline">
                {darkMode ? '🌙' : '☀️'}
              </span>
              <Switch.Root
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
              >
                <Switch.Thumb className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </Switch.Root>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
